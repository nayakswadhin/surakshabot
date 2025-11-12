# Integration Guide for WhatsApp Bot

## 📋 Quick Integration Guide for Project Lead

This document explains how to integrate the Fraud Alert System into your existing WhatsApp chatbot.

---

## 🎯 What This System Provides

### 1. **Pattern Analysis**
- Analyzes MongoDB data to identify fraud patterns
- Finds peak fraud hours, high-risk locations, fraud types
- Returns structured JSON data

### 2. **Alert Generation**
- Creates preventive alert messages
- Supports general and location-specific alerts
- Pre-formatted messages ready to send

### 3. **REST API**
- Integration-ready HTTP endpoints
- No need to modify existing code
- Simple JSON request/response

---

## 🚀 Integration Methods

### Method 1: REST API (Recommended) ⭐

**Best for:** Existing WhatsApp bot that can make HTTP requests

#### Setup:
```bash
# Start the API server
python api_server.py
```

Server runs on: `http://localhost:5000`

#### Usage in WhatsApp Bot:

```python
import requests

# Example 1: Send alerts to all users
def send_preventive_alerts():
    response = requests.post('http://localhost:5000/api/alert/demo', json={
        'emails': ['user1@email.com', 'user2@email.com']
    })
    result = response.json()
    print(f"Alerts sent: {result['message']}")

# Example 2: Get fraud analysis
def get_fraud_patterns():
    response = requests.get('http://localhost:5000/api/analyze')
    data = response.json()
    
    peak_hours = data['data']['time_patterns']['peak_hours']
    high_risk_areas = data['data']['location_patterns']['high_risk_districts']
    
    return peak_hours, high_risk_areas

# Example 3: Send location-specific alert
def send_area_alert(district):
    response = requests.post('http://localhost:5000/api/alert/location', json={
        'district': district
    })
    return response.json()
```

---

### Method 2: Direct Module Import

**Best for:** Python-based WhatsApp bot

#### Usage:

```python
from fraud_pattern_analyzer import FraudPatternAnalyzer
from alert_service import AlertService

# Initialize
MONGODB_URI = "your_mongodb_uri"
analyzer = FraudPatternAnalyzer(MONGODB_URI)

# Get fraud patterns
report = analyzer.generate_comprehensive_report()

# Get alert message
alert_service = AlertService()
message = alert_service.generate_general_alert_message(report)

# Now send this message via your WhatsApp implementation
send_whatsapp_message(user_phone, message)
```

---

## 📡 API Endpoints Reference

### 1. Get Fraud Analysis
```http
GET http://localhost:5000/api/analyze
```

**Returns:**
```json
{
  "success": true,
  "data": {
    "time_patterns": {
      "peak_hours": [{"hour": 19, "count": 15}],
      "recommended_alert_hours": [17, 12, 23]
    },
    "location_patterns": {
      "high_risk_districts": [{"district": "Chennai", "count": 45}]
    },
    "fraud_types": {
      "fraud_type_distribution": {"WhatsApp Fraud": 45}
    }
  }
}
```

### 2. Send Alerts (Demo Mode)
```http
POST http://localhost:5000/api/alert/demo
Content-Type: application/json

{
  "emails": [
    "adityashravan2003@gmail.com",
    "anmoldev666@gmail.com",
    "nayak.swadhin25@gmail.com"
  ]
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Demo alerts sent to 3/3 recipients",
  "results": [...]
}
```

### 3. Send Location-Specific Alerts
```http
POST http://localhost:5000/api/alert/location
Content-Type: application/json

{
  "district": "Chennai",
  "area": "T Nagar"
}
```

### 4. Get Users by Location
```http
GET http://localhost:5000/api/users/location?district=Chennai
```

---

## 🔄 Scheduling Automatic Alerts

### Option A: Scheduled at Specific Times

```python
import schedule
import time
import requests

def send_morning_alert():
    """Send at 6 AM before peak fraud hours"""
    requests.post('http://localhost:5000/api/alert/send', json={
        'alert_type': 'general',
        'target': 'all'
    })

def send_evening_alert():
    """Send at 5 PM before evening peak"""
    requests.post('http://localhost:5000/api/alert/send', json={
        'alert_type': 'general',
        'target': 'all'
    })

# Schedule alerts
schedule.every().day.at("06:00").do(send_morning_alert)
schedule.every().day.at("17:00").do(send_evening_alert)

# Run scheduler
while True:
    schedule.run_pending()
    time.sleep(60)
```

### Option B: Smart Scheduling Based on Analysis

```python
import requests
import schedule

def setup_smart_alerts():
    # Get analysis
    response = requests.get('http://localhost:5000/api/analyze')
    data = response.json()
    
    # Get recommended alert hours
    alert_hours = data['data']['time_patterns']['recommended_alert_hours']
    
    # Schedule alerts at these hours
    for hour in alert_hours:
        schedule.every().day.at(f"{hour:02d}:00").do(send_preventive_alert)

def send_preventive_alert():
    requests.post('http://localhost:5000/api/alert/send', json={
        'alert_type': 'general',
        'target': 'all'
    })

# Setup and run
setup_smart_alerts()

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 🤖 WhatsApp Bot Commands Integration

Add these commands to your WhatsApp bot:

### Command: `/alert me`
User requests personal safety alert

```python
def handle_alert_command(user_phone):
    # Get user location from MongoDB
    user = get_user_by_phone(user_phone)
    district = user.get('address', {}).get('district')
    
    # Get fraud patterns
    response = requests.get('http://localhost:5000/api/analyze')
    patterns = response.json()['data']
    
    # Generate message
    message = f"""
🚨 CYBER FRAUD ALERT

Your Area: {district}
Peak Fraud Hours: {patterns['time_patterns']['peak_hours'][0]['hour']}:00

Stay safe! Report suspicious activity to 1930.
    """
    
    send_whatsapp_message(user_phone, message)
```

### Command: `/area alert`
Alert all users in a high-risk area

```python
def handle_area_alert_command(district):
    # Send location-specific alerts
    response = requests.post('http://localhost:5000/api/alert/location', json={
        'district': district
    })
    
    result = response.json()
    return f"Alert sent to {result['message']}"
```

### Command: `/stats`
Show fraud statistics

```python
def handle_stats_command():
    response = requests.get('http://localhost:5000/api/analyze')
    data = response.json()['data']
    
    stats = f"""
📊 Fraud Statistics

Total Cases: {data['fraud_types']['total_cases']}
Peak Hours: {', '.join([str(p['hour']) for p in data['time_patterns']['peak_hours']])}
High Risk Areas: {', '.join([d['district'] for d in data['location_patterns']['high_risk_districts'][:3]])}
    """
    
    return stats
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```
MONGODB_URI=mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
API_HOST=0.0.0.0
API_PORT=5000
```

### Load in Your Bot:
```python
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
```

---

## 📱 WhatsApp Message Format

The system generates messages in this format:

### General Alert:
```
🚨 CYBER FRAUD ALERT - Stay Safe Online! 🚨

Dear User,

This is a preventive alert from the 1930 Cyber Crime Helpline.

⚠️ HIGH ALERT: Based on recent data analysis...

📊 KEY INSIGHTS:
• Peak Fraud Hours: 19:00-20:00, 1:00-2:00
• High-Risk Areas: Chennai, Mumbai, Bangalore
• Most Common: WhatsApp Fraud, Social Media Impersonation

🛡️ SAFETY TIPS:
1. Be extra cautious during peak hours
2. Never share OTP, passwords, or banking details
3. Verify caller identity before sharing information
4. Report suspicious activities to 1930

📞 IMMEDIATE HELP:
• Call: 1930
• Report: cybercrime.gov.in
• WhatsApp: [Your Bot]

Stay alert, stay safe!
```

You can use this message as-is or customize it for WhatsApp formatting.

---

## 🧪 Testing

### Test API Connection:
```bash
curl http://localhost:5000/api/health
```

### Test Alert Sending:
```bash
curl -X POST http://localhost:5000/api/alert/demo \
  -H "Content-Type: application/json" \
  -d '{"emails": ["test@example.com"]}'
```

### Test Analysis:
```bash
curl http://localhost:5000/api/analyze
```

---

## 🚀 Deployment

### Local Development:
```bash
python api_server.py
```

### Production (with Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
```

### Using Docker:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "api_server.py"]
```

---

## 📊 Monitoring

### Check System Health:
```python
import requests

response = requests.get('http://localhost:5000/api/health')
if response.json()['status'] == 'healthy':
    print("✅ System running")
else:
    print("❌ System down")
```

---

## 🆘 Troubleshooting

### Issue: API not responding
```bash
# Check if running
curl http://localhost:5000/

# Restart server
python api_server.py
```

### Issue: MongoDB connection failed
```python
# Test connection
python check_mongodb_connection.py
```

### Issue: Email not sending
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled
- Ensure "Less secure apps" is OFF (use App Password instead)

---

## 📞 Contact

For integration support, refer to:
- `README.md` - Complete documentation
- `demo_alert_system.py` - Working example
- API endpoint responses - Self-documenting

---

## ✅ Integration Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Configure email credentials
- [ ] Start API server: `python api_server.py`
- [ ] Test endpoints with curl/Postman
- [ ] Integrate API calls into WhatsApp bot
- [ ] Implement message sending logic
- [ ] Set up scheduled alerts
- [ ] Test with demo emails
- [ ] Deploy to production
- [ ] Monitor and optimize

---

**System is ready for integration! 🚀**

Any questions? Test the demo first: `python demo_alert_system.py`
