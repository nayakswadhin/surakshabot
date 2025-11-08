# Quick Start: Google Maps API Key Setup

## Step-by-Step Guide

### 1. Go to Google Cloud Console
🔗 https://console.cloud.google.com/

### 2. Create/Select Project
- Click "Select a project" → "New Project"
- Name: "SurakshaBot" or any name
- Click "Create"

### 3. Enable Required APIs
Navigate to: **APIs & Services** → **Library**

Enable these APIs:
- ✅ **Maps JavaScript API**
- ✅ **Geocoding API** (optional, for enhanced features)

### 4. Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the generated key (starts with `AIza...`)

### 5. Restrict API Key (Important!)

Click **EDIT API KEY** (pencil icon):

#### Application Restrictions:
- Select: **HTTP referrers (web sites)**
- Add:
  ```
  http://localhost:3001/*
  https://localhost:3001/*
  http://127.0.0.1:3001/*
  ```
- For production, also add:
  ```
  https://yourdomain.com/*
  ```

#### API Restrictions:
- Select: **Restrict key**
- Choose:
  - Maps JavaScript API
  - (any other enabled APIs)

Click **SAVE**

### 6. Add Key to Project

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key_here
```

### 7. Restart Frontend
```bash
cd frontend
# Press Ctrl+C to stop if running
npm run dev
```

## Enable Billing (Required)

⚠️ **Google Maps requires billing to be enabled**

### Setup Billing:
1. Go to **Billing** in Google Cloud Console
2. Click **LINK A BILLING ACCOUNT**
3. Create new billing account or link existing
4. Add payment method (credit/debit card)

### Don't Worry About Costs:
- ✅ **$200 free credit per month**
- ✅ First 28,000 map loads are FREE
- ✅ Can set spending limits
- ✅ Get alerts before charges

### Set Budget Alerts:
1. Go to **Billing** → **Budgets & alerts**
2. Click **CREATE BUDGET**
3. Set amount: $10
4. Enable email alerts at 50%, 90%, 100%

## Verify Setup

### 1. Check API Key Works:
Open browser console on your dashboard and look for:
```
✅ Map loaded successfully
❌ Google Maps API error: InvalidKeyMapError
```

### 2. Test API Call:
```bash
# Replace YOUR_KEY with your actual key
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Odisha&key=YOUR_KEY"
```

Should return JSON with coordinates

### 3. Check Dashboard:
Visit `http://localhost:3001` and verify:
- ✅ Heatmap loads
- ✅ No error messages
- ✅ Stats show numbers
- ✅ Map is interactive

## Common Issues

### "API key not valid"
```
❌ This API project is not authorized to use this API
```
**Solution**: Enable Maps JavaScript API in Google Cloud Console

### "RefererNotAllowedMapError"
```
❌ This IP, site or mobile application is not authorized
```
**Solution**: Add `http://localhost:3001/*` to HTTP referrers

### "REQUEST_DENIED"
```
❌ Billing not enabled
```
**Solution**: Enable billing in Google Cloud Console

### Map shows but heatmap doesn't
```
❌ Visualization library not loaded
```
**Solution**: Already handled in code, just refresh page

## API Usage Monitoring

### Check Your Usage:
1. Go to Google Cloud Console
2. **APIs & Services** → **Dashboard**
3. Click **Maps JavaScript API**
4. View usage graphs

### Typical Usage:
- Dashboard load: 1 request
- Heatmap data fetch: 0 requests (your backend)
- Map interactions: minimal requests
- **Estimate**: ~10-20 requests per active user per day

### Monthly Estimate:
- 10 daily users × 15 requests × 30 days = 4,500 requests
- **Well within free tier!** (28,000 free requests)

## Production Checklist

Before deploying to production:

- [ ] Get production domain
- [ ] Add domain to API key restrictions
- [ ] Update `.env.local` → `.env.production`
- [ ] Set up budget alerts
- [ ] Enable logging and monitoring
- [ ] Test on production URL
- [ ] Set up SSL certificate

## Quick Commands

```bash
# Install dependencies
cd frontend && npm install @react-google-maps/api

# Create env file
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE" > frontend/.env.local

# Start frontend
cd frontend && npm run dev

# Start backend
node main.js

# Test API endpoint
curl http://localhost:3000/api/whatsapp/heatmap-data
```

## Need Help?

### Resources:
- 📚 [Google Maps Platform Docs](https://developers.google.com/maps/documentation)
- 💰 [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- 🎓 [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

### Support:
- GitHub Issues: [Create an issue](https://github.com/nayakswadhin/surakshabot/issues)
- Documentation: See `HEATMAP_SETUP_GUIDE.md`

---

**Time to Complete**: 10-15 minutes
**Difficulty**: Easy
**Cost**: $0/month (within free tier)
