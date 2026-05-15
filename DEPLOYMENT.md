# Dots — VPS Deployment Guide

From brand-new Ubuntu VPS to production instance with custom subdomain and HTTPS.

---

## Prerequisites

- A VPS running Ubuntu 22.04+ (DigitalOcean, Linode, Hetzner, RackNerd, etc.)
- SSH access as root (or a sudo-capable user)
- A domain name where you control DNS (e.g. `karm.uno`)
- The Dots repo accessible via GitHub

Dots is a **pure static site** — no backend, no database, no build step. Nginx serves the files directly.

---

## User Account Model

This guide uses **two accounts** with distinct roles:

| Account | Purpose | Sudo? |
|---------|---------|-------|
| **Your personal user** (e.g. `yourname`) | System administration — installing packages, configuring Nginx, managing certificates | Yes |
| **`dots`** (service account) | Owning the app files — git, deployments | No |

The `dots` user never gets sudo. If the web root is compromised, the attacker cannot escalate to root. System administration always goes through your personal account.

**Switching between accounts:**
```bash
# From your personal account → dots (app tasks)
sudo su - dots

# Back to your personal account (system tasks)
exit
```

---

## Step 1: Initial Server Setup

SSH into your VPS:
```bash
ssh root@YOUR_SERVER_IP
```

Update packages and install essentials:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban
```

Create your personal admin user (skip if your VPS provider already set one up):
```bash
adduser yourname
usermod -aG sudo yourname
```

Create the service account for the app — **no sudo**:
```bash
adduser dots
```

Set up the firewall:
```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

Log out of root and SSH back in as your personal user:
```bash
exit
ssh yourname@YOUR_SERVER_IP
```

---

## Step 2: Install Nginx

Run from **your personal account** (needs sudo):
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## Step 3: Clone the Repo

Switch to the `dots` service account for all app file tasks:
```bash
sudo su - dots
git clone https://github.com/karmuno/dots.git ~/dots
```

Verify the files are there:
```bash
ls ~/dots/index.html   # Should exist
exit
```

---

## Step 4: Configure Nginx

Switch back to **your personal account** for system administration.

**If your server runs a control panel (Hestia, cPanel, etc.) or has multiple domains on a specific IP**, use that IP in the `listen` directives. Otherwise, skip to the basic config below.

**For servers with a specific bound IP** (ask your provider or run `ip addr`):
```bash
sudo nano /etc/nginx/conf.d/dots.yourdomain.com.conf
```
Paste:
```nginx
server {
    listen      YOUR_SERVER_IP:80;
    server_name dots.yourdomain.com;

    location ~ /\.(?!well-known\/) {
        deny all;
        return 404;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

Then create the HTTPS config:
```bash
sudo nano /etc/nginx/conf.d/dots.yourdomain.com.ssl.conf
```
Paste:
```nginx
server {
    listen      YOUR_SERVER_IP:443 ssl;
    server_name dots.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/dots.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dots.yourdomain.com/privkey.pem;

    root /home/dots/dots;
    index index.html;

    location ~ /\.(?!well-known\/) {
        deny all;
        return 404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**For standalone VPS without a control panel**, use the simpler config:
```bash
sudo nano /etc/nginx/conf.d/dots.yourdomain.com.conf
```
Paste:
```nginx
server {
    listen 80;
    server_name dots.yourdomain.com;

    location ~ /\.(?!well-known\/) {
        deny all;
        return 404;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

Then:
```bash
sudo nano /etc/nginx/conf.d/dots.yourdomain.com.ssl.conf
```
Paste:
```nginx
server {
    listen 443 ssl;
    server_name dots.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/dots.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dots.yourdomain.com/privkey.pem;

    root /home/dots/dots;
    index index.html;

    location ~ /\.(?!well-known\/) {
        deny all;
        return 404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> Replace `dots.yourdomain.com` with your actual subdomain and `YOUR_SERVER_IP` with your VPS IP address.

Create the certbot directory for ACME challenges:
```bash
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
```

Test and reload:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 5: Point Your Domain to the Server

Go to your domain registrar (Namecheap, Cloudflare, Porkbun, etc.) and add a DNS record for your subdomain:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | dots | YOUR_SERVER_IP | 300 |

No `www` record needed for subdomains.

DNS propagation takes anywhere from 5 minutes to 48 hours. Check with:
```bash
dig dots.yourdomain.com +short
# Should return YOUR_SERVER_IP
```

Wait until this resolves before proceeding to the next step.

---

## Step 6: Enable HTTPS with Let's Encrypt

Run from **your personal account** (needs sudo):
```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot certonly --webroot -w /var/www/certbot -d dots.yourdomain.com
```

`certonly` obtains the certificate without modifying your Nginx config (you've already written that in Step 4). The `-w` flag points to the directory Nginx serves for the ACME challenge — this must match the `root` in your nginx location block.

Certbot sets up auto-renewal via a systemd timer. Verify it works:
```bash
sudo certbot renew --dry-run
```

Now reload Nginx to activate the SSL config:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

Your site is now live at `https://dots.yourdomain.com`.

---

## Step 7: Verify Everything

```bash
# Nginx serving?
curl -I https://dots.yourdomain.com

# Static files reachable?
curl https://dots.yourdomain.com/index.html | head -5

# Nginx status
sudo systemctl status nginx
```

---

## Updating the App

When you push new code, switch to the `dots` account:
```bash
sudo su - dots
cd ~/dots
git pull origin main
exit
```

No restart needed — Nginx reads files from disk on each request. Changes are live immediately after `git pull`.

---

## Troubleshooting

**502 Bad Gateway:** Not applicable — Dots is served directly by Nginx, not proxied to a backend. If you see this, check that `root` in the Nginx config points to the correct directory.

**404 on all pages:** Check that `/home/dots/dots/index.html` exists and that Nginx's `root` directive matches the actual clone path. Verify with `ls /home/dots/dots/`.

**Nginx can't read files:** The `www-data` user (Nginx's worker) needs read access to `/home/dots/dots/`. Fix with:
```bash
sudo chmod o+x /home/dots
sudo chmod -R o+r /home/dots/dots
```

**SSL certificate problem: self-signed certificate (or wrong cert served):** If you're on a server with a control panel (Hestia, cPanel, etc.) or multiple domains on one IP, Nginx may serve a default control panel cert instead of your Let's Encrypt cert. This happens when your `listen` directive doesn't match the bound IP. 
  - Run `sudo nginx -T | grep -A 5 "listen.*443"` to see all HTTPS configs
  - If you see `listen YOUR_SERVER_IP:443 default_server ssl;`, update your dots config to use that same IP in the `listen` directive
  - Also delete any template config files you created (e.g. `dots.yourdomain.com.ssl.conf` if you replaced it with a domain-specific filename)

**Certbot fails during renewal:** If certbot can't validate the ACME challenge, ensure your Nginx config has a location block that serves the challenge directory:
```nginx
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}
```
This block must appear in **both** your HTTP (port 80) and HTTPS (port 443) server blocks, placed **before** any catch-all `location /` blocks. If Nginx is proxying requests (e.g., `proxy_pass`), the ACME location block must come first to intercept the challenge before it's proxied.

**`certbot renew` says "not yet due":** This is normal if your certificate is valid. Certbot only renews certificates within 30 days of expiration. To test renewal:
```bash
sudo certbot renew --dry-run
```

**Site shows Cloudflare default page or redirects to HTTP:** If using Cloudflare DNS:
  - Verify Cloudflare SSL/TLS mode is set to "Full" or "Full (Strict)" (not "Flexible")
  - Check "Always Use HTTPS" is enabled in Cloudflare
  - Test Nginx directly to bypass Cloudflare: `curl -I --resolve dots.yourdomain.com:443:YOUR_SERVER_IP https://dots.yourdomain.com`

**`nginx -t` fails after editing configs:** Check for mismatched braces or missing semicolons. Run `sudo nginx -T` to print the full merged config for inspection.

**Conflicting server name warnings:** If you see `nginx: [warn] conflicting server name` in `nginx -T` output, you have multiple configs with the same `listen` address and `server_name`. Delete template or old config files that you replaced.
