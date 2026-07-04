"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageIcon, LogOut, Save } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { fetchUserByUsername, uploadProfileImage } from "@/lib/data";
import { isValidUsername, slugify } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/ErrorState";
import { BadgeRow } from "@/components/ui/CreatorBadge";
import { ROLE_LABEL } from "@/lib/constants";

const MAX_IMG_MB = 3;

export function SettingsForm() {
  const router = useRouter();
  const toast = useToast();
  const { user, updateProfile, logout } = useAuth();

  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const pickImage = async (
    file: File | undefined,
    kind: "avatar" | "banner",
    set: (v: string) => void,
  ) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size / (1024 * 1024) > MAX_IMG_MB) {
      setError(`Images must be under ${MAX_IMG_MB}MB.`);
      return;
    }
    const url = await uploadProfileImage(user.id, kind, file);
    if (url) set(url);
    else setError("Image upload failed. Try a different file.");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const uname = slugify(username);
    if (!displayName.trim()) {
      setError("Display name can't be empty.");
      return;
    }
    if (!isValidUsername(uname)) {
      setError("Usernames are 3–20 chars: lowercase letters, numbers, underscore.");
      return;
    }
    setSaving(true);
    const clash = await fetchUserByUsername(uname);
    if (clash && clash.id !== user.id) {
      setSaving(false);
      setError("That username is already taken.");
      return;
    }
    updateProfile({
      displayName: displayName.trim(),
      username: uname,
      bio: bio.trim() || null,
      avatarUrl,
      bannerUrl,
    });
    setSaving(false);
    toast("Profile updated ✨", "success");
    router.push(`/u/${uname}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          This is how other Ziners see you.
        </p>
      </header>

      <form onSubmit={save} className="space-y-6">
        {/* Banner + avatar */}
        <div className="glass overflow-hidden rounded-3xl">
          <div className="relative h-36 w-full">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-zine-gradient opacity-40" />
            )}
            <button
              type="button"
              onClick={() => bannerInput.current?.click()}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/70"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Change banner
            </button>
            <input
              ref={bannerInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickImage(e.target.files?.[0], "banner", setBannerUrl)}
            />
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="relative -mt-12">
              <Avatar
                src={avatarUrl}
                name={displayName || user.displayName}
                size="xl"
                ring
              />
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-zine-gradient text-white shadow-glow"
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0], "avatar", setAvatarUrl)}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Profile media</p>
              <p className="text-xs text-slate-400">
                Square avatar, wide banner. Under {MAX_IMG_MB}MB each.
              </p>
              {user.badges.length > 0 && (
                <div className="mt-2">
                  <BadgeRow badges={user.badges} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text fields */}
        <div className="space-y-4">
          <Labeled label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
              className="ring-focus h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
          </Labeled>

          <Labeled label="Username">
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 pl-4">
              <span className="text-sm text-slate-500">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(slugify(e.target.value))}
                className="ring-focus h-12 w-full rounded-xl bg-transparent px-1 text-sm text-white focus:outline-none"
              />
            </div>
          </Labeled>

          <Labeled label="Bio">
            <textarea
              value={bio ?? ""}
              onChange={(e) => setBio(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="Tell Ziners what you loop…"
              className="ring-focus w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {(bio ?? "").length}/280
            </p>
          </Labeled>

          <Labeled label="Email">
            <input
              value={user.email}
              disabled
              className="h-12 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-slate-500"
            />
          </Labeled>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-slate-300">Account role</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
              {ROLE_LABEL[user.role]}
            </span>
          </div>
        </div>

        <FormError message={error} />

        <div className="flex flex-col items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              logout();
              toast("Logged out");
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}
