# Zine

**Short videos that loop different.**

Zine is a clean, fast, 6-second looping video platform for memes, gaming clips,
Roblox and Minecraft clips, edits, challenges, and creators. It's inspired by the
original Vine idea but built as its own modern platform.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**,
**Framer Motion**, **Supabase** (auth / database / storage), and **Prisma**.
Dark, glassmorphic, mobile-first.

---

## ✨ What's inside

- **Landing page** — hero, animated cards, "6-second loops are back", features,
  creator badges, challenges, and CTAs.
- **Vertical loop feed** (`/feed`) — full-screen swipe on mobile, focused card
  feed with left sidebar + right trending panel on desktop. Auto-looping,
  loop-counting player with shared mute.
- **Upload** (`/upload`) — drag & drop with real client-side validation: file
  type, size cap, and **6–10s duration enforcement** (reads the actual video
  metadata), plus an auto-captured thumbnail.
- **Auth** (`/login`, `/signup`) — username system, display name, and one-click
  demo accounts.
- **Profiles** (`/u/[username]`) — banner, avatar, bio, badges, follower counts,
  Zines + Sparked tabs.
- **Settings** (`/settings`) — edit display name, username, bio, avatar & banner.
- **Hot Loops** (`/trending`) — trending Zines ranked by loops + Sparks, filtered
  by category.
- **Challenges** (`/challenges`) — challenge hub with categories and entries.
- **Admin** (`/admin`) — role-gated moderation: view users/videos, ban, verify,
  grant badges, delete/feature/mark-trending videos, review reports, remove
  comments.

### Brand vocabulary

| Term          | Meaning                    |
| ------------- | -------------------------- |
| **Zine**      | a video                    |
| **Ziners**    | users                      |
| **Rezine**    | repost                     |
| **Spark**     | like                       |
| **Hot Loops** | the trending page          |

### Roles & badges

- **Roles:** `OWNER`, `ADMIN`, `MODERATOR`, `PARTNER`, `VERIFIED`, `USER`
  (`/admin` requires OWNER / ADMIN / MODERATOR).
- **Badges:** Verified, Partner, Founder, Staff, Early.

---

## 🚀 Getting started (demo mode)

Zine runs fully **without a backend** out of the box. Auth, uploads, likes,
follows, comments, and admin tools all work against a local mock + `localStorage`
data layer, so you can explore the whole product immediately.

```bash
# 1. install
npm install

# 2. (optional) copy env — not required for demo mode
cp .env.example .env.local

# 3. run
npm run dev
# open http://localhost:3000
```

### Try it

- Click **Sign up** to create an account, then **Upload** → *Try a sample clip*
  → post it, and watch it appear in your profile and feed.
- On **Log in**, use a **demo account** button:
  - **Owner** (`zinehq`) — full admin access at `/admin`
  - **Moderator** (`zinemod`) — moderation tools
  - **Creator** (`pixelpanda`) — a partnered creator

> In demo mode, uploaded clips play for the current session. Connect Supabase
> Storage (below) to persist real uploads.

---

## 🔌 Connecting Supabase (production mode)

The code is structured so wiring a real backend is a drop-in. The app detects a
valid Supabase config via `src/lib/supabase/config.ts` and the data seams live in
`src/lib/local-store.ts`, `src/components/providers/AuthProvider.tsx`, and the
`/api` routes.

1. **Create a project** at [supabase.com](https://supabase.com).

2. **Fill `.env.local`** from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never imported in client code)
   - `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432)

3. **Push the schema** with Prisma:

   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

   Models: `User`, `Video`, `Like`, `Comment`, `Follow`, `Report`, `Badge`,
   `UserBadge`, `Challenge` (see `prisma/schema.prisma`).

4. **Auth ↔ profiles.** Create a `profiles` row per `auth.users` row. A common
   pattern is a Postgres trigger that inserts a profile on signup, mirroring
   `auth.users.id` into `User.id`. The middleware reads `profiles.role` to gate
   `/admin`.

5. **Storage.** Create a public bucket named `zines` (or set
   `NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET`). Upload videos from the client with the
   anon key; store the resulting public URL on `Video.videoUrl`.

6. **Row Level Security.** Enable RLS on every table. Suggested policies:
   - `Video`: anyone can read where `isDeleted = false`; only the owner can
     insert/update their rows; admins can do anything.
   - `Like` / `Follow` / `Comment`: users manage their own rows.
   - `Report`: users can insert; only staff can read/update.
   - Do **destructive** admin work through server routes using the service role
     key, never from the browser.

### Where to swap mock → real

| Concern     | File                                                | Swap in                              |
| ----------- | --------------------------------------------------- | ------------------------------------ |
| Auth        | `src/components/providers/AuthProvider.tsx`         | `supabase.auth.*` + `profiles` query |
| Content     | `src/lib/local-store.ts`                            | Prisma / Supabase queries            |
| Likes/Follow| `src/lib/interactions.ts`                           | `likes` / `follows` tables           |
| Reports     | `src/app/api/reports/route.ts`                      | `supabase.from("reports").insert`    |
| Route guard | `src/middleware.ts`                                 | already Supabase-aware               |

---

## 🔐 Security notes

- **Admin routes** are protected two ways: client-side (`RequireAuth admin`) and
  server-side (`src/middleware.ts`, active once Supabase is configured, with a
  fail-closed role check).
- **Uploads are validated** client-side (type, size ≤ `NEXT_PUBLIC_MAX_UPLOAD_MB`,
  duration 6–10s). Add matching checks in a server route/RLS before persisting.
- **Rate limiting** — see `src/lib/rate-limit.ts`, applied in `/api/reports`.
  Back it with Redis for multi-instance deployments.
- **Secrets** — only `NEXT_PUBLIC_*` values reach the browser. The service role
  key is referenced solely in server contexts.

---

## 🗂️ Project structure

```
src/
├── app/                    # App Router pages + /api routes
│   ├── page.tsx            # landing
│   ├── feed/ trending/ challenges/ upload/ login/ signup/ settings/ admin/
│   ├── u/[username]/       # public profile
│   ├── api/reports/ health/
│   ├── error.tsx not-found.tsx loading.tsx globals.css layout.tsx
├── components/
│   ├── ui/                 # Button, GlassPanel, Avatar, badges, states, Modal…
│   ├── layout/             # Sidebar, RightPanel, MobileNav, AppShell…
│   ├── feed/               # VideoPlayer, FeedItem, Feed, ActionRail, cards…
│   ├── landing/            # Hero, Features, Badges, Challenges, CTA…
│   ├── auth/ profile/ settings/ upload/ trending/ challenges/ admin/
│   └── providers/          # AuthProvider, ToastProvider
└── lib/                    # types, constants, utils, mock-data, stores, supabase
```

---

## 📜 Scripts

| Script                   | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Start the dev server               |
| `npm run build`          | Production build                   |
| `npm run start`          | Serve the production build         |
| `npm run lint`           | ESLint                             |
| `npm run typecheck`      | TypeScript (no emit)               |
| `npm run prisma:generate`| Generate Prisma client             |
| `npm run prisma:push`    | Push schema to the database        |
| `npm run prisma:studio`  | Open Prisma Studio                 |

---

## 🚢 Deploy to zine.video

The app is a standard Next.js App Router project — Vercel is the smoothest host.

### 1. Push to GitHub

```bash
# from the project root (already git-initialised on `main`)
gh auth login                                   # one-time, interactive
gh repo create zine --source=. --push --private # creates the repo + pushes
# no gh? create an empty repo on github.com, then:
#   git remote add origin https://github.com/<you>/zine.git
#   git push -u origin main
```

### 2. Deploy on Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset **Next.js** is auto-detected — no build config needed.
3. Add environment variables (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL=https://zine.video`
   - the Supabase vars from `.env.example` (only once you connect a backend;
     the app deploys and runs on mock data without them).
4. Deploy.

### 3. Point zine.video at the deployment

1. Vercel → Project → **Settings → Domains → Add** → `zine.video`
   (add `www.zine.video` too if you want it).
2. At your domain registrar, set the DNS records Vercel shows you:
   - **Apex** `zine.video` → `A` record to `76.76.21.21`, **or** an `ALIAS`/`ANAME`
     to `cname.vercel-dns.com` if your registrar supports it.
   - **www** `www.zine.video` → `CNAME` to `cname.vercel-dns.com`.
3. Vercel issues the SSL certificate automatically once DNS resolves
   (usually minutes; up to a few hours for DNS propagation).

> Prefer another host (Netlify, Cloudflare Pages, a Node server via
> `npm run build && npm run start`)? All work — just set `NEXT_PUBLIC_SITE_URL`
> and point DNS at that host instead.

---

Made for the loop. © Zine.
