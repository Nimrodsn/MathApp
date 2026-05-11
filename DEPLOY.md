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

---

## 3. Verify

- [ ] GitHub shows latest commit on `main`.
- [ ] Vercel shows a successful deployment for that commit.
- [ ] Open the live URL: sign in, daily riddle, leaderboard, admin (admin email).

---

## 4. Daily workflow

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

Wait for Vercel to finish building, then refresh the live site.
