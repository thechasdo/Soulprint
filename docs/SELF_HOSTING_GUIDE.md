# 🌐 Soulprint Self-Hosting Guide (Coolify & VPS)

This guide provides step-by-step instructions on how to host the **Soulprint Platform** completely independently on your own virtual private server (VPS) using **Coolify**. 

**Coolify** is a self-hosted, open-source platform (like Heroku or Vercel) that you run on your own server. It handles automatic SSL certificates, Docker deployments, database backups, and custom domains with zero subscription fees.

---

## 📋 Prerequisites
1. **A Virtual Private Server (VPS):**
   * **Recommended Providers:** Hetzner, DigitalOcean, Linode (Akamai), or Vultr.
   * **Minimum Specs:** 2 vCPUs, 2 GB RAM, 40 GB SSD (e.g., DigitalOcean's $12-$14/mo droplet or Hetzner's €6/mo cloud server).
   * **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS (clean install).
2. **A Custom Domain:** (e.g., `yoursoulprint.com`) with access to your DNS provider (e.g., Cloudflare, Namecheap, GoDaddy).

---

## 🛠️ Step 1: Install Coolify on Your VPS
1. SSH into your clean Ubuntu VPS:
   ```bash
   ssh root@your_server_ip
   ```
2. Run the official Coolify installation script:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. Once the installation completes (usually takes 2-3 minutes), Coolify will print a URL:
   * **URL:** `http://your_server_ip:8000`
4. Open this URL in your browser, create your admin account, and complete the onboarding.

---

## 🔑 Step 2: Configure Your Domain (DNS)
To point your domain to your VPS, add the following records to your DNS manager (e.g., Cloudflare):

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `your_server_ip` | Auto / 10 min |
| **A** | `www` | `your_server_ip` | Auto / 10 min |
| **A** | `coolify` | `your_server_ip` | Auto / 10 min |

*(Note: `coolify.yourdomain.com` lets you access your Coolify panel securely via HTTPS instead of the raw IP port 8000).*

---

## 🚀 Step 3: Deploy the Soulprint Next.js App

1. In your Coolify dashboard, click on **Sources** and connect your **GitHub account**.
2. Click on **Projects -> Create New Project**.
3. Inside your project, click **+ New Resource** and select **Public/Private Repository**.
4. Select your `soulprint-platform` repository and the `main` branch.
5. Coolify will automatically detect the `Dockerfile` we provided! It will set the build pack to **Dockerfile**.
6. **Configure the Domain:**
   * Under **Domains**, enter your domain name: `https://yoursoulprint.com` (Coolify will automatically provision a free, auto-renewing Let's Encrypt SSL certificate!).
7. **Add Environment Variables:**
   Under **Environment Variables**, add the following:
   * `NEXT_PUBLIC_SUPABASE_URL` (Your Supabase Cloud project URL)
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Your Supabase Cloud public key)
   * `NEXT_PUBLIC_SITE_URL` (`https://yoursoulprint.com`)
   * `SUPABASE_SERVICE_ROLE_KEY` (Your Supabase service role key)
   * `STRIPE_SECRET_KEY` (Your Stripe production API secret key)
   * `STRIPE_WEBHOOK_SECRET` (Your Stripe production webhook signing secret)
   * `STRIPE_PRICE_FAMILY_LEGACY_MONTHLY`
   * `STRIPE_PRICE_FAMILY_LEGACY_YEARLY`
   * `STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY`
   * `STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY`
8. Click **Deploy**! Coolify will pull your code, build the optimized Docker container, set up the reverse proxy, provision the SSL certificate, and launch your site.

---

## 🗄️ Step 4: Connecting Your Database

You have two choices for your database:

### Option A: Use Supabase Cloud (Recommended)
Keep your database on Supabase's cloud hosting (they have a very generous free tier, and their $25/mo Pro tier is excellent).
* **Why:** You get automated cloud backups, global scaling, and a managed database without any server overhead.
* **How:** Simply paste your Supabase cloud credentials into Coolify's environment variables (as done in Step 3).

### Option B: Self-Host PostgreSQL / Supabase on Coolify
If you want to host your database on your *own* VPS too, you can spin up a PostgreSQL database inside Coolify with one click:
1. In Coolify, click **+ New Resource -> Database -> PostgreSQL**.
2. Coolify will run PostgreSQL in a separate Docker container on your VPS.
3. Grab the connection string, apply your SQL schema migration (`supabase/migrations/20260529000000_soulprint_secure_schema.sql`), and update your Next.js environment variables.
4. **Backups:** Under the PostgreSQL resource in Coolify, go to **Backups** and schedule daily backups to your own S3 bucket (or Backblaze B2) for complete data safety.

---

## 🛡️ Maintenance & Security Best Practices
* **Server Updates:** Keep your Ubuntu VPS updated by running `sudo apt update && sudo apt upgrade -y` once a month.
* **Backups:** Always back up your database. If self-hosting PostgreSQL, use Coolify's built-in S3 backup feature. If using Supabase Cloud, leverage their built-in automated backups.
* **Capping Resources:** Set memory and CPU limits on your Coolify resources to ensure your Next.js app doesn't consume all your server resources under heavy load.

Congratulations! You are now running a fully independent, production-grade SaaS platform with **zero vendor lock-in** and **zero monthly subscription overhead** for hosting.
