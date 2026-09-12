# YAMLOK v2 — Production Portfolio Site

A full-stack Next.js 14 gaming portfolio with a password-protected admin panel.
Built with TypeScript, Tailwind CSS, NextAuth.js, and framer-motion.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd yamlok-v2
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Then open `.env.local` and fill in:

| Variable | What it is |
|---|---|
| `NEXTAUTH_SECRET` | Any 32+ character random string (e.g. run `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your site URL, e.g. `http://localhost:3000` or `https://yoursite.com` |
| `ADMIN_PASSWORD` | The password your friend uses to log in to `/admin` |
| `GITHUB_TOKEN` | A GitHub Personal Access Token with `repo` scope |
| `GITHUB_REPO` | Your repo, e.g. `YamRajSingh13/yamlok-v2` |
| `GITHUB_BRANCH` | Branch to push to, usually `main` |
| `GITHUB_MEDIA_PATH` | Path inside repo, usually `public/media.json` |
| `IMGBB_API_KEY` | Free key from https://api.imgbb.com/ for image uploads |

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — main site  
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel

### 4. Deploy to Vercel (recommended, free)
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Add all `.env.local` variables in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy!

---

## 📁 Project Structure

```
yamlok-v2/
├── public/
│   └── media.json          ← All images & videos live here
├── src/
│   ├── app/
│   │   ├── page.tsx         ← Main site (server component, reads media.json)
│   │   ├── layout.tsx       ← Root layout (fonts, Toaster)
│   │   ├── globals.css      ← Global styles + Tailwind
│   │   ├── admin/
│   │   │   ├── page.tsx     ← Admin dashboard (protected)
│   │   │   └── login/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  ← NextAuth
│   │       ├── media/route.ts               ← GET/POST media.json + GitHub push
│   │       └── upload/route.ts              ← Image upload proxy → ImgBB
│   ├── components/
│   │   ├── sections/        ← Hero, Portfolio, Video, About, Contact, etc.
│   │   ├── admin/           ← AdminDashboard, LoginForm
│   │   └── ui/              ← Lightbox, SparksCanvas, CursorRing
│   ├── lib/
│   │   ├── siteConfig.ts    ← ✏️ Edit this to change site text/links
│   │   └── utils.ts
│   ├── types/media.ts
│   └── middleware.ts        ← Protects /admin routes
```

---

## ✏️ How to customise site content (no code needed)

### Change text, bio, social links
Open [`src/lib/siteConfig.ts`](src/lib/siteConfig.ts) and edit the values. Every field has a comment explaining what it does.

### Add/remove portfolio images or videos
Go to `/admin` in the browser, log in, and use the dashboard.

---

## 🔐 Admin Panel — How it works

1. Go to `/admin` — you'll be redirected to `/admin/login`
2. Enter the password from `ADMIN_PASSWORD` in your `.env.local`
3. The panel lets you:
   - Add images by URL or drag-and-drop file upload (proxied via server → ImgBB)
   - Add YouTube videos (paste full URL or just the video ID)
   - Add direct video URLs (Google Drive, Streamable, Dropbox, etc.)
   - Drag rows to reorder everything
   - Click ✕ to remove any item
4. Click **💾 Save & Publish** — this:
   - Saves `public/media.json` on the server
   - Pushes it to GitHub via the API (if `GITHUB_TOKEN` + `GITHUB_REPO` are set)
   - The live Vercel site auto-redeploys from the GitHub push

---

## 🔒 Security Notes

- Passwords are validated **server-side only** via NextAuth.js — never in the browser
- The ImgBB API key is stored in `.env.local` and proxied server-side — never exposed to the browser
- The GitHub token is server-side only
- Admin routes are protected by `next-auth/middleware` — unauthenticated requests are redirected to `/admin/login`

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v4 (JWT sessions) |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |
| Notifications | react-hot-toast |
| Image hosting | ImgBB (free) |
| Deployment | Vercel (free tier) |
