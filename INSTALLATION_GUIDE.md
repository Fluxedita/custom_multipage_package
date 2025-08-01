# 🚀 Installation Guide: Getting Started with Fluxedita Portfolio

Welcome! This guide will walk you through setting up the project from scratch, even if you're new to Node.js, Next.js, or Supabase. Follow each step carefully and you'll have the app running locally in no time.

---

## 1. Clone the Repository

First, download the project code from GitHub:

```bash
git clone https://github.com/jamescroanin/fluxedita.git
cd fluxedita
```

---

## 2. Install Node.js (if you don't have it)

- Download and install Node.js (LTS version recommended) from [nodejs.org](https://nodejs.org/).
- After installation, check your version:
  ```bash
  node -v
  npm -v
  ```
  You should see Node.js v18+ and npm v9+ (or similar).

---

## 3. Install Project Dependencies

In your project folder, run:

```bash
npm install
```
This will download all required packages.

---


## 4. Set Up Environment Variables (see the env.example file in your directory and rename it to .env.local)

The app uses a `.env.local` file for configuration. Start by copying the example file:

```bash
cp env.example .env.local
```

Open `.env.local` in a text editor. You'll see fields like:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_SECRET=
# ...
```

### **Required Fields**

#### **Supabase**
- **NEXT_PUBLIC_SUPABASE_URL**: Go to your [Supabase project dashboard](https://app.supabase.com/), select your project, and copy the Project URL.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: In the same dashboard, go to Project Settings → API, and copy the `anon` public key.
- **SUPABASE_SERVICE_ROLE_KEY**: (For admin scripts) In Project Settings → API, copy the `service_role` key. **Never expose this key in frontend code!**

#### **Cloudinary**
- **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**: Log in to [Cloudinary](https://cloudinary.com/), go to Dashboard, and copy your Cloud Name.
- **CLOUDINARY_API_SECRET**: In Cloudinary Dashboard, copy your API Secret (keep this private).
- **NEXT_PUBLIC_CLOUDINARY_API_KEY** and **CLOUDINARY_API_KEY**: Copy your API Key from Cloudinary Dashboard. (Some features use the public key, some use the secret.)
- **NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET**: (If used) Create an unsigned upload preset in Cloudinary and paste its name here.

#### **Database**
- **DATABASE_URL**: (Optional for most devs) Only needed if you want to connect directly to the database (e.g., for scripts or local Postgres).

#### **Stripe (Optional)**
- If you want to test payments, fill in the Stripe keys. Otherwise, you can leave these blank for local development.

---

## 5. (Optional) Set Up Supabase Locally

If you want to run Supabase locally (for full offline dev):
- Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
- Start Supabase:
  ```bash
  supabase start
  ```
- Run the SQL setup scripts as described in `supabase/SETUP_README.md`.
- For most users, using the hosted Supabase project is easier.

---

## Note on Docker and Supabase CLI

When you run `supabase start`, the Supabase CLI automatically uses Docker to run the database and all required Supabase services locally. **You do not need to create or manage your own Dockerfile or docker-compose.yml for this project.**

- The CLI will pull and run the official Supabase containers for you (Postgres, API, Studio, Storage, etc.).
- You just need Docker installed and running on your machine.
- All configuration is handled by the Supabase CLI and your `supabase/` directory.
- This makes local development much easier than managing Dockerfiles manually!

**Tip:**
If you want to see the running containers, use:
```bash
docker ps
```

For more details, see the [Supabase CLI Docker docs](https://supabase.com/docs/guides/hosting/docker).

---

## 6. Run the Application

Start the development server:

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.
- You should see the homepage. If you see errors, check your `.env.local` values and the terminal output.

---

## 7. (Optional) Seed Initial Data

To create default pages and content, run:

```bash
node scripts/init-homepage-data.js
```
- This will create the homepage and other essential pages with placeholder content.
- You can re-run this script after a fresh database setup or when adding new core pages.

---

## 8. Troubleshooting & Common Issues

- **Missing or invalid environment variables:** Double-check your `.env.local` file. Make sure there are no extra spaces or missing values.
- **Supabase/Cloudinary errors:** Ensure your keys are correct and your Supabase/Cloudinary projects are active.
- **Port already in use:** If `localhost:3000` is busy, stop other apps or change the port in `package.json` or with `PORT=3001 npm run dev`.
- **Database connection issues:** Make sure your Supabase project is running and accessible.
- **Other errors:** Check the terminal output and browser console for details. Most issues are due to misconfigured environment variables.

---

## 9. Where to Get Help

- Check the main [README.md](./README.md) for more details on features and architecture.
- See [`supabase/SETUP_README.md`](./supabase/SETUP_README.md) for advanced database setup.
- **For first user and admin setup, see [`supabase/FIRST_USER_SETUP.md`](./supabase/FIRST_USER_SETUP.md).**
- **For details on API routes, access control, and user roles, see the [README.md](./README.md) and [`supabase/SETUP_README.md`](./supabase/SETUP_README.md).**
- Open an issue on [GitHub](https://github.com/jamescroanin/fluxedita/issues) if you get stuck.
- Contact the development team at support@your-domain.com (if available).

---

**You're ready to start building! 🎉** 