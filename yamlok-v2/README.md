# YAMLOK v2 — Production Portfolio Site

A full-stack Next.js 14 gaming portfolio with a password-protected admin panel.
Built with TypeScript, Tailwind CSS, NextAuth.js, and Framer Motion.

---

## 🚀 Deploy to Vercel (free, recommended)

Follow these steps in order. The whole process takes about 10 minutes.

---

### Step 1 — Push the repo to GitHub

1. Go to [github.com/new](https://github.com/new) and create a **new private repository** (e.g. `yamlok-portfolio`)
2. In your terminal, from the root of this project:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/yamlok-portfolio.git
git push -u origin main
```

---

### Step 2 — Create a free Upstash Redis database (for visitor analytics)

1. Go to [upstash.com](https://upstash.com) → Sign up free
2. Click **Create Database** → choose **Redis** → pick the free tier → any region
3. Open the database → click the **REST API** tab
4. Copy the two values:
   - `UPSTASH_REDIS_REST_URL`  (looks like `https://xxxxxxx.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN` (a long token string)

Keep these — you'll paste them into Vercel in Step 4.

---

### Step 3 — Create a GitHub Personal Access Token (for admin saves)

This lets the admin panel commit changes directly to your GitHub repo so they survive redeploys.

1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=repo)
2. Give it a name like `yamlok-admin`
3. Tick the **`repo`** scope only
4. Click **Generate token** and copy it immediately

---

### Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository** → select your `yamlok-portfolio` repo
3. Vercel will auto-detect Next.js. Leave all build settings as-is.
4. Click **Environment Variables** and add **all of the following**:

| Variable | Value |
|---|---|
| `NEXTAUTH_SECRET` | Any 32+ character random string — generate one at [generate-secret.vercel.app](https://generate-secret.vercel.app/32) |
| `NEXTAUTH_URL` | Your Vercel URL — e.g. `https://yamlok.vercel.app` (you can update this after first deploy) |
| `ADMIN_PASSWORD` | The password to log into `/admin` — e.g. `yamlok2025` |
| `RESET_TOKEN` | A secret string your friend uses to reset the password — e.g. any random word |
| `GITHUB_TOKEN` | The token you created in Step 3 |
| `GITHUB_REPO` | Your repo in `username/reponame` format — e.g. `YamRajSingh13/yamlok-portfolio` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_MEDIA_PATH` | `yamlok-v2/public/media.json` |
| `UPSTASH_REDIS_REST_URL` | From Step 2 |
| `UPSTASH_REDIS_REST_TOKEN` | From Step 2 |
| `IMGBB_API_KEY` | Free key from [api.imgbb.com](https://api.imgbb.com/) — for image uploads |

5. Click **Deploy** 🚀

---

### Step 5 — Update NEXTAUTH_URL

After the first deploy Vercel gives you a URL like `https://yamlok-xyz.vercel.app`.

1. Go to your Vercel project → **Settings → Environment Variables**
2. Update `NEXTAUTH_URL` to your exact URL (no trailing slash)
3. Go to **Deployments** → click the three dots on the latest deploy → **Redeploy**

Your site is now live!

---

### Step 6 — (Optional) Add a custom domain

In Vercel → **Settings → Domains** → add your domain and follow the DNS instructions.

---

## ✏️ How the admin panel works on Vercel

When your friend logs into `/admin` and clicks **Save & Publish**:

1. The changes are **committed directly to your GitHub repo** (via the GitHub API)
2. Vercel detects the new commit and **automatically redeploys** (takes ~60 seconds)
3. The live site updates with the new content

This means the admin panel is fully functional with zero filesystem access.

---

## 🔑 How to change the admin password

### Option A — Forgot password (from the login page)
1. Go to `/admin/login` → click **Forgot password?**
2. Enter the `RESET_TOKEN` value you set in Vercel
3. Set a new password
4. The page will show you the bcrypt hash of the new password
5. Copy that hash → Vercel dashboard → Environment Variables → update `ADMIN_PASSWORD` → Redeploy

### Option B — Direct update
1. Vercel dashboard → Project Settings → Environment Variables
2. Update `ADMIN_PASSWORD` to your new password (plain text is fine)
3. Redeploy

---

## 🏃 Run locally

```bash
cd yamlok-v2
npm install
cp .env.local.example .env.local
# Fill in .env.local with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — main site
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel

> **Note:** When running locally, `GITHUB_TOKEN` + `GITHUB_REPO` must be set in `.env.local`
> for admin saves to work (they push to GitHub just like production).

---

## 📁 Project Structure

```
yamlok-v2/
├── public/
│   └── media.json          ← Images & videos (committed to GitHub)
├── src/
│   ├── app/
│   │   ├── (site)/          ← Public pages: home, about, portfolio, video, contact
│   │   ├── admin/           ← Protected admin dashboard + login
│   │   └── api/
│   │       ├── auth/        ← NextAuth
│   │       ├── media/       ← GET media.json / POST → push to GitHub
│   │       ├── visitors/    ← Analytics (Upstash Redis)
│   │       ├── upload/      ← Image upload proxy → ImgBB
│   │       └── reset-password/
│   ├── components/
│   │   ├── sections/        ← Hero, Portfolio, Video, About, Contact, Header, Footer
│   │   ├── admin/           ← AdminDashboard, LoginForm
│   │   └── ui/              ← Lightbox, VisitorTracker, ConfirmModal, etc.
│   ├── lib/
│   │   ├── siteConfig.ts    ← ✏️ Edit this to change site name, bio, socials
│   │   └── utils.ts
│   ├── types/media.ts       ← TypeScript types for all media data
│   └── middleware.ts        ← Protects /admin routes (NextAuth)
vercel.json                  ← Vercel deployment config
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v4 (JWT) |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit |
| Notifications | react-hot-toast |
| Image hosting | ImgBB (free) |
| Analytics storage | Upstash Redis (free) |
| Deployment | Vercel (free tier) |
| Media persistence | GitHub API |
