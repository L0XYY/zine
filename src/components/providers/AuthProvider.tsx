"use client";

// ---------------------------------------------------------------------------
// Auth context — real Supabase Auth when configured, localStorage mock otherwise.
// The public shape (user, loading, login, signup, logout, updateProfile) is the
// same in both modes, so nothing downstream cares which is active.
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  SESSION_KEY,
  allUsers,
  findUserByEmail,
  findUserByUsername,
  saveLocalUser,
} from "@/lib/local-store";
import { elevateFounder } from "@/lib/constants";
import { isValidEmail, isValidUsername } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { rowToUser } from "@/lib/supabase/mappers";
import { clearInteractions, hydrateInteractions } from "@/lib/interactions";
import type { User } from "@/lib/types";

interface SignupInput {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (input: SignupInput) => Promise<{ error?: string }>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SUPA = isSupabaseConfigured();

async function fetchProfile(
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  id: string,
): Promise<User | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data } = await client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) return elevateFounder(rowToUser(data));
    // The signup trigger may lag by a beat — retry once.
    await new Promise((r) => setTimeout(r, 400));
  }
  return null;
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("already registered") || m.includes("already been"))
    return "That email is already registered.";
  if (m.includes("confirm")) return "Please confirm your email, then log in.";
  return msg;
}

function mapProfilePatch(patch: Partial<User>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.displayName !== undefined) out.display_name = patch.displayName;
  if (patch.username !== undefined) out.username = patch.username;
  if (patch.bio !== undefined) out.bio = patch.bio;
  if (patch.avatarUrl !== undefined) out.avatar_url = patch.avatarUrl;
  if (patch.bannerUrl !== undefined) out.banner_url = patch.bannerUrl;
  return out;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the user's likes/follows whenever the account changes.
  useEffect(() => {
    void hydrateInteractions(user);
  }, [user]);

  // --- Session bootstrap + auth listener ---
  useEffect(() => {
    if (SUPA) {
      const client = getSupabaseBrowserClient();
      if (!client) {
        setLoading(false);
        return;
      }
      let unsub = () => {};
      (async () => {
        const {
          data: { session },
        } = await client.auth.getSession();
        if (session?.user) setUser(await fetchProfile(client, session.user.id));
        setLoading(false);
        const { data: sub } = client.auth.onAuthStateChange(
          async (_event, sess) => {
            if (sess?.user) setUser(await fetchProfile(client, sess.user.id));
            else setUser(null);
          },
        );
        unsub = () => sub.subscription.unsubscribe();
      })();
      return () => unsub();
    }

    // mock mode
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const { userId } = JSON.parse(raw) as { userId: string };
        const match = allUsers().find((u) => u.id === userId) ?? null;
        if (match) setUser(match);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persistMock = useCallback((u: User | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: u.id }));
    else window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async (email, password) => {
    if (!isValidEmail(email)) return { error: "Enter a valid email address." };
    if (!password || password.length < 6)
      return { error: "Password must be at least 6 characters." };

    if (SUPA) {
      const client = getSupabaseBrowserClient()!;
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: friendlyAuthError(error.message) };
      const p = data.user ? await fetchProfile(client, data.user.id) : null;
      if (p?.banned) {
        await client.auth.signOut();
        return { error: "This account has been banned." };
      }
      setUser(p);
      return {};
    }

    const found = findUserByEmail(email);
    if (!found)
      return {
        error: "No Ziner found with that email. Sign up to get started.",
      };
    if (found.banned) return { error: "This account has been banned." };
    persistMock(found);
    return {};
  }, [persistMock]);

  const signup = useCallback<AuthContextValue["signup"]>(async (input) => {
    const username = input.username.trim().toLowerCase();
    if (!isValidEmail(input.email))
      return { error: "Enter a valid email address." };
    if (!isValidUsername(username))
      return {
        error:
          "Usernames are 3–20 chars: lowercase letters, numbers, underscore.",
      };
    if (!input.displayName.trim()) return { error: "Add a display name." };
    if (input.password.length < 6)
      return { error: "Password must be at least 6 characters." };

    if (SUPA) {
      const client = getSupabaseBrowserClient()!;
      const { data: taken } = await client
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .maybeSingle();
      if (taken) return { error: "That username is taken." };

      const { data, error } = await client.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { username, display_name: input.displayName.trim() },
        },
      });
      if (error) return { error: friendlyAuthError(error.message) };
      if (!data.session) {
        return {
          error:
            "Almost there — check your email to confirm your account, then log in.",
        };
      }
      const p = data.user ? await fetchProfile(client, data.user.id) : null;
      setUser(p);
      return {};
    }

    if (findUserByEmail(input.email))
      return { error: "That email is already registered." };
    if (findUserByUsername(username))
      return { error: "That username is taken." };
    const newUser: User = {
      id: `u_local_${Date.now()}`,
      email: input.email.trim(),
      username,
      displayName: input.displayName.trim(),
      avatarUrl: `https://i.pravatar.cc/200?u=${username}`,
      bannerUrl: null,
      bio: null,
      role: "USER",
      verified: false,
      partnered: false,
      banned: false,
      badges: ["EARLY"],
      followers: 0,
      following: 0,
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(newUser);
    persistMock(elevateFounder(newUser));
    return {};
  }, [persistMock]);

  const logout = useCallback(() => {
    if (SUPA) {
      const client = getSupabaseBrowserClient();
      void client?.auth.signOut();
      setUser(null);
    } else {
      persistMock(null);
    }
    clearInteractions();
  }, [persistMock]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    (patch) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (SUPA) {
          const client = getSupabaseBrowserClient();
          void client?.from("profiles").update(mapProfilePatch(patch)).eq("id", prev.id);
        } else {
          saveLocalUser(next);
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, signup, logout, updateProfile }),
    [user, loading, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
