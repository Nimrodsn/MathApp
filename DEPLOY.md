# Deploy Math Master 5U (GitHub + Vercel)

Repository: [https://github.com/Nimrodsn/MathApp](https://github.com/Nimrodsn/MathApp)

Every push to **`main`** can trigger a new production deployment after you connect Vercel once.

Secrets stay out of git: use `.env.local` locally and Vercel **Environment Variables** in production (see [`.env.example`](.env.example)).

---

## 1. Vercel (one-time)

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New Project** → **Import** `Nimrodsn/MathApp`.
3. Framework: **Next.js** (default). Build: `npm run build`. Output: default.
4. Open **Settings → Environment Variables** and add (Production; add Preview too if you use preview deployments):

   | Name | Notes |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server only; never expose in client code |
   | `ADMIN_EMAIL` | Must match the admin user’s email exactly |
   | `ANTHROPIC_API_KEY` | **Required on Vercel for semantic grading** (paraphrases, `1/2` vs `0.5`, units, Hebrew wording). Create a key in [Anthropic Console](https://console.anthropic.com/), add it here for **Production** (and Preview if needed), then **Redeploy** so serverless picks it up. Server-only; never expose to the client. |
   | `ANTHROPIC_MODEL` | Optional; default `claude-3-5-haiku-20241022`. Haiku is cheaper/faster; use a current **Sonnet** model id from Anthropic’s docs if you need heavier reasoning (higher cost/latency). |

   If `ANTHROPIC_API_KEY` is **unset**, submissions still work but use **strict normalized string match only** (no Claude). The app also applies a small **numeric/fraction** equivalence check without the API; true semantic checks need the key on each environment (local `.env.local` and Vercel env vars).

   **Riddle images (optional):** The `riddle-images` storage bucket and the `riddle images select public` policy in [`supabase/schema.sql`](supabase/schema.sql) must exist so admin uploads are stored and the daily riddle can show them. Admin uploads use `SUPABASE_SERVICE_ROLE_KEY` (server only). The app allows image uploads up to **~10 MB** per form (`serverActions.bodySizeLimit` in [`next.config.ts`](next.config.ts)).

   **Do not** set `ALLOW_SELF_SIGNED_CERTS=true` on Vercel (local TLS workaround only). Leave it unset or `false`.

5. **Deploy**. Copy your production URL (e.g. `https://<project>.vercel.app`).

6. **Production branch**: Project → Settings → Git → confirm **Production Branch** is `main`.

After this, each `git push origin main` from your machine triggers a new deployment automatically.

---

## 2. Supabase (required for production auth)

Use the **same** Supabase project as local, or a dedicated production project with the same schema ([`supabase/schema.sql`](supabase/schema.sql)).

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL configuration**.
2. Set **Site URL** to your **Vercel production URL** (exact match, including `https://`).
3. Under **Redirect URLs**, add the same URL (and any preview URLs like `https://*.vercel.app` if you use password reset / magic links from preview builds).

Without this, email links and some redirects may still point at `localhost`.

4. **Ranked scoring:** Run once in the Supabase **SQL Editor** on each project (production and any shared dev DB). Copy the full contents of [`supabase/migrations/20260518_ranked_scoring.sql`](supabase/migrations/20260518_ranked_scoring.sql). This adds `solve_rank` / `awarded_points` and the `award_correct_submission` function (1st correct solver on a riddle = 10 pts, 2nd = 9, … 10th+ = 1). Redeploy Vercel after applying. Existing past solves are not recalculated.

5. **Profile avatars:** Projects created before `avatar_icon` existed should run this once in the Supabase **SQL Editor** (safe to re-run: `add column if not exists` no-ops). **When the app adds new avatar ids**, run the full block again (or only the `drop constraint` / `add constraint` lines) so the `CHECK` matches the latest list in this doc.

```sql
alter table public.profiles add column if not exists avatar_icon text;

update public.profiles set avatar_icon = 'user-circle' where avatar_icon is null;

alter table public.profiles alter column avatar_icon set default 'user-circle';
alter table public.profiles alter column avatar_icon set not null;

alter table public.profiles drop constraint if exists profiles_avatar_icon_check;
alter table public.profiles add constraint profiles_avatar_icon_check check (
  avatar_icon in (
    'user-circle',
    'brain',
    'trophy',
    'sparkles',
    'rocket',
    'atom',
    'graduation-cap',
    'lightbulb',
    'star',
    'heart',
    'flame',
    'compass',
    'calculator',
    'gem',
    'target',
    'infinity'
  )
);
```

### 2b. Production checklist: profile avatars (Vercel + Supabase)

Avatars are stored in Postgres on **`profiles.avatar_icon`** for every environment that uses your Supabase keys. There is no separate “local only” store—the live app at [https://math-app-orpin.vercel.app](https://math-app-orpin.vercel.app) uses the same code path once the steps below are done.

| Step | Where | What to do |
|------|--------|------------|
| **1. Deploy** | GitHub + Vercel | Push the branch Vercel builds (usually **`main`**). Wait until the deployment **Build** succeeds. In the build output, confirm the **Route** list includes **`/profile`**. |
| **2. Env** | Vercel → Project → **Settings** → **Environment Variables** | For **Production**, confirm **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** match the Supabase project where students’ data lives (same values as a working `.env.local` for that project). After changing env vars, trigger a **Redeploy**. |
| **3. SQL** | Supabase → **SQL Editor** | On **that same project**, run the SQL block in **step 5** above (adds `avatar_icon`, default, `NOT NULL`, `CHECK`). Run once per project; safe to re-run. |
| **4. Auth URLs** | Supabase → **Authentication** → **URL configuration** | **Site URL:** `https://math-app-orpin.vercel.app` (use your real production hostname if it differs). **Redirect URLs:** add `https://math-app-orpin.vercel.app/**` and, if you use Vercel previews, `https://*.vercel.app/**`. |
| **5. Smoke test** | Live site | Sign in → **Profile** (or `/profile`) → choose an icon → **Save icon** → hard refresh → header shows the icon; open **Leaderboard** and confirm the icon appears next to your name. |

---

## 3. Verify

- [ ] GitHub shows latest commit on `main`.
- [ ] Vercel shows a successful deployment for that commit.
- [ ] Open the live URL: sign in, daily riddle, leaderboard, admin (admin email).
- [ ] Profile avatars: completed the **2b** table (deploy, env, SQL, auth URLs) and smoke test on the production URL.

---

## 4. Daily workflow

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

Wait for Vercel to finish building, then refresh the live site.
