# How to Deploy AppStudioX on Netlify + Map appstudiox.com from GoDaddy

Complete step-by-step guide to get `appstudiox.com` live in under 30 minutes.

---

## Step 1 — Deploy to Netlify (2 minutes)

### Option A — Drag & Drop (Fastest)
1. Go to **[app.netlify.com](https://app.netlify.com)** and sign up / log in (free account)
2. On the dashboard, look for the **"Deploy manually"** box at the bottom
3. **Drag the entire project folder** (containing `index.html`, `css/`, `js/`) and drop it onto that box
4. Netlify instantly gives you a URL like `random-name-123.netlify.app` — your site is live!

### Option B — Connect GitHub (Recommended for future updates)
1. Push this repo to your GitHub account
2. In Netlify → **"Add new site"** → **"Import an existing project"**
3. Connect GitHub → Select the repo → Click **"Deploy"**
4. Every time you push code, Netlify auto-deploys ✅

---

## Step 2 — Add Your Custom Domain on Netlify (3 minutes)

1. In Netlify, go to your site → **"Domain management"** → **"Add a domain"**
2. Type `appstudiox.com` → Click **"Verify"** → **"Add domain"**
3. Also add `www.appstudiox.com`
4. Netlify will show you DNS records to configure — **keep this tab open**

---

## Step 3 — Configure GoDaddy DNS (10 minutes)

Log in to GoDaddy → **My Products** → Find `appstudiox.com` → **DNS** (Manage DNS)

### Delete any existing A records and CNAME for www, then add:

#### Option A — Use Netlify Nameservers (EASIEST — full control to Netlify)

In GoDaddy → **"Nameservers"** → **"Change"** → **"Enter my own nameservers"**

Enter the 4 Netlify nameservers shown in your Netlify domain settings, e.g.:
```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```
> ⚠️ Your exact nameservers will differ — always copy from Netlify, don't use these examples.

This hands DNS fully to Netlify. Propagation: **10 minutes to 2 hours**.

---

#### Option B — Keep GoDaddy DNS, Point Records Manually

Add/update these DNS records in GoDaddy:

| Type  | Name | Value                        | TTL  |
|-------|------|------------------------------|------|
| A     | @    | `75.2.60.5`                  | 600  |
| A     | @    | `99.83.190.102`              | 600  |
| CNAME | www  | `appstudiox.netlify.app`     | 600  |

> Netlify's load-balancer IPs — verify current IPs at [Netlify Docs](https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/).

Propagation: **up to 48 hours** (usually within 1–2 hours).

---

## Step 4 — Enable Free HTTPS/SSL on Netlify (1 click)

1. Back in Netlify → **Domain management** → scroll to **"HTTPS"**
2. Click **"Verify DNS configuration"** (do this after DNS propagates)
3. Click **"Provision certificate"**
4. Done — `https://appstudiox.com` is now live with free SSL ✅

---

## Step 5 — Add Netlify Forms (Optional — for the contact form)

To make the contact form work without a backend:

1. In `index.html`, add `netlify` attribute to the `<form>` tag:
   ```html
   <form class="contact__form" id="contactForm" name="contact" netlify novalidate>
   ```
2. Also add a hidden field for spam protection:
   ```html
   <input type="hidden" name="form-name" value="contact" />
   ```
3. Re-deploy the site
4. Form submissions appear in Netlify → **"Forms"** dashboard with email notifications

---

## Verification Checklist

- [ ] Site loads at `https://appstudiox.com`
- [ ] `https://www.appstudiox.com` also works and redirects to apex domain
- [ ] SSL padlock shows in browser
- [ ] Contact form submits successfully (check Netlify Forms)
- [ ] Mobile layout looks correct

---

## DNS Propagation Check

Use this tool to verify DNS has propagated worldwide:
- **[dnschecker.org](https://dnschecker.org)** — enter `appstudiox.com` → check A record

---

## Need Help?

- Netlify Docs: https://docs.netlify.com/domains-https/custom-domains/
- GoDaddy DNS help: https://www.godaddy.com/help/manage-dns-records-680
- Email: hello@appstudiox.com
