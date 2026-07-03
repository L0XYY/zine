"use client";

// ---------------------------------------------------------------------------
// Auth context.
//
// Demo mode (default): session lives in localStorage and is validated against
// the local + mock user store. Fully functional without a backend.
//
// Connecting Supabase: swap the bodies of `login`, `signup`, `logout` for
// `supabase.auth.signInWithPassword` / `signUp` / `signOut` and hydrate `user`
// from your `profiles` table. The component's public shape stays identical, so
// nothing downstream changes. See getSupabaseBrowserClient().
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
import { isValidEmail, isValidUsername } from "@/lib/utils";
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
  loginAs: (username: string) => Promise<{ error?: string }>;
  signup: (input: SignupInput) => Promise<{ error?: string }>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from a stored session on first mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const { userId } = JSON.parse(raw) as { userId: string };
        const match = allUsers().find((u) => u.id === userId) ?? null;
        if (match) setUser(match);
      }
    } catch {
      /* ignore malformed session */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: u.id }));
    else window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      await tick();
      if (!isValidEmail(email)) return { error: "Enter a valid email address." };
      if (!password || password.length < 6)
        return { error: "Password must be at least 6 characters." };
      const found = findUserByEmail(email);
      if (!found)
        return {
          error:
            "No Ziner found with that email. Try a demo account below, or sign up.",
        };
      if (found.banned) return { error: "This account has been banned." };
      persist(found);
      return {};
    },
    [persist],
  );

  const loginAs = useCallback<AuthContextValue["loginAs"]>(
    async (username) => {
      await tick();
      const found = findUserByUsername(username);
      if (!found) return { error: "Demo account not found." };
      persist(found);
      return {};
    },
    [persist],
  );

  const signup = useCallback<AuthContextValue["signup"]>(
    async (input) => {
      await tick();
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
      if (findUserByEmail(input.email))
        return { error: "That email is already registered." };
      if (findUserByUsername(username))
        return { error: "That username is taken." };

      const now = new Date().toISOString();
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
        createdAt: now,
      };
      saveLocalUser(newUser);
      persist(newUser);
      return {};
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveLocalUser(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, loginAs, signup, logout, updateProfile }),
    [user, loading, login, loginAs, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// tiny delay so buttons show a realistic loading state
function tick() {
  return new Promise((r) => setTimeout(r, 350));
}
