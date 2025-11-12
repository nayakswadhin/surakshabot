"""
REST API for Fraud Alert System
Integration-ready endpoints for WhatsApp Bot
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from fraud_pattern_analyzer import FraudPatternAnalyzer
from alert_service import AlertService
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0")
SMTP_EMAIL = os.getenv('SMTP_EMAIL', 'your_email@gmail.com')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'your_app_password')

# Fixed recipient email
FIXED_RECIPIENT = "nayak.swadhin25@gmail.com"

# Initialize services
analyzer = FraudPatternAnalyzer(MONGODB_URI)
alert_service = AlertService(sender_email=SMTP_EMAIL, sender_password=SMTP_PASSWORD)

@app.route('/', methods=['GET'])
def home():
    """API Home - Check if service is running"""
    return jsonify({
        'service': 'Cyber Fraud Alert System API',
        'status': 'running',
        'version': '1.0',
        'fixed_recipient': FIXED_RECIPIENT,
        'endpoints': {
            'GET /': 'API information',
            'GET /api/analyze': 'Get fraud pattern analysis',
            'POST /api/alert/send': f'Send alert to {FIXED_RECIPIENT}',
            'POST /api/alert/location': f'Send location-specific alert to {FIXED_RECIPIENT}',
            'GET /api/users/location': 'Get users by location',
            'GET /api/health': 'Health check'
        }
    })

@app.route('/api/analyze', methods=['GET'])
def get_analysis():
    """
    Get comprehensive fraud pattern analysis
    
    Returns:
        JSON with time patterns, location patterns, fraud types
    """
    try:
        report = analyzer.generate_comprehensive_report()
        return jsonify({
            'success': True,
            'data': report,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/alert/send', methods=['POST'])
def send_alerts():
    """
    Send alert to nayak.swadhin25@gmail.com
    
    Body (JSON):
    {
        "alert_type": "general" or "location_specific" (optional, default: "general")
    }
    """
    try:
        data = request.get_json() or {}
        alert_type = data.get('alert_type', 'general')
        
        # Check email configuration
        if SMTP_EMAIL == 'your_email@gmail.com' or SMTP_PASSWORD == 'your_app_password':
            return jsonify({
                'success': False,
                'error': 'Email configuration not set. Please check .env file for SMTP_EMAIL and SMTP_PASSWORD',
                'recipient': FIXED_RECIPIENT,
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Get analysis data
        analysis_data = analyzer.generate_comprehensive_report()
        
        # Create single user object for fixed recipient
        # Note: alert_service expects 'emailid' not 'email'
        user = {
            'emailid': FIXED_RECIPIENT,
            'name': 'Swadhin Nayak',
            'district': 'General'
        }
        
        # Send alert to fixed recipient only
        results = alert_service.send_bulk_alerts([user], analysis_data, alert_type=alert_type)
        
        # Check if successful
        if not results or len(results) == 0:
            return jsonify({
                'success': False,
                'error': 'No results returned from alert service',
                'recipient': FIXED_RECIPIENT,
                'alert_type': alert_type,
                'timestamp': datetime.now().isoformat()
            }), 500
        
        success = results[0].get('success', False)
        error_msg = results[0].get('error', 'Unknown error')
        
        return jsonify({
            'success': success,
            'message': f'Alert sent to {FIXED_RECIPIENT}' if success else f'Failed to send alert: {error_msg}',
            'recipient': FIXED_RECIPIENT,
            'alert_type': alert_type,
            'result': results[0],
            'timestamp': datetime.now().isoformat()
        }), 200 if success else 500
        
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc(),
            'recipient': FIXED_RECIPIENT
        }), 500

@app.route('/api/alert/location', methods=['POST'])
def send_location_alerts():
    """
    Send location-specific alert to nayak.swadhin25@gmail.com
    
    Body (JSON):
    {
        "district": "Chennai" (optional),
        "area": "T Nagar" (optional)
    }
    """
    try:
        data = request.get_json() or {}
        district = data.get('district', 'General')
        area = data.get('area')
        
        # Get analysis data
        analysis_data = analyzer.generate_comprehensive_report()
        
        # Create single user object for fixed recipient with location
        user = {
            'emailid': FIXED_RECIPIENT,
            'name': 'Swadhin Nayak',
            'address': {
                'district': district,
                'area': area
            }
        }
        
        # Send location-specific alert
        results = alert_service.send_bulk_alerts([user], analysis_data, alert_type='location_specific')
        
        success = results[0].get('success') if results else False
        
        return jsonify({
            'success': success,
            'message': f'Location alert sent to {FIXED_RECIPIENT}' if success else 'Failed to send alert',
            'recipient': FIXED_RECIPIENT,
            'location': {'district': district, 'area': area},
            'result': results[0] if results else None,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/users/location', methods=['GET'])
def get_users_by_location():
    """
    Get users from specific location
    
    Query params:
        district: District name
        area: Area name
    """
    try:
        district = request.args.get('district')
        area = request.args.get('area')
        
        users = analyzer.get_users_by_location(district=district, area=area)
        
        return jsonify({
            'success': True,
            'count': len(users),
            'users': users,
            'location': {'district': district, 'area': area}
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        analyzer.db.command('ping')
        
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'recipient': FIXED_RECIPIENT,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("="*60)
    print("🚀 Cyber Fraud Alert System API")
    print("="*60)
    print(f"\n📧 Fixed Recipient: {FIXED_RECIPIENT}")
    print("\n📋 Available Endpoints:")
    print("  GET  / - API Info")
    print("  GET  /api/analyze - Get fraud analysis")
    print(f"  POST /api/alert/send - Send alert to {FIXED_RECIPIENT}")
    print(f"  POST /api/alert/location - Send location alert to {FIXED_RECIPIENT}")
    print("  GET  /api/users/location - Get users by location")
    print("  GET  /api/health - Health check")
    print("\n🌐 Starting server on http://localhost:5000")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)