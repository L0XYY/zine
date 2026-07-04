# Connecting Zine to Supabase (the real backend)

This turns Zine from a per-browser demo into a real shared platform: one feed
for everyone, accounts that work across devices, secure owner/admin, real search,
and permanent video hosting.

## Step 1 — Create the project (2 min)

1. Go to **[supabase.com](https://supabase.com)** → sign in → **New project**.
2. Name it `zine`, pick the region closest to you, set a **database password**
   (save it somewhere), and create it. Wait ~1 min for it to provision.

## Step 2 — Run the schema (30 sec)

1. In the project: left sidebar → **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](./schema.sql) from this repo, copy **all** of it,
   paste into the editor, and click **Run**. You should see "Success".
   - This creates every table, the auto-profile trigger (which reserves
     **@loxy** as the OWNER), Row Level Security, and the `zines` storage bucket.

## Step 3 — Grab your keys

Project **Settings → API**:

- **Project URL** — looks like `https://abcd1234.supabase.co`
- **anon public** key — a long `eyJ...` string (safe to expose to the browser)
- **service_role** key — also `eyJ...` (SECRET — server only, never in the browser)

Project **Settings → Database → Connection string → URI**:

- The **connection string** (`postgresql://...`) for migrations, if you use Prisma.

## Step 4 — Add environment variables

Locally, in `.env.local` (copy from `.env.example`); on **Vercel** in
**Settings → Environment Variables** (then redeploy):

```
NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # service_role (secret)
NEXT_PUBLIC_SITE_URL=https://zine.video
```

The app already detects these via `isSupabaseConfigured()` and will switch off
the mock/localStorage layer automatically once they're present.

## Step 5 — Make yourself the owner

After the schema is in place, **sign up on the site with username `loxy`** — the
trigger makes that account OWNER + Founder automatically. (Prefer a different
handle? Tell me and I'll change the reserved username in the schema + code.)

---

**What I need from you to wire + test it:** paste the **Project URL** and the
**anon public** key here. That's enough for me to connect auth, data, search, and
uploads and verify them against your live project. The `service_role` key stays
secret — set it directly in Vercel; you don't need to send it to me.
