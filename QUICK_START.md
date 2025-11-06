# 🚀 Quick Start Guide - SurakshaBot Dashboard

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

## 📦 Installation

### 1. Backend Setup
```bash
cd d:\cyberproject\surakshabot
npm install
```

### 2. Frontend Setup
```bash
cd d:\cyberproject\surakshabot\frontend
npm install
```

## ⚙️ Configuration

### Backend (.env file)
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
PHONE_NUMBER_ID=your_phone_number_id
VERIFY_TOKEN=your_verify_token
```

### Frontend (.env.local file)
Already created in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🚀 Running the Application

### Option 1: Run Both Servers Together (Recommended)

#### Using PowerShell Script:
```powershell
cd d:\cyberproject\surakshabot
.\start-all.ps1
```

#### Using Batch File:
```cmd
cd d:\cyberproject\surakshabot
start-all.bat
```

### Option 2: Run Servers Separately

#### Terminal 1 - Backend Server:
```bash
cd d:\cyberproject\surakshabot
node main.js
```
Backend will run on: http://localhost:3000

#### Terminal 2 - Frontend Server:
```bash
cd d:\cyberproject\surakshabot\frontend
npm run dev
```
Frontend will run on: http://localhost:3001

## 🌐 Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3001
```

## 📋 Available Pages

1. **Dashboard** (`/`) - Overview with statistics and charts
2. **Complaints** (`/complaints`) - Manage all cyber crime complaints
3. **Reports** (`/reports`) - Statistical reports with visualizations
4. **Analytics** (`/analytics`) - Advanced analytics with date filtering
5. **Users** (`/users`) - User management and details
6. **Settings** (`/settings`) - System configuration and preferences

## 💬 ChatBot Widget

The chatbot assistant is available on all pages:
- Click the chat icon in the bottom-right corner
- Ask questions about:
  - Registering complaints
  - Checking complaint status
  - Contact information
  - Types of fraud handled
  - General help

## 🧪 Testing

### Test Backend API:
```bash
cd d:\cyberproject\surakshabot
node test-endpoints.js
```

### Test Database Connection:
```bash
cd d:\cyberproject\surakshabot
node test-database.js
```

## 🔍 Troubleshooting

### Backend not connecting?
1. Check MongoDB is running
2. Verify `.env` file configuration
3. Check port 3000 is available
4. Run: `node test-database.js`

### Frontend not loading?
1. Check backend is running on port 3000
2. Verify `.env.local` file exists
3. Check port 3001 is available
4. Clear browser cache and reload

### API connection error in Settings?
1. Ensure backend is running
2. Click "Test Connection" in Settings page
3. Check browser console for errors
4. Verify API URL in Settings matches backend

### ChatBot not appearing?
1. Clear browser cache
2. Check browser console for errors
3. Verify ChatBot component is imported in layout.tsx

## 📱 Default Credentials

For development/testing, you may need to set up:
- Admin access (if authentication is added)
- WhatsApp Business API credentials
- MongoDB admin user

## 🛠️ Development Commands

### Backend:
```bash
node main.js              # Start server
node test-endpoints.js    # Test API endpoints
node test-database.js     # Test DB connection
```

### Frontend:
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

## 📚 Documentation

- **FLOW_DOCUMENTATION.md** - Backend flow and architecture
- **TESTING_GUIDE.md** - Testing procedures
- **FEATURES.md** - Complete feature list
- **DEPLOYMENT_GUIDE.md** - Production deployment guide

## 🆘 Support

For issues or questions:
- Check the documentation files
- Review error logs in terminal
- Test API endpoints individually
- Verify all dependencies are installed

## 🎯 Quick Checklist

✅ MongoDB is running
✅ Backend .env file configured
✅ Frontend .env.local file exists
✅ npm install completed for both backend and frontend
✅ Backend running on port 3000
✅ Frontend running on port 3001
✅ Browser opened to http://localhost:3001
✅ All pages are accessible via navbar
✅ ChatBot widget appears in bottom-right corner

---

**Ready to go! 🎉**

Your SurakshaBot Dashboard is now running. Navigate through the pages using the navbar and interact with the chatbot for assistance.
