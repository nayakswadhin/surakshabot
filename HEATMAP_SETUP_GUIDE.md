# Heatmap Feature - Setup Guide

## Overview
The heatmap feature displays a real-time visualization of cyber fraud cases across Odisha based on actual MongoDB data. It uses Google Maps API to show the geographic distribution of fraud cases with intensity based on case density and priority.

## Features
✅ **Real-time Data**: Fetches actual case data from MongoDB
✅ **Location-based**: Uses pincode and district data to plot cases
✅ **Priority Weighting**: Urgent cases appear with higher intensity
✅ **Interactive Stats**: Shows total, financial, social, pending, and solved cases
✅ **Auto-refresh**: Can be manually refreshed to see latest data
✅ **Responsive Design**: Works on all screen sizes

## Prerequisites

### 1. Google Maps API Key
You need a Google Maps API key with the following APIs enabled:
- Maps JavaScript API
- Maps SDK for Android (if using mobile)
- Visualization Library (for heatmap)

#### Get Your API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy the generated API key
7. Click **Edit API Key** to restrict it:
   - **Application restrictions**: HTTP referrers
   - Add: `http://localhost:3001/*` and your production domain
   - **API restrictions**: Select only required APIs
   
## Installation Steps

### 1. Backend Setup

The backend is already configured with:
- `services/geocodingService.js` - Converts pincodes to coordinates
- `services/pincodeData.json` - Odisha pincode database
- Controller method: `whatsappController.getHeatmapData()`
- API endpoint: `GET /api/whatsapp/heatmap-data`

### 2. Frontend Setup

#### Install Dependencies:
```bash
cd frontend
npm install @react-google-maps/api
```

#### Configure Environment Variables:
Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
```

**Important**: Replace `YOUR_ACTUAL_GOOGLE_MAPS_API_KEY` with your actual key!

### 3. Start Servers

#### Backend:
```bash
# From project root
node main.js
```

#### Frontend:
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3001`

## How It Works

### Data Flow:

```
MongoDB Cases Collection
         ↓
Users Collection (for pincode/district)
         ↓
Backend: /api/whatsapp/heatmap-data
         ↓
geocodingService.js (converts pincode → lat/lng)
         ↓
Frontend: fetchHeatmapData()
         ↓
HeatmapWidget Component
         ↓
Google Maps Heatmap Layer
```

### Data Structure:

Each heatmap point contains:
```javascript
{
  lat: 20.9517,          // Latitude
  lng: 85.0985,          // Longitude
  weight: 2,             // 1-3 based on priority
  caseId: "CASE123",     // Reference ID
  fraudType: "UPI Fraud",
  category: "Financial",
  status: "pending",
  district: "Khordha",
  pincode: "751001",
  createdAt: "2025-01-01"
}
```

### Priority Weighting:
- **Urgent** priority → weight: 3 (highest intensity)
- **High** priority → weight: 2
- **Medium/Low** → weight: 1

## Pincode Database

The `pincodeData.json` file contains mappings of Odisha pincodes to coordinates:
- Currently has ~50 major pincodes
- Falls back to district coordinates if pincode not found
- Adds random offset (±0.02°) to avoid exact overlapping

### Adding More Pincodes:

Edit `services/pincodeData.json`:
```json
{
  "751024": { "lat": 20.3100, "lng": 85.8200 },
  "753014": { "lat": 20.4700, "lng": 85.8900 }
}
```

## Customization

### Change Heatmap Colors:

Edit `HeatmapWidget.tsx`:
```typescript
gradient: [
  'rgba(0, 255, 255, 0)',   // Start (transparent)
  'rgba(0, 255, 255, 1)',   // Light blue
  'rgba(0, 0, 255, 1)',     // Blue
  'rgba(127, 0, 63, 1)',    // Purple
  'rgba(255, 0, 0, 1)',     // Red (high intensity)
]
```

### Change Radius & Opacity:

```typescript
<HeatmapLayer
  data={heatmapData}
  options={{
    radius: 25,      // Increase for larger circles
    opacity: 0.7,    // 0.0 to 1.0
  }}
/>
```

### Change Map Center:

```typescript
const center = {
  lat: 20.9517,  // Odisha center
  lng: 85.0985,
}
```

## Testing

### 1. Test Backend Endpoint:
```bash
curl http://localhost:3000/api/whatsapp/heatmap-data
```

Expected response:
```json
{
  "success": true,
  "count": 25,
  "data": [
    { "lat": 20.3, "lng": 85.8, "weight": 2, ... }
  ]
}
```

### 2. Check Browser Console:
- Should see: "Loading heatmap data..."
- Should show number of points loaded
- Check for any API key errors

### 3. Verify Map Display:
- Heatmap should show colored intensity areas
- Stats should show correct counts
- Refresh button should work

## Troubleshooting

### "Error loading Google Maps"
❌ **Problem**: Invalid or missing API key
✅ **Solution**: 
- Check `.env.local` file exists
- Verify API key is correct
- Restart frontend dev server

### "No location data available"
❌ **Problem**: No cases in database or no pincode data
✅ **Solution**:
- Check MongoDB has cases with user data
- Verify users have valid pincodes
- Check backend logs for errors

### Heatmap not showing
❌ **Problem**: API key restrictions
✅ **Solution**:
- In Google Cloud Console, edit API key
- Add `http://localhost:3001/*` to HTTP referrers
- Wait 5 minutes for changes to propagate

### Points not in correct location
❌ **Problem**: Wrong coordinates in pincodeData.json
✅ **Solution**:
- Verify pincode coordinates
- Use Google Maps to get accurate lat/lng
- Update `pincodeData.json`

## API Limits

### Google Maps Free Tier:
- **$200 free credit per month**
- Approximately **28,000 map loads** per month
- Heatmap visualization included

### If You Exceed Limits:
- Enable billing in Google Cloud Console
- Set daily limits to prevent overcharges
- Consider caching data on frontend

## Production Deployment

### 1. Update Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_key
```

### 2. Update API Key Restrictions:
- Add your production domain to HTTP referrers
- Example: `https://surakshabot.com/*`

### 3. Optimize Performance:
- Consider implementing data caching
- Add loading states
- Lazy load the maps component

## Future Enhancements

Potential improvements:
- [ ] Add date range filter for heatmap
- [ ] Click on heatmap area to see cases
- [ ] Add clustering for dense areas
- [ ] Export heatmap as image
- [ ] Add district boundaries overlay
- [ ] Real-time updates via WebSocket
- [ ] Add fraud type filter
- [ ] Time-lapse animation

## Support

For issues or questions:
- Check browser console for errors
- Verify backend logs
- Test API endpoint directly
- Check Google Cloud Console for API usage

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to Git
- Restrict API key to specific domains
- Enable billing alerts in Google Cloud
- Regularly rotate API keys
- Monitor API usage

## File Structure

```
surakshabot/
├── services/
│   ├── geocodingService.js      # Pincode to coordinates
│   └── pincodeData.json         # Pincode database
├── controllers/
│   └── whatsappController.js    # getHeatmapData method
├── routes/
│   └── whatsapp.js              # /heatmap-data endpoint
└── frontend/
    ├── components/
    │   └── HeatmapWidget.tsx    # Map component
    ├── lib/
    │   └── api.ts               # fetchHeatmapData function
    ├── app/
    │   └── page.tsx             # Dashboard with heatmap
    └── .env.local               # Environment variables
```

## Success Checklist

✅ Google Maps API key obtained
✅ API key configured in `.env.local`
✅ Backend running on port 3000
✅ Frontend running on port 3001
✅ MongoDB has cases with location data
✅ Heatmap displays on dashboard
✅ Stats show correct numbers
✅ No errors in console

---

**Version**: 1.0
**Last Updated**: November 8, 2025
**Feature Status**: ✅ Complete & Functional
