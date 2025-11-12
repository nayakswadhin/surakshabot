# Cyber Fraud Prevention Alert System 🚨

A comprehensive fraud prevention system that analyzes patterns from MongoDB and sends proactive alerts to users BEFORE peak fraud times.

## 🎯 Project Overview

This system is designed as a feature for the 1930 Cyber Crime Helpline WhatsApp Chatbot. It analyzes fraud patterns from historical data and sends preventive alerts to users via email (and WhatsApp integration-ready).

### Key Features:
- ✅ **Pattern Analysis**: Identifies peak fraud hours, high-risk locations, and common fraud types
- ✅ **Preventive Alerts**: Sends warnings 2 hours BEFORE peak fraud times
- ✅ **Location-Specific Targeting**: Alerts users in high-risk areas
- ✅ **REST API**: Integration-ready endpoints for WhatsApp bot
- ✅ **Email Notifications**: SMTP-based alert delivery
- ✅ **Bulk Operations**: Send alerts to all users or filtered by location

---

## 📁 Project Structure

```
Cyber_Dogesh_Clustering/
├── fraud_pattern_analyzer.py   # Analyzes fraud patterns from MongoDB
├── alert_service.py             # Sends email alerts to users
├── api_server.py                # REST API for WhatsApp bot integration
├── demo_alert_system.py         # Complete demo script
├── check_mongodb_connection.py  # Verify MongoDB connection
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Email (Gmail)

**Get Gmail App Password:**
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in to your Google account
3. Create an app password for "Mail"
4. Copy the 16-character password

### 3. Run Demo

```bash
python demo_alert_system.py
```

The demo will:
- Analyze fraud patterns from MongoDB
- Show peak fraud hours and high-risk locations
- Send demo alerts to specified emails

---

## 📊 Analysis Features

### Time Pattern Analysis
- Identifies peak fraud hours (when most frauds occur)
- Calculates recommended alert times (2 hours before peaks)
- Analyzes fraud type distribution by time

### Location Pattern Analysis
- High-risk districts and areas
- Fraud type distribution by location
- Location-specific targeting for alerts

### Fraud Type Analysis
- Most common fraud types
- Category distribution
- Trend analysis

---

## 🔔 Alert System

### General Alerts
Sent to all users with:
- Peak fraud hours warning
- High-risk areas information
- Safety tips and precautions
- Helpline numbers

### Location-Specific Alerts
Sent to users in high-risk areas with:
- Area-specific fraud statistics
- Immediate precautions
- Common fraud types in their location

---

## 🌐 REST API for WhatsApp Bot Integration

### Start API Server

```bash
python api_server.py
```

Server runs on: `http://localhost:5000`

### API Endpoints

#### 1. Get Fraud Analysis
```http
GET /api/analyze
```

**Response:**
```json
{
  "success": true,
  "data": {
    "time_patterns": {...},
    "location_patterns": {...},
    "fraud_types": {...}
  }
}
```

#### 2. Send Alerts to All Users
```http
POST /api/alert/send
Content-Type: application/json

{
  "alert_type": "general",
  "target": "all"
}
```

#### 3. Send Demo Alerts
```http
POST /api/alert/demo
Content-Type: application/json

{
  "emails": [
    "adityashravan2003@gmail.com",
    "anmoldev666@gmail.com",
    "nayak.swadhin25@gmail.com"
  ]
}
```

#### 4. Send Location-Specific Alerts
```http
POST /api/alert/location
Content-Type: application/json

{
  "district": "Chennai",
  "area": "T Nagar"
}
```

#### 5. Get Users by Location
```http
GET /api/users/location?district=Chennai&area=T Nagar
```

#### 6. Health Check
```http
GET /api/health
```

---

## 🔗 WhatsApp Bot Integration Guide

### For Your Project Lead:

The API is designed to be easily integrated into your WhatsApp bot. Here's how:

### Option 1: Scheduled Alerts
```python
import requests
import schedule
import time

def send_preventive_alerts():
    # Get analysis first
    analysis = requests.get('http://localhost:5000/api/analyze').json()
    
    # Get recommended alert hours
    alert_hours = analysis['data']['time_patterns']['recommended_alert_hours']
    
    # Send alerts to all users
    response = requests.post('http://localhost:5000/api/alert/send', json={
        'alert_type': 'general',
        'target': 'all'
    })
    
    print(f"Alerts sent: {response.json()}")

# Schedule alerts at recommended times
schedule.every().day.at("06:00").do(send_preventive_alerts)
schedule.every().day.at("18:00").do(send_preventive_alerts)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### Option 2: On-Demand via WhatsApp Command
```python
from flask import Flask, request
import requests

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def whatsapp_webhook():
    # Parse WhatsApp message
    message = request.json.get('message', '').lower()
    user_phone = request.json.get('from')
    
    if 'alert' in message or 'warning' in message:
        # Get user's location from MongoDB
        user_data = get_user_by_phone(user_phone)
        district = user_data.get('address', {}).get('district')
        
        # Send location-specific alert
        response = requests.post('http://localhost:5000/api/alert/location', json={
            'district': district
        })
        
        return {"status": "Alert sent to your area"}
    
    return {"status": "ok"}
```

### Option 3: Direct Module Import
```python
from fraud_pattern_analyzer import FraudPatternAnalyzer
from alert_service import AlertService

# Initialize
analyzer = FraudPatternAnalyzer(MONGODB_URI)
alert_service = AlertService(email, password)

# Get analysis
report = analyzer.generate_comprehensive_report()

# Send alerts via WhatsApp (you implement WhatsApp sending)
users = analyzer.get_all_users()
for user in users:
    message = alert_service.generate_general_alert_message(report)
    send_whatsapp_message(user['phoneNumber'], message)
```

---

## 📧 Email Configuration

### Environment Variables (Recommended)

Create a `.env` file:
```
MONGODB_URI=mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

Load in code:
```python
from dotenv import load_dotenv
import os

load_dotenv()
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
```

---

## 🎬 Demo for Judges

### Run Complete Demo:
```bash
python demo_alert_system.py
```

### What It Shows:
1. ✅ MongoDB connection and data analysis
2. ✅ Pattern identification (time, location, fraud types)
3. ✅ Alert generation with real insights
4. ✅ Email delivery to demo addresses
5. ✅ Detailed reports and statistics

### Demo Email Recipients:
- adityashravan2003@gmail.com
- anmoldev666@gmail.com
- nayak.swadhin25@gmail.com

---

## 📊 Sample Analysis Output

```
FRAUD PATTERN ANALYSIS REPORT
============================================================

📈 STATISTICS:
   Total Users: 50
   Total Cases: 110
   Total Case Details: 110

⏰ PEAK FRAUD HOURS:
   - 1:00 - 2:00 (15 cases)
   - 19:00 - 20:00 (12 cases)
   - 14:00 - 15:00 (10 cases)

🚨 RECOMMENDED ALERT TIMES (2 hours before peaks):
   - 12:00 (Send preventive alerts)
   - 17:00 (Send preventive alerts)
   - 23:00 (Send preventive alerts)

📍 HIGH-RISK LOCATIONS:
   - Chennai: 45 cases
   - Mumbai: 32 cases
   - Bangalore: 28 cases

🎯 FRAUD TYPE DISTRIBUTION:
   - WhatsApp Fraud: 45 cases
   - Social Media Impersonation: 35 cases
   - Financial Fraud: 30 cases
```

---

## 🛠️ Technical Details

### Technologies Used:
- **Python 3.x**
- **MongoDB** (PyMongo) - Data storage and retrieval
- **Flask** - REST API framework
- **SMTP** - Email delivery
- **Schedule** - Task scheduling

### Database Schema:
- **users** - User information (50 documents)
- **cases** - Fraud cases (110 documents)
- **casedetails** - Detailed case information (110 documents)

---

## 🔒 Security Notes

1. **Never commit credentials** to version control
2. Use **environment variables** for sensitive data
3. Use **Gmail App Passwords**, not regular passwords
4. Consider **rate limiting** for API endpoints
5. Implement **authentication** for production API

---

## 📝 Future Enhancements

- [ ] WhatsApp Business API integration
- [ ] SMS alerts via Twilio
- [ ] Machine Learning for fraud prediction
- [ ] Real-time alerts based on live data
- [ ] Admin dashboard for monitoring
- [ ] Multi-language support
- [ ] Push notifications

---

## 🤝 Integration Checklist for Project Lead

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Configure email credentials (Gmail App Password)
- [ ] Test API endpoints: `python api_server.py`
- [ ] Review API documentation above
- [ ] Choose integration method (scheduled/on-demand/direct)
- [ ] Implement WhatsApp message sending with alert content
- [ ] Test with demo emails
- [ ] Deploy API server
- [ ] Set up scheduled alerts
- [ ] Monitor and optimize

---

## 📞 Support

For questions or issues:
1. Check API health: `GET /api/health`
2. Review logs in terminal
3. Verify MongoDB connection
4. Test email configuration

---

## 🎓 Demonstration Tips for Judges

1. **Start with MongoDB connection demo** - Show live data
2. **Run pattern analysis** - Display visual insights
3. **Send live demo alerts** - Check emails in real-time
4. **Show API endpoints** - Demonstrate integration readiness
5. **Explain preventive approach** - Alerts BEFORE peak times
6. **Highlight location targeting** - Smart, relevant alerts

---

## ✅ System Ready for:
- ✓ Demo to judges
- ✓ WhatsApp bot integration
- ✓ Production deployment
- ✓ Real-world usage

**Built with ❤️ for 1930 Cyber Crime Helpline**
