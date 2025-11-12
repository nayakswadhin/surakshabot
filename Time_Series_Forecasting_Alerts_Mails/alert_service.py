"""
Alert Service - Sends preventive fraud alerts via Email
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
import json
import base64

class AlertService:
    def __init__(self, smtp_host='smtp.gmail.com', smtp_port=587, 
                 sender_email=None, sender_password=None):
        """
        Initialize Alert Service
        
        For Gmail:
        - Enable 2-factor authentication
        - Generate App Password: https://myaccount.google.com/apppasswords
        """
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password
    
    def generate_general_alert_message(self, analysis_data):
        """Generate general preventive alert message in HTML format"""
        peak_hours = analysis_data.get('time_patterns', {}).get('peak_hours', [])
        high_risk_districts = analysis_data.get('location_patterns', {}).get('high_risk_districts', [])
        
        peak_hours_str = ', '.join([f"{p['hour']}:00-{(p['hour']+1)%24}:00" for p in peak_hours[:3]])
        districts_str = ', '.join([d['district'] for d in high_risk_districts[:3]])
        
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%);
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #000080;
        }}
        .logo-section {{
            background: #fff;
            padding: 15px;
            text-align: center;
        }}
        .emblem {{
            width: 80px;
            height: 80px;
            margin: 0 auto;
        }}
        .gov-title {{
            color: #000080;
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .subtitle {{
            color: #666;
            font-size: 14px;
        }}
        .alert-banner {{
            background: #ff4444;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }}
        .content {{
            padding: 30px;
        }}
        .greeting {{
            font-size: 16px;
            margin-bottom: 20px;
        }}
        .alert-box {{
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }}
        .section {{
            margin: 25px 0;
        }}
        .section-title {{
            color: #000080;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }}
        .icon {{
            margin-right: 8px;
            font-size: 20px;
        }}
        .info-list {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }}
        .info-item {{
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }}
        .info-item:before {{
            content: "•";
            position: absolute;
            left: 0;
            color: #ff4444;
            font-weight: bold;
            font-size: 20px;
        }}
        .tips-box {{
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }}
        .tip-item {{
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }}
        .tip-item:before {{
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
            font-size: 18px;
        }}
        .contact-box {{
            background: #e7f3ff;
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }}
        .contact-item {{
            margin: 10px 0;
            font-size: 16px;
        }}
        .helpline-number {{
            color: #0066cc;
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
        }}
        .disclaimer {{
            margin-top: 15px;
            font-style: italic;
        }}
        .badge {{
            display: inline-block;
            background: #ff4444;
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with National Colors -->
        <div class="header">
            <div class="logo-section">
                <div class="emblem">🇮🇳</div>
                <div class="gov-title">भारत सरकार<br>Government of India</div>
                <div class="subtitle">Ministry of Home Affairs</div>
                <div class="subtitle"><strong>Cyber Crime Prevention System</strong></div>
            </div>
        </div>
        
        <!-- Alert Banner -->
        <div class="alert-banner">
            🚨 CYBER FRAUD ALERT - STAY VIGILANT 🚨
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                <strong>Dear Citizen,</strong>
            </div>
            
            <p>This is an official preventive alert from the <strong>National Cyber Crime Reporting Portal (1930 Helpline)</strong>.</p>
            
            <!-- Alert Box -->
            <div class="alert-box">
                <strong>⚠️ HIGH ALERT:</strong> Based on comprehensive data analysis of recent cyber fraud incidents, we have identified increased fraudulent activities. Please exercise extreme caution.
            </div>
            
            <!-- Key Insights Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">📊</span> KEY INSIGHTS FROM DATA ANALYSIS
                </div>
                <div class="info-list">
                    <div class="info-item"><strong>Peak Fraud Hours:</strong> {peak_hours_str}</div>
                    <div class="info-item"><strong>High-Risk Areas:</strong> {districts_str}</div>
                    <div class="info-item"><strong>Most Common Frauds:</strong> WhatsApp Fraud, Social Media Impersonation, Digital Arrest Scams</div>
                    <div class="info-item"><strong>Alert Status:</strong> <span class="badge">PREVENTIVE</span></div>
                </div>
            </div>
            
            <!-- Safety Guidelines -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">🛡️</span> MANDATORY SAFETY GUIDELINES
                </div>
                <div class="tips-box">
                    <div class="tip-item">Be extra cautious during peak fraud hours mentioned above</div>
                    <div class="tip-item">Never share OTP, passwords, CVV, or banking credentials with anyone</div>
                    <div class="tip-item">Verify caller identity through official channels before sharing any information</div>
                    <div class="tip-item">Government agencies never ask for money or personal details via phone/WhatsApp</div>
                    <div class="tip-item">Do not click on suspicious links or download attachments from unknown sources</div>
                    <div class="tip-item">Report any suspicious activity immediately</div>
                </div>
            </div>
            
            <!-- Emergency Contact -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">📞</span> IMMEDIATE ASSISTANCE
                </div>
                <div class="contact-box">
                    <div class="contact-item"><strong>National Cyber Crime Helpline</strong></div>
                    <div class="helpline-number">1930</div>
                    <div class="contact-item">📧 Email: complaints@cybercrime.gov.in</div>
                    <div class="contact-item">🌐 Report Online: <a href="https://cybercrime.gov.in">cybercrime.gov.in</a></div>
                    <div class="contact-item">💬 WhatsApp Support: [Available 24/7]</div>
                    <div style="margin-top: 15px; padding: 10px; background: #fff; border-radius: 5px;">
                        <strong>⏰ Available 24x7</strong> | All calls are toll-free
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                <strong>Remember:</strong> Prevention is better than cure. Stay informed, stay alert, and report suspicious activities promptly.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div><strong>National Cyber Crime Reporting Portal</strong></div>
            <div>Ministry of Home Affairs, Government of India</div>
            <div style="margin-top: 10px;">
                Generated on: {datetime.now().strftime('%d %B %Y at %H:%M:%S IST')}
            </div>
            <div class="disclaimer">
                This is an automated preventive alert based on data analytics. Please do not reply to this email.
                For assistance, contact 1930 or visit cybercrime.gov.in
            </div>
        </div>
    </div>
</body>
</html>
"""
        return html_message
    
    def generate_location_specific_alert(self, user_location, analysis_data):
        """Generate location-specific alert message in HTML format - simplified professional version"""
        district = user_location.get('district', 'your area')
        area = user_location.get('area', 'your locality')
        
        location_patterns = analysis_data.get('location_patterns', {})
        district_count = location_patterns.get('district_fraud_count', {}).get(district, 0)
        
        # Get peak hours for this location
        peak_hours = analysis_data.get('time_patterns', {}).get('peak_hours', [])
        peak_hours_str = ', '.join([f"{p['hour']}:00-{(p['hour']+1)%24}:00" for p in peak_hours[:3]]) if peak_hours else "Evening hours"
        
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%);
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #000080;
        }}
        .logo-section {{
            background: #fff;
            padding: 15px;
            text-align: center;
        }}
        .emblem {{
            width: 80px;
            height: 80px;
            margin: 0 auto;
        }}
        .gov-title {{
            color: #000080;
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .subtitle {{
            color: #666;
            font-size: 14px;
        }}
        .alert-banner {{
            background: #ff4444;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }}
        .content {{
            padding: 30px;
        }}
        .greeting {{
            font-size: 16px;
            margin-bottom: 20px;
        }}
        .alert-box {{
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }}
        .section {{
            margin: 25px 0;
        }}
        .section-title {{
            color: #000080;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }}
        .icon {{
            margin-right: 8px;
            font-size: 20px;
        }}
        .info-list {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }}
        .info-item {{
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }}
        .info-item:before {{
            content: "•";
            position: absolute;
            left: 0;
            color: #ff4444;
            font-weight: bold;
            font-size: 20px;
        }}
        .tips-box {{
            padding-left: 25px;
            position: relative;
            font-weight: 500;
        }}
        .precaution-item:before {{
            content: "⚠️";
            position: absolute;
            left: 0;
            font-size: 16px;
        }}
        .fraud-types {{
            background: #f8f9fa;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }}
        .tip-item {{
            margin: 8px 0;
            padding-left: 25px;
            position: relative;
        }}
        .tip-item:before {{
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
            font-size: 18px;
        }}
        .contact-box {{
            background: #e8f5e9;
            border-left: 4px solid #28a745;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
        }}
        .contact-item {{
            margin: 8px 0;
        }}
        .helpline-number {{
            color: #000080;
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
            letter-spacing: 2px;
        }}
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
        }}
        .disclaimer {{
            margin-top: 15px;
            font-style: italic;
        }}
        .badge {{
            display: inline-block;
            background: #ff4444;
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with National Colors -->
        <div class="header">
            <div class="logo-section">
                <div class="emblem">🇮🇳</div>
                <div class="gov-title">भारत सरकार<br>Government of India</div>
                <div class="subtitle">Ministry of Home Affairs</div>
                <div class="subtitle"><strong>Cyber Crime Prevention System</strong></div>
            </div>
        </div>
        
        <!-- Alert Banner -->
        <div class="alert-banner">
            🚨 AREA-SPECIFIC CYBER FRAUD ALERT 🚨
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                <strong>Dear Citizen,</strong>
            </div>
            
            <p>This is an official preventive alert from the <strong>National Cyber Crime Reporting Portal (1930 Helpline)</strong> for residents of your area.</p>
            
            <!-- Alert Box -->
            <div class="alert-box">
                <strong>⚠️ AREA ALERT:</strong> Increased fraudulent activities have been detected in your locality. Please exercise heightened caution and follow the safety guidelines below.
            </div>
            
            <!-- Location Information -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">📍</span> YOUR AREA INFORMATION
                </div>
                <div class="info-list">
                    <div class="info-item"><strong>Location:</strong> {area}, {district}</div>
                    <div class="info-item"><strong>Recent Cases:</strong> {district_count} fraud incidents reported in {district}</div>
                    <div class="info-item"><strong>Peak Risk Hours:</strong> {peak_hours_str}</div>
                    <div class="info-item"><strong>Alert Level:</strong> <span class="badge">HIGH</span></div>
                </div>
            </div>
            
            <!-- Safety Guidelines -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">�️</span> SAFETY PRECAUTIONS FOR YOUR AREA
                </div>
                <div class="tips-box">
                    <div class="tip-item">Be extremely cautious with unknown calls and messages</div>
                    <div class="tip-item">Verify all financial requests through official channels only</div>
                    <div class="tip-item">Never share OTP, passwords, or banking credentials</div>
                    <div class="tip-item">Do not click on suspicious links or download unknown attachments</div>
                    <div class="tip-item">Government agencies never demand money via phone/WhatsApp</div>
                    <div class="tip-item">Enable two-factor authentication on all accounts</div>
                    <div class="tip-item">Report suspicious activities immediately to 1930</div>
                </div>
            </div>
            
            <!-- Common Frauds Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">⚠️</span> COMMON FRAUD TYPES
                </div>
                <div class="tips-box">
                    <div class="tip-item">WhatsApp/Social Media impersonation frauds</div>
                    <div class="tip-item">Digital Arrest and fake government official calls</div>
                    <div class="tip-item">Financial fraud - fake loans, investments, lottery</div>
                    <div class="tip-item">OTP/Banking credential theft attempts</div>
                </div>
            </div>
            
            <!-- Emergency Contact -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">📞</span> IMMEDIATE ASSISTANCE
                </div>
                <div class="contact-box">
                    <div class="contact-item"><strong>National Cyber Crime Helpline</strong></div>
                    <div class="helpline-number">1930</div>
                    <div class="contact-item">📧 Email: complaints@cybercrime.gov.in</div>
                    <div class="contact-item">🌐 Report Online: <a href="https://cybercrime.gov.in">cybercrime.gov.in</a></div>
                    <div class="contact-item">💬 WhatsApp Support: [Available 24/7]</div>
                    <div style="margin-top: 15px; padding: 10px; background: #fff; border-radius: 5px;">
                        <strong>⏰ Available 24x7</strong> | All calls are toll-free
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                <strong>Stay Alert:</strong> Due to increased activity in your area, please be extra vigilant and inform your family members about these precautions. Report any suspicious activity immediately.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div><strong>National Cyber Crime Reporting Portal</strong></div>
            <div>Ministry of Home Affairs, Government of India</div>
            <div style="margin-top: 10px;">
                Generated on: {datetime.now().strftime('%d %B %Y at %H:%M:%S IST')}
            </div>
            <div class="disclaimer">
                This is an automated preventive alert based on data analytics. Please do not reply to this email.
                For assistance, contact 1930 or visit cybercrime.gov.in
            </div>
        </div>
    </div>
</body>
</html>
"""
        return html_message
    
    def send_email_alert(self, recipient_email, recipient_name, subject, message):
        """Send HTML email alert to a user"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"National Cyber Crime Helpline <{self.sender_email}>"
            msg['To'] = recipient_email
            msg['Subject'] = subject
            
            # Add HTML content
            html_part = MIMEText(message, 'html')
            msg.attach(html_part)
            
            # Connect to SMTP server
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            
            # Send email
            server.sendmail(self.sender_email, recipient_email, msg.as_string())
            server.quit()
            
            return {
                'success': True,
                'recipient': recipient_email,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'recipient': recipient_email,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def send_bulk_alerts(self, users, analysis_data, alert_type='general'):
        """
        Send alerts to multiple users
        
        alert_type: 'general' or 'location_specific'
        """
        results = []
        
        for user in users:
            try:
                name = user.get('name', 'User')
                email = user.get('emailid')
                
                if not email:
                    continue
                
                # Generate appropriate message
                if alert_type == 'location_specific':
                    user_location = user.get('address', {})
                    message = self.generate_location_specific_alert(user_location, analysis_data)
                    subject = f"🚨 URGENT: Cyber Fraud Alert - {user_location.get('district', 'Your Area')} | Govt. of India"
                else:
                    message = self.generate_general_alert_message(analysis_data)
                    subject = "🚨 Preventive Cyber Fraud Alert - National Cyber Crime Helpline (1930) | Govt. of India"
                
                # Send email
                result = self.send_email_alert(email, name, subject, message)
                results.append(result)
                
                print(f"Alert sent to {name} ({email}): {'✓' if result['success'] else '✗'}")
                
            except Exception as e:
                print(f"Error sending to {email}: {e}")
                continue
        
        return results
    
    def send_demo_alerts(self, demo_emails, analysis_data):
        """Send demo alerts for presentation"""
        demo_users = [
            {'name': 'Demo User 1', 'emailid': demo_emails[0], 
             'address': {'district': 'Chennai', 'area': 'T Nagar'}},
            {'name': 'Demo User 2', 'emailid': demo_emails[1],
             'address': {'district': 'Mumbai', 'area': 'Andheri'}},
            {'name': 'Demo User 3', 'emailid': demo_emails[2],
             'address': {'district': 'Bangalore', 'area': 'Koramangala'}}
        ]
        
        print("\n📧 Sending Demo Alerts...")
        print("="*60)
        
        # Send general alert to first user
        print("\n1. Sending GENERAL alert...")
        result1 = self.send_bulk_alerts([demo_users[0]], analysis_data, alert_type='general')
        
        # Send location-specific alerts to others
        print("\n2. Sending LOCATION-SPECIFIC alerts...")
        result2 = self.send_bulk_alerts(demo_users[1:], analysis_data, alert_type='location_specific')
        
        return result1 + result2


if __name__ == "__main__":
    # Demo configuration
    print("="*60)
    print("ALERT SERVICE DEMO")
    print("="*60)
    print("\nTo use this service, you need:")
    print("1. Gmail account")
    print("2. Gmail App Password (not regular password)")
    print("\nHow to get App Password:")
    print("1. Go to: https://myaccount.google.com/apppasswords")
    print("2. Sign in to your Google account")
    print("3. Generate an app password for 'Mail'")
    print("4. Use that 16-character password below")
    print("="*60)
    
    # Placeholder - user needs to configure
    SENDER_EMAIL = "your_email@gmail.com"
    SENDER_APP_PASSWORD = "your_app_password_here"
    
    print("\n⚠️  Please configure SENDER_EMAIL and SENDER_APP_PASSWORD in the code")
    print("Then run: python alert_service.py")
