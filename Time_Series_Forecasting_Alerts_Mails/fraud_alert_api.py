from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
from dotenv import load_dotenv
from alert_service import AlertService
from fraud_pattern_analyzer import FraudPatternAnalyzer
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Fraud Alert API",
    description="API for sending fraud pattern alerts via email",
    version="1.0.0"
)

# Email request model
class EmailRequest(BaseModel):
    recipient: EmailStr = "nayak.swadhin25@gmail.com"
    alert_type: Optional[str] = "general"
    district: Optional[str] = None

# Health check endpoint
@app.get("/")
def read_root():
    return {
        "status": "active",
        "service": "Fraud Alert API",
        "timestamp": datetime.now().isoformat()
    }

# Send email endpoint
@app.post("/send-alert")
def send_alert(email_request: EmailRequest):
    """
    Send fraud pattern alert email
    
    - **recipient**: Email address (default: nayak.swadhin25@gmail.com)
    - **alert_type**: Type of alert (general, location_specific, demo)
    - **district**: District name (required for location_specific alerts)
    """
    try:
        # Get email credentials
        SMTP_EMAIL = os.getenv('SMTP_EMAIL')
        SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
        MONGODB_URI = os.getenv('MONGODB_URI')
        
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            raise HTTPException(
                status_code=500,
                detail="Email configuration missing. Check .env file."
            )
        
        # Initialize services
        analyzer = FraudPatternAnalyzer(MONGODB_URI)
        alert_service = AlertService(
            sender_email=SMTP_EMAIL,
            sender_password=SMTP_PASSWORD
        )
        
        # Generate fraud report
        report = analyzer.generate_comprehensive_report()
        
        # Prepare user data
        user = {
            'email': email_request.recipient,
            'name': 'User',
            'district': email_request.district or 'General'
        }
        
        # Send alert based on type
        if email_request.alert_type == "demo":
            results = alert_service.send_demo_alerts(
                [email_request.recipient],
                report
            )
        else:
            results = alert_service.send_bulk_alerts(
                [user],
                report,
                alert_type=email_request.alert_type
            )
        
        # Close connections
        analyzer.close()
        
        # Check results
        if results and results[0].get('success'):
            return {
                "status": "success",
                "message": f"Alert sent successfully to {email_request.recipient}",
                "recipient": email_request.recipient,
                "alert_type": email_request.alert_type,
                "timestamp": datetime.now().isoformat(),
                "report_summary": {
                    "total_cases": report['fraud_types']['total_cases'],
                    "peak_hours": [p['hour'] for p in report['time_patterns']['peak_hours'][:3]]
                }
            }
        else:
            error_msg = results[0].get('error', 'Unknown error') if results else 'No results'
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send alert: {error_msg}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Get fraud report endpoint
@app.get("/fraud-report")
def get_fraud_report():
    """
    Get comprehensive fraud pattern analysis report
    """
    try:
        MONGODB_URI = os.getenv('MONGODB_URI')
        analyzer = FraudPatternAnalyzer(MONGODB_URI)
        report = analyzer.generate_comprehensive_report()
        analyzer.close()
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "report": report
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )

# Quick send to default email
@app.post("/send-alert-now")
def send_alert_now():
    """
    Quickly send alert to default email: nayak.swadhin25@gmail.com
    """
    email_request = EmailRequest()
    return send_alert(email_request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)