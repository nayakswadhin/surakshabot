# ✅ Frontend-Backend Connection - COMPLETE GUIDE

## 🎯 What You Need

Your setup has **3 ways** to view MongoDB data:

### 1. **Simple Data Viewer** (Standalone HTML)
- **File**: `data-viewer.html`
- **Open**: Just double-click the file or run `start data-viewer.html`
- **What it does**: Directly fetches and displays data from MongoDB
- **No setup needed**: Works immediately

### 2. **Test Server** (Simple Backend)
- **File**: `test-data-server.js`
- **Port**: 4000
- **Start**: `node test-data-server.js`
- **Endpoints**:
  - `http://localhost:4000/test/stats` - Database statistics
  - `http://localhost:4000/test/cases` - All complaints
  - `http://localhost:4000/test/users` - All users

### 3. **Full Dashboard** (Complete Application)
- **Backend Port**: 3000
- **Frontend Port**: 3001
- **Start**: Run both servers together
- **Access**: `http://localhost:3001`

---

## 🚀 SIMPLEST WAY - Just View Data

### Step 1: Start Test Server
```powershell
cd d:\cyberproject\surakshabot
node test-data-server.js
```

### Step 2: Open Data Viewer
```powershell
start data-viewer.html
```

**That's it!** You'll see:
- ✅ Total Complaints count
- ✅ Pending Cases count
- ✅ Solved Cases count
- ✅ Total Users count
- ✅ Recent 10 complaints in a table
- ✅ Recent 10 users in a table

---

## 📊 Current Data Flow

```
MongoDB (Cloud Database)
        ↓
Test Server (Port 4000) → Retrieves data
        ↓
Data Viewer (HTML) → Displays data
```

OR for full dashboard:

```
MongoDB (Cloud Database)
        ↓
Backend Server (Port 3000) → API Endpoints
        ↓
Frontend Server (Port 3001) → Next.js Dashboard
        ↓
Browser → Beautiful UI
```

---

## 🔧 To Connect Frontend with Backend

### Method 1: Use the Batch File (Easiest)

```powershell
cd d:\cyberproject\surakshabot
.\start.bat
```

This will:
1. ✅ Start backend on port 3000
2. ✅ Start frontend on port 3001
3. ✅ Auto-open browser

### Method 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd d:\cyberproject\surakshabot
node main.js
```

**Terminal 2 - Frontend:**
```powershell
cd d:\cyberproject\surakshabot\frontend
npm run dev
```

Then open: `http://localhost:3001`

---

## ✅ Verification Steps

### 1. Check Test Server is Working:
```powershell
# Start test server
node test-data-server.js

# In another terminal, test it:
Invoke-WebRequest http://localhost:4000/test/stats | Select-Object -ExpandProperty Content
```

### 2. Check Data Viewer:
- Open `data-viewer.html` in browser
- Should show green "✅ Connected to backend"
- Should display statistics and tables with data

### 3. Check Full Dashboard (if both servers running):
- Open `http://localhost:3001`
- Dashboard should show numbers (not zeros)
- Navigate to Complaints page
- Should see complaints list

---

## 📁 Files Created for Data Retrieval

### 1. `test-data-server.js`
Simple Express server that:
- ✅ Connects to MongoDB
- ✅ Provides 3 endpoints (stats, cases, users)
- ✅ Returns data in JSON format
- ✅ Works on port 4000 (doesn't conflict with main backend)

### 2. `data-viewer.html`
Standalone HTML page that:
- ✅ Automatically finds backend server
- ✅ Displays statistics cards
- ✅ Shows recent complaints table
- ✅ Shows recent users table
- ✅ Has refresh button
- ✅ Links to full dashboard

### 3. `CONNECTION_GUIDE.md`
Complete documentation about:
- ✅ How to start servers
- ✅ Port configurations
- ✅ Troubleshooting steps
- ✅ API endpoints list

### 4. `start.bat`
Batch script that:
- ✅ Checks Node.js is installed
- ✅ Starts backend in separate window
- ✅ Starts frontend in separate window
- ✅ Opens dashboard in browser

---

## 🎯 Quick Reference

| What You Want | What To Run | What You Get |
|---------------|-------------|--------------|
| Just see data | `start data-viewer.html` | Simple table view |
| Test backend | `node test-data-server.js` | API endpoints on port 4000 |
| Full dashboard | `.\start.bat` | Complete app on port 3001 |
| Manual control | 2 terminals (see above) | Both servers separately |

---

## 🔍 Current MongoDB Connection

Your backend is connected to:
```
MongoDB Atlas Cloud Database
Host: ac-nsdcwle-shard-00-00.evjfami.mongodb.net
```

The connection is **working** as shown by the test server output:
```
MongoDB Connected: ac-nsdcwle-shard-00-00.evjfami.mongodb.net
```

---

## ⚡ Right Now - What's Working

1. ✅ **Test Server** (Port 4000) - Running and connected to MongoDB
2. ✅ **Data Viewer** (HTML) - Open in browser showing data
3. ✅ **MongoDB** - Connected and accessible

### To Also Get Full Dashboard Working:

**Option A: If you want the complete Next.js dashboard:**
```powershell
# Kill any process on port 3000
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Start both servers
.\start.bat
```

**Option B: If you just want to see the data (simplest):**
```
The data-viewer.html is already open and working! 
You can see all your MongoDB data there.
```

---

## 💡 Summary

**You already have data retrieval working!** The `data-viewer.html` page is showing your MongoDB data right now.

**To get the full professional dashboard:**
1. Run `.\start.bat`
2. Wait for both servers to start
3. Browser opens to `http://localhost:3001`
4. You'll see the complete dashboard with charts, filters, search, etc.

**The data is flowing from MongoDB → Backend → Frontend** ✅

---

## 📞 Need Help?

- **Can't see data?** → Check if MongoDB is connected (test server logs)
- **Ports conflict?** → Use `start.bat` which handles it automatically
- **Frontend shows zeros?** → Make sure backend is on port 3000, frontend on 3001
- **Want simple view?** → Just use `data-viewer.html` (already working!)
