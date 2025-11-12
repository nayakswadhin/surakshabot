"""
Manual Alert Trigger
Send alerts immediately without waiting for scheduled time
"""

import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass  # Fallback silently if encoding setup fails

from fraud_pattern_analyzer import FraudPatternAnalyzer
from alert_service import AlertService
from dotenv import load_dotenv
from datetime import datetime

def main():
    print("="*70)
    print("MANUAL ALERT TRIGGER")
    print("="*70)
    
    # Load configuration
    load_dotenv()
    
    MONGODB_URI = os.getenv('MONGODB_URI')
    SMTP_EMAIL = os.getenv('SMTP_EMAIL')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("\n[ERROR] Email configuration missing!")
        print("Please configure .env file with SMTP_EMAIL and SMTP_PASSWORD")
        return
    
    print(f"\n[OK] Configuration loaded")
    print(f"   Email: {SMTP_EMAIL}")
    
    # Initialize services
    print("\n[*] Connecting to MongoDB...")
    analyzer = FraudPatternAnalyzer(MONGODB_URI)
    alert_service = AlertService(sender_email=SMTP_EMAIL, sender_password=SMTP_PASSWORD)
    
    # Get analysis
    print("[*] Analyzing fraud patterns...")
    report = analyzer.generate_comprehensive_report()
    
    print(f"\n[OK] Analysis complete!")
    print(f"   Total Cases: {report['fraud_types']['total_cases']}")
    print(f"   Peak Hours: {', '.join([str(p['hour']) + ':00' for p in report['time_patterns']['peak_hours']])}")
    
    # Ask user what type of alert to send
    print("\n" + "="*70)
    print("SELECT ALERT TYPE:")
    print("="*70)
    print("1. General Alert - Send to all users")
    print("2. Location-Specific Alert - Send to specific district")
    print("3. Demo Alert - Send to test emails only")
    print("4. Cancel")
    print("="*70)
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        # Send general alerts
        print("\n[*] Sending GENERAL alerts to all users...")
        users = analyzer.get_all_users()
        print(f"   Found {len(users)} users")
        
        confirm = input(f"\nSend alerts to {len(users)} users? (yes/no): ").strip().lower()
        if confirm != 'yes':
            print("[CANCEL] Cancelled by user")
            return
        
        results = alert_service.send_bulk_alerts(users, report, alert_type='general')
        
    elif choice == '2':
        # Send location-specific alerts
        print("\n[*] HIGH-RISK DISTRICTS:")
        high_risk = report['location_patterns']['high_risk_districts'][:5]
        for i, d in enumerate(high_risk, 1):
            print(f"   {i}. {d['district']} ({d['count']} cases)")
        
        district_choice = input("\nEnter district number or name: ").strip()
        
        # Try to parse as number
        try:
            idx = int(district_choice) - 1
            district = high_risk[idx]['district']
        except:
            district = district_choice
        
        print(f"\n[*] Sending LOCATION-SPECIFIC alerts to {district}...")
        users = analyzer.get_users_by_location(district=district)
        
        if not users:
            print(f"[ERROR] No users found in {district}")
            return
        
        print(f"   Found {len(users)} users in {district}")
        
        confirm = input(f"\nSend alerts to {len(users)} users in {district}? (yes/no): ").strip().lower()
        if confirm != 'yes':
            print("[CANCEL] Cancelled by user")
            return
        
        results = alert_service.send_bulk_alerts(users, report, alert_type='location_specific')
        
    elif choice == '3':
        # Send demo alerts
        demo_emails = [
            os.getenv('DEMO_EMAIL_1', 'adityashravan2003@gmail.com'),
            os.getenv('DEMO_EMAIL_2', 'anmoldev666@gmail.com'),
            os.getenv('DEMO_EMAIL_3', 'nayak.swadhin25@gmail.com')
        ]
        
        print(f"\n[*] Sending DEMO alerts to:")
        for email in demo_emails:
            print(f"   - {email}")
        
        confirm = input(f"\nSend demo alerts? (yes/no): ").strip().lower()
        if confirm != 'yes':
            print("[CANCEL] Cancelled by user")
            return
        
        results = alert_service.send_demo_alerts(demo_emails, report)
        
    elif choice == '4':
        print("\n[CANCEL] Cancelled by user")
        return
    else:
        print("\n[ERROR] Invalid choice")
        return
    
    # Display results
    print("\n" + "="*70)
    print("[*] DELIVERY RESULTS")
    print("="*70)
    
    success_count = sum(1 for r in results if r.get('success'))
    failure_count = len(results) - success_count
    
    print(f"\n[OK] Successfully sent: {success_count}")
    print(f"[FAIL] Failed: {failure_count}")
    
    if failure_count > 0:
        print("\n[ERROR] Failed deliveries:")
        for result in results:
            if not result.get('success'):
                print(f"   - {result.get('recipient')}: {result.get('error')}")
    
    print("\n[OK] Alert sending complete!")
    print(f"[*] Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Close connections
    analyzer.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[!] Cancelled by user")
    except Exception as e:
        print(f"\n\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
