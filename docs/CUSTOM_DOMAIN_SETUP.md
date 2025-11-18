# Custom Domain Setup Guide for Slappy

This guide walks you through connecting your custom domain **slappy.cloud** to your Slappy application hosted on Fly.io, including automatic HTTPS setup.

## What You'll Achieve

- Your app accessible at `https://slappy.cloud` and `https://www.slappy.cloud`
- Automatic HTTPS/SSL certificates (secure padlock in browser)
- Automatic redirect from HTTP to HTTPS
- Professional branded URL instead of `slappy.fly.dev`

## Prerequisites

- Access to your domain registrar (where you purchased slappy.cloud)
- Fly.io CLI installed ([install guide](https://fly.io/docs/hands-on/install-flyctl/))
- Logged into Fly.io CLI: `flyctl auth login`

## Estimated Time

- **Typical:** 2-3 hours (mostly waiting for DNS propagation)
- **Worst case:** Up to 48 hours (if DNS is slow to propagate)

---

## Step-by-Step Setup

### Step 1: Add Your Domain to Fly.io

Open your terminal and run these commands:

```bash
# Add your main domain
flyctl certs create slappy.cloud --app slappy

# Add the www subdomain
flyctl certs create www.slappy.cloud --app slappy
```

**What this does:** Tells Fly.io you want to use these domains with your app and starts the SSL certificate request process.

**Expected output:**
```
Your certificate for slappy.cloud is being issued.
Hostname = slappy.cloud
Certificate Authority = Let's Encrypt
...
```

---

### Step 2: Get Your Fly.io IP Addresses

Run this command to see the IP addresses Fly.io assigned to your app:

```bash
flyctl ips list --app slappy
```

**Example output:**
```
VERSION    IP                      TYPE
v6         2a09:8280:1::1:abcd     public
v4         66.241.124.100          public
```

**Write these down** - you'll need them in the next step.

---

### Step 3: Configure DNS Records

Now go to your domain registrar's website (e.g., Namecheap, GoDaddy, Cloudflare, etc.) and add these DNS records:

#### For slappy.cloud (main domain):

| Type  | Name/Host | Value/Points To           | TTL       |
|-------|-----------|---------------------------|-----------|
| A     | @         | `66.241.124.100`*         | Automatic |
| AAAA  | @         | `2a09:8280:1::1:abcd`*    | Automatic |

*Replace with YOUR actual IP addresses from Step 2

#### For www.slappy.cloud:

| Type  | Name/Host | Value/Points To | TTL       |
|-------|-----------|-----------------|-----------|
| CNAME | www       | slappy.fly.dev  | Automatic |

**DNS Provider Tips:**
- **"@" or "Name/Host"** means the root domain (slappy.cloud)
- **"www"** is exactly that - the subdomain prefix
- **TTL** (Time To Live) can usually be left as "Automatic" or set to 3600 (1 hour)
- Some providers call it "Points To" or "Value" - same thing!

**Important:**
- Delete any existing A, AAAA, or CNAME records for @ and www first
- Make sure there are no conflicting records

---

### Step 4: Wait for DNS Propagation

After saving your DNS records, you need to wait for them to propagate across the internet.

**How long?**
- Minimum: 5-15 minutes
- Typical: 1-2 hours
- Maximum: Up to 48 hours

**Check if DNS has propagated:**

```bash
# Check main domain
dig slappy.cloud A
dig slappy.cloud AAAA

# Check www subdomain
dig www.slappy.cloud CNAME
```

You should see your IP addresses in the results.

**Online checker:** Visit https://www.whatsmydns.net/#A/slappy.cloud to check propagation worldwide.

---

### Step 5: Verify SSL Certificate Status

Once DNS has propagated, Fly.io will automatically issue SSL certificates. Check the status:

```bash
# Check main domain certificate
flyctl certs show slappy.cloud --app slappy

# Check www subdomain certificate
flyctl certs show www.slappy.cloud --app slappy
```

**Look for these lines:**
```
DNS Validated = true
Certificate Issued = true
```

**If it says "Pending":**
- Wait a bit longer for DNS to propagate
- Check that your DNS records are correct
- See troubleshooting section below

---

### Step 6: Test Your Domain

Once certificates show as "issued", test your domain in a browser:

1. Visit `https://slappy.cloud`
2. Visit `https://www.slappy.cloud`
3. Check for the padlock icon (🔒) in the address bar

**Command line test:**
```bash
curl -I https://slappy.cloud
curl -I https://www.slappy.cloud
```

Should return `HTTP/2 200` with no certificate errors.

---

## HTTPS Configuration

Good news - **HTTPS is already configured!** Your app's `fly.toml` file already has this setting:

```toml
[http_service]
  force_https = true
```

This means:
- All HTTP requests automatically redirect to HTTPS
- Visitors always get a secure connection
- SSL certificates auto-renew every 90 days (handled by Fly.io)

**No additional configuration needed!**

---

## Troubleshooting

### Certificate Stuck on "Pending"

**Problem:** `flyctl certs show` says certificate is still pending after 2+ hours.

**Solutions:**

1. **Verify DNS records are correct:**
   ```bash
   dig slappy.cloud A
   dig slappy.cloud AAAA
   ```
   Should return your Fly.io IP addresses.

2. **Check DNS propagation globally:**
   Use https://www.whatsmydns.net

3. **Re-create the certificate:**
   ```bash
   flyctl certs delete slappy.cloud --app slappy
   flyctl certs create slappy.cloud --app slappy
   ```

### "Your Connection is Not Private" Error

**Problem:** Browser shows security warning.

**Cause:** Certificate not issued yet or DNS not pointing to Fly.io.

**Solution:**
- Wait for certificate to be issued (check with `flyctl certs show`)
- Verify DNS is pointing to correct IP addresses
- Try in incognito/private browsing mode (clears cache)

### Domain Shows "404 Not Found"

**Problem:** Domain loads but shows 404 error.

**Solutions:**
1. **Check app is deployed and running:**
   ```bash
   flyctl status --app slappy
   ```

2. **Check app logs:**
   ```bash
   flyctl logs --app slappy
   ```

3. **Redeploy the app:**
   ```bash
   flyctl deploy --app slappy
   ```

### WWW Subdomain Not Working

**Problem:** `slappy.cloud` works but `www.slappy.cloud` doesn't.

**Solution:**
- Verify you created certificate for www: `flyctl certs show www.slappy.cloud`
- Check CNAME record points to `slappy.fly.dev`
- Make sure CNAME is for "www" hostname, not "@"

### DNS Changes Not Taking Effect

**Solutions:**

1. **Flush your local DNS cache:**

   **macOS:**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

   **Windows:**
   ```bash
   ipconfig /flushdns
   ```

   **Linux:**
   ```bash
   sudo systemd-resolve --flush-caches
   ```

2. **Test using Google DNS:**
   ```bash
   dig @8.8.8.8 slappy.cloud A
   ```

3. **Wait longer** - DNS can take up to 48 hours in rare cases

---

## Post-Setup Checklist

Use this checklist to verify everything is working:

### DNS Configuration
- [ ] A record for @ points to Fly.io IPv4
- [ ] AAAA record for @ points to Fly.io IPv6
- [ ] CNAME record for www points to slappy.fly.dev
- [ ] DNS propagation confirmed (use whatsmydns.net)

### SSL/HTTPS
- [ ] `flyctl certs show slappy.cloud` shows "Certificate Issued: true"
- [ ] `flyctl certs show www.slappy.cloud` shows "Certificate Issued: true"
- [ ] Browser shows padlock icon for https://slappy.cloud
- [ ] Browser shows padlock icon for https://www.slappy.cloud

### Functionality
- [ ] http://slappy.cloud redirects to https://slappy.cloud
- [ ] http://www.slappy.cloud redirects to https://www.slappy.cloud
- [ ] App loads and works correctly on custom domain
- [ ] No certificate warnings in browser

### Optional (SEO/Analytics)
- [ ] Update Google Search Console with new domain
- [ ] Update AdSense settings (if applicable)
- [ ] Update social media links
- [ ] Update any external documentation/links

---

## Quick Command Reference

```bash
# View app status
flyctl status --app slappy

# List IP addresses
flyctl ips list --app slappy

# Add custom domain
flyctl certs create slappy.cloud --app slappy

# Check certificate status
flyctl certs show slappy.cloud --app slappy

# List all certificates
flyctl certs list --app slappy

# Delete certificate (if needed)
flyctl certs delete slappy.cloud --app slappy

# View app logs
flyctl logs --app slappy

# Deploy app
flyctl deploy --app slappy

# Open app in browser
flyctl open --app slappy
```

---

## Understanding the Timeline

Here's what happens and when:

| Step | What Happens | Time |
|------|--------------|------|
| Add domain to Fly.io | `flyctl certs create` command | 1-2 minutes |
| Configure DNS | Update records at registrar | 5-10 minutes |
| DNS propagation | Records spread across internet | 1-2 hours (up to 48h) |
| DNS verification | Let's Encrypt checks domain ownership | 5-15 minutes |
| Certificate issuance | Let's Encrypt issues SSL certificate | 1-5 minutes |
| Domain active | Everything works! | Immediate |

**Total typical time:** 2-3 hours from start to finish

---

## How SSL Certificates Work

### Automatic Certificate Management

Fly.io uses **Let's Encrypt** to provide free SSL certificates. Here's what happens automatically:

1. **Initial Certificate:** Issued when you run `flyctl certs create`
2. **Auto-Renewal:** Certificates renew automatically every 90 days
3. **Zero Maintenance:** You don't need to do anything after initial setup

### Certificate Details

- **Authority:** Let's Encrypt
- **Type:** Domain Validation (DV)
- **Expiration:** 90 days
- **Auto-Renewal:** Yes (happens at ~60 days before expiration)
- **Cost:** Free

**You never need to manually renew certificates!**

---

## Advanced: Multiple Domains

Want to add more domains to the same app?

```bash
# Add alternate domain
flyctl certs create alternate.com --app slappy

# Add subdomain
flyctl certs create api.slappy.cloud --app slappy

# Add wildcard (all subdomains)
flyctl certs create *.slappy.cloud --app slappy
```

Then configure DNS for each domain following the same process.

---

## Need More Help?

- **Fly.io Documentation:** https://fly.io/docs/networking/custom-domain/
- **SSL/TLS Guide:** https://fly.io/docs/networking/ssl/
- **Community Forum:** https://community.fly.io/
- **Fly.io Status:** https://status.fly.io/

---

## Summary

You've successfully set up a custom domain with HTTPS for your Slappy application! Here's what you accomplished:

✅ Custom domain (slappy.cloud) connected to Fly.io
✅ Automatic HTTPS with Let's Encrypt SSL certificates
✅ Auto-renewal of certificates (no maintenance required)
✅ Professional branded URL for your application
✅ Secure connection for all visitors

**Next steps:** Update any external links, configure SEO settings, and enjoy your new custom domain!
