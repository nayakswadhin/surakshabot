# 🚔 SurakshaBot - Complete System Guide

## 1930 Cyber Helpline, Odisha - Full Stack Application

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Backend API](#backend-api)
6. [Frontend Dashboard](#frontend-dashboard)
7. [Database Schema](#database-schema)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## System Overview

SurakshaBot is a comprehensive cyber crime management system consisting of:

1. **WhatsApp Bot** - Interactive chatbot for citizens to report cyber crimes
2. **Backend API** - Node.js/Express server handling bot logic and data
3. **Frontend Dashboard** - Next.js professional dashboard for monitoring and management
4. **MongoDB Database** - Stores users, complaints, and case details

### Key Features

✅ WhatsApp integration for easy complaint registration  
✅ Real-time dashboard with live statistics  
✅ Comprehensive complaint management  
✅ User tracking and management  
✅ Analytics and reporting  
✅ Formal government-grade interface  

---

## Architecture

```
┌─────────────────┐
│  WhatsApp User  │
└────────┬────────┘
         │ Messages
         ▼
┌─────────────────────┐      ┌──────────────┐
│  WhatsApp Business  │─────▶│   Backend    │
│       API           │      │   (Port 3000)│
└─────────────────────┘      └──────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────┐   ┌──────────┐   ┌──────────────┐
            │  MongoDB  │   │   APIs   │   │   Frontend   │
            │ Database  │   │          │   │  Dashboard   │
            └───────────┘   └────┬─────┘   │ (Port 3001)  │
                                 │         └──────────────┘
                                 │
                         ┌───────▼────────┐
                         │  Admin Panel   │
                         │   (Browser)    │
                         └────────────────┘
```

---

## Installation

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or Local)
- **WhatsApp Business Account** with API access
- **Git** for version control

### Step 1: Clone Repository

```bash
git clone https://github.com/nayakswadhin/surakshabot.git
cd surakshabot
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Configure Environment

Create `.env` file in root directory:

```env
# WhatsApp Bot Configuration
WHATSAPP_TOKEN=your_whatsapp_token
PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
PORT=3000

# Meta Graph API
GRAPH_API_URL=https://graph.facebook.com/v22.0

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
DB_NAME=suraksha_bot

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Running the Application

### Option 1: Start All Services (Recommended)

**Windows PowerShell:**
```powershell
.\start-all.ps1
```

**Windows CMD:**
```cmd
start-all.bat
```

**Manual (Separate Terminals):**

Terminal 1 - Backend:
```bash
npm start
# or for development
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev -- -p 3001
```

### Option 2: Development Mode with Auto-Reload

```bash
npm run dev
```

Then in another terminal:
```bash
cd frontend
npm run dev -- -p 3001
```

### Access Points

- **Backend API**: http://localhost:3000
- **Frontend Dashboard**: http://localhost:3001
- **API Health Check**: http://localhost:3000/api/health

---

## Backend API

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Health Check
```http
GET /health
```

#### WhatsApp Webhook
```http
GET /whatsapp/webhook
POST /whatsapp/webhook
```

#### Cases/Complaints

**Get All Cases:**
```http
GET /whatsapp/cases/all
Response: { success: true, data: [...] }
```

**Get Case by ID:**
```http
GET /whatsapp/case/:caseId
Response: { success: true, data: {...} }
```

**Get Cases by Aadhar:**
```http
GET /whatsapp/cases/:aadharNumber
Response: { success: true, data: [...] }
```

**Update Case Status:**
```http
PATCH /whatsapp/cases/:caseId
Body: { "status": "solved" }
Response: { success: true, data: {...}, message: "..." }
```

**Create Case:**
```http
POST /whatsapp/cases
Body: {
  "caseId": "CC...",
  "aadharNumber": "123456789012",
  "incidentDescription": "...",
  "caseCategory": "Financial",
  "typeOfFraud": "UPI Fraud",
  "status": "pending"
}
```

#### Users

**Get All Users:**
```http
GET /whatsapp/users/all
Response: { success: true, data: [...] }
```

**Get User by ID:**
```http
GET /whatsapp/users/:userId
Response: { success: true, data: {...} }
```

---

## Frontend Dashboard

### Pages

#### 1. Dashboard (`/`)
- **Statistics Cards**: Total complaints, solved, pending, users
- **Fraud Type Chart**: Visual distribution of fraud types
- **Recent Activity**: Latest complaint updates
- **Recent Complaints Table**: Quick overview of last 5 cases

#### 2. Complaints (`/complaints`)
- **Full List**: All registered complaints
- **Filters**: Search, status (pending/solved), category (Financial/Social)
- **Actions**: View details, update status
- **Pagination**: Navigate through large datasets

#### 3. Reports (`/reports`)
- **Charts**: Category distribution, monthly trends
- **Status Distribution**: Pending vs Solved visualization
- **District Analysis**: Location-based insights
- **Export**: Download reports (PDF/CSV)

#### 4. Analytics (`/analytics`)
- **Advanced Charts**: Fraud type breakdown
- **Date Range Filter**: Custom time period analysis
- **Trends**: Historical data visualization

#### 5. Users (`/users`)
- **User List**: All registered users
- **Search**: Filter by name, phone, email, Aadhar
- **Details**: View user information and complaint history

#### 6. Settings (`/settings`)
- **API Configuration**: Backend URL setup
- **Health Check**: Test connection status
- **Notifications**: Configure alerts
- **System Info**: Version and storage details

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  aadharNumber: String (12 digits, unique),
  name: String,
  fatherSpouseGuardianName: String,
  gender: Enum ["Male", "Female", "Others"],
  emailid: String,
  dob: Date,
  phoneNumber: String (10 digits),
  freeze: Boolean (default: false),
  caseIds: [ObjectId] (references Cases),
  address: {
    pincode: String (6 digits),
    area: String,
    village: String,
    district: String,
    postOffice: String,
    policeStation: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Cases Collection
```javascript
{
  _id: ObjectId,
  caseId: String (unique, auto-generated),
  aadharNumber: String (12 digits),
  incidentDescription: String,
  caseCategory: Enum ["Financial", "Social"],
  typeOfFraud: String (23 financial + 8 social types),
  status: Enum ["pending", "solved"],
  caseDetailsId: ObjectId (references CaseDetails),
  createdAt: Date,
  updatedAt: Date
}
```

### CaseDetails Collection
```javascript
{
  _id: ObjectId,
  caseId: ObjectId (references Cases),
  photos: [{
    url: String,
    fileName: String,
    uploadedAt: Date
  }],
  policeStationId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Configuration

### WhatsApp Business API Setup

1. **Create Meta Developer Account**: https://developers.facebook.com/
2. **Create WhatsApp Business App**
3. **Get Access Token** and **Phone Number ID**
4. **Configure Webhook**:
   - URL: `https://your-domain.com/api/whatsapp/webhook`
   - Verify Token: Your custom token (set in `.env`)
   - Subscribe to: `messages`

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

**Option 2: Local MongoDB**
```bash
# Install MongoDB locally
mongodb://localhost:27017/suraksha_bot
```

### Frontend Configuration

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## Testing

### Test Backend
```bash
node test-database.js
node test-endpoints.js
```

### Test Frontend
```bash
cd frontend
npm run lint
npm run build
```

### Manual Testing

1. **Start servers**
2. **Open Frontend**: http://localhost:3001
3. **Check Dashboard**: Statistics should load
4. **Test API**: http://localhost:3000/api/health should return OK
5. **Send WhatsApp Message**: "Hello" to configured number

---

## Deployment

### Backend Deployment (Heroku/Railway/AWS)

```bash
# Build
npm install --production

# Start
npm start
```

**Environment Variables**: Set all `.env` variables in hosting platform

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend
npm run build
npm start
```

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/suraksha_bot
  
  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000/api
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
```

---

## Troubleshooting

### Common Issues

**1. Frontend can't connect to backend**
- Ensure backend is running on port 3000
- Check `.env.local` configuration
- Verify CORS settings in backend

**2. WhatsApp bot not responding**
- Check webhook URL is publicly accessible
- Verify token matches in Meta and `.env`
- Check Meta app status

**3. Database connection failed**
- Verify MongoDB URI is correct
- Check network/firewall settings
- Ensure MongoDB service is running

**4. Charts not displaying**
- Clear browser cache
- Check browser console for errors
- Verify data is being returned from API

---

## Support & Contact

- **Email**: cybercrime.odisha@gov.in
- **Helpline**: 1930
- **Website**: Visit nearest police station

---

## License

© Government of Odisha - 1930 Cyber Helpline  
All Rights Reserved

---

**Developed for the People of Odisha** 🇮🇳
