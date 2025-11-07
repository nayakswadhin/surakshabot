# 🔌 Frontend-Backend Connection Guide

## Current Status

✅ **Backend**: Configured to run on port **3000**
✅ **Frontend**: Configured to run on port **3001**
✅ **CORS**: Enabled for frontend communication
✅ **API Routes**: All endpoints ready
✅ **Environment**: Configuration files in place

---

## 🚀 Quick Start (Recommended Method)

### Step 1: Stop Any Running Servers

```powershell
# Stop any processes on ports 3000 and 3001
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### Step 2: Start Both Servers

```powershell
cd d:\cyberproject\surakshabot
.\start-servers.ps1
```

This script will:
- ✅ Check and free ports 3000 and 3001
- ✅ Start backend on port 3000
- ✅ Start frontend on port 3001
- ✅ Open browser to http://localhost:3001
- ✅ Run both servers in separate windows

### Step 3: Verify Connection

**Option A: Use the HTML Test Page**
```powershell
# Open the connection test page
start connection-test.html
```

**Option B: Use the Node.js Test Script**
```powershell
node test-connection.js
```

**Option C: Check in Dashboard**
1. Open http://localhost:3001
2. Navigate to Settings page
3. Click "Test Connection" button
4. Status should show "API is Online" ✅

---

## 🔧 Manual Setup (Alternative Method)

### Terminal 1 - Backend Server

```powershell
cd d:\cyberproject\surakshabot
node main.js
```

Expected output:
```
🚀 ================================
🤖 Suraksha Bot Server Started
📱 WhatsApp Bot Service Running
🌐 Server: http://localhost:3000
📊 Health Check: http://localhost:3000/api/health
🔗 Webhook URL: http://localhost:3000/api/whatsapp/webhook
🚀 ================================
```

### Terminal 2 - Frontend Server

```powershell
cd d:\cyberproject\surakshabot\frontend
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3001, url: http://localhost:3001
```

---

## 📡 API Endpoints

### Backend Endpoints (Port 3000)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/whatsapp/cases/all` | GET | Get all complaints |
| `/api/whatsapp/case/:caseId` | GET | Get single complaint |
| `/api/whatsapp/cases/:caseId` | PATCH | Update complaint status |
| `/api/whatsapp/users/all` | GET | Get all users |
| `/api/whatsapp/users/:userId` | GET | Get single user |

### Frontend Pages (Port 3001)

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | http://localhost:3001 | Overview and statistics |
| Complaints | http://localhost:3001/complaints | Complaint management |
| Reports | http://localhost:3001/reports | Statistical reports |
| Analytics | http://localhost:3001/analytics | Advanced analytics |
| Users | http://localhost:3001/users | User management |
| Settings | http://localhost:3001/settings | System configuration |

---

## 🔍 Connection Configuration

### Backend CORS Settings (`main.js`)

```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Frontend API Configuration (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Frontend Proxy Configuration (`next.config.js`)

```javascript
async rewrites() {
  return [
    {
      source: '/api/backend/:path*',
      destination: 'http://localhost:3000/api/:path*',
    },
  ];
}
```

---

## ✅ Connection Verification Checklist

### Before Starting:
- [ ] MongoDB is running
- [ ] Ports 3000 and 3001 are available
- [ ] `.env` file exists in backend root
- [ ] `.env.local` file exists in frontend folder
- [ ] All dependencies installed (`npm install` in both folders)

### After Starting:
- [ ] Backend responds at http://localhost:3000
- [ ] Backend API health check works: http://localhost:3000/api/health
- [ ] Frontend loads at http://localhost:3001
- [ ] Dashboard shows statistics (not zeros)
- [ ] Settings page shows "API is Online"
- [ ] No CORS errors in browser console

---

## 🐛 Troubleshooting

### Problem: "Port 3000 already in use"

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use the start script which handles this automatically
.\start-servers.ps1
```

### Problem: "Backend not responding"

**Checks:**
1. Is backend running? Check Terminal 1
2. Is MongoDB connected? Check backend logs
3. Test manually: `curl http://localhost:3000/api/health`
4. Check `.env` file configuration

**Solution:**
```powershell
# Restart backend
cd d:\cyberproject\surakshabot
node main.js
```

### Problem: "Frontend can't connect to backend"

**Symptoms:**
- Dashboard shows all zeros
- Settings shows "API is Offline"
- Browser console shows CORS or network errors

**Checks:**
1. Verify backend is running on port 3000
2. Check `.env.local` has correct API URL
3. Open http://localhost:3000/api/health in browser
4. Check browser console for errors

**Solution:**
```powershell
# Verify configuration
cd d:\cyberproject\surakshabot\frontend
cat .env.local

# Should show:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Restart frontend
npm run dev
```

### Problem: "CORS Policy Error"

**Symptoms:**
```
Access to fetch at 'http://localhost:3000/api/...' from origin 
'http://localhost:3001' has been blocked by CORS policy
```

**Solution:**
Backend CORS is already configured. If error persists:
1. Clear browser cache
2. Restart backend server
3. Verify `main.js` has CORS configuration
4. Check browser console for specific error

### Problem: "404 Not Found for API endpoints"

**Checks:**
1. Verify endpoint URL is correct
2. Check backend routes in `routes/whatsapp.js`
3. Ensure backend is using `/api` prefix

**Solution:**
Test endpoints directly:
```powershell
# Test health
curl http://localhost:3000/api/health

# Test cases
curl http://localhost:3000/api/whatsapp/cases/all

# Test users
curl http://localhost:3000/api/whatsapp/users/all
```

---

## 🧪 Testing the Connection

### Test 1: Backend Health Check

```powershell
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Suraksha Bot is running",
  "timestamp": "2025-11-07T..."
}
```

### Test 2: Frontend Access

```powershell
curl http://localhost:3001
```

Should return HTML content of the dashboard.

### Test 3: API Data Flow

1. Open http://localhost:3001 in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Refresh page
5. Look for requests to `/api/...`
6. They should show status 200 (green)

### Test 4: Dashboard Statistics

1. Open http://localhost:3001
2. Dashboard should show:
   - Total Complaints (not 0)
   - Total Solved
   - Total Pending
   - Total Users
3. Charts should display data

---

## 📊 Connection Flow Diagram

```
┌─────────────────┐         ┌─────────────────┐
│   Browser       │         │   Frontend      │
│  (localhost)    │◄────────│   Next.js       │
│                 │         │   Port 3001     │
└─────────────────┘         └────────┬────────┘
                                     │
                                     │ HTTP Request
                                     │ (CORS Enabled)
                                     ▼
                            ┌────────────────┐
                            │   Backend      │
                            │   Express.js   │
                            │   Port 3000    │
                            └────────┬───────┘
                                     │
                                     │ Mongoose
                                     ▼
                            ┌────────────────┐
                            │   MongoDB      │
                            │   Database     │
                            └────────────────┘
```

---

## 🎯 Success Indicators

### ✅ Everything Working:

1. **Backend Console:**
   ```
   🤖 Suraksha Bot Server Started
   ✓ MongoDB connected successfully
   Server: http://localhost:3000
   ```

2. **Frontend Console:**
   ```
   ready - started server on 0.0.0.0:3001
   ✓ Ready in Xms
   ```

3. **Browser:**
   - Dashboard loads with data
   - No errors in console
   - All navigation links work
   - Settings shows "API is Online"
   - ChatBot appears in bottom-right

4. **Test Scripts:**
   ```
   ✓ Health Check - Status: 200
   ✓ Get All Cases - Status: 200
   ✓ Get All Users - Status: 200
   ```

---

## 📝 Summary

1. **Start servers:** Run `.\start-servers.ps1`
2. **Verify backend:** http://localhost:3000/api/health
3. **Open dashboard:** http://localhost:3001
4. **Test connection:** Settings page → "Test Connection"
5. **Check data:** Dashboard should show statistics

**Both servers must run simultaneously for the dashboard to function!**

---

## 🆘 Still Having Issues?

1. **Review logs:** Check both terminal windows for errors
2. **Test endpoints:** Use `node test-connection.js`
3. **Visual test:** Open `connection-test.html` in browser
4. **Check MongoDB:** Ensure database is connected
5. **Restart everything:** Stop all processes and run `.\start-servers.ps1`

---

**Need Help?** Check the console logs or contact the development team.

📧 Email: cybercrime.odisha@gov.in
📞 Helpline: 1930
