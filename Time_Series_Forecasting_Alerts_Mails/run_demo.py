"""
Demo Script - Send Fraud Prevention Alerts (Auto-configured)
This script demonstrates the complete alert system using .env configuration
"""

from fraud_pattern_analyzer import FraudPatternAnalyzer
from alert_service import AlertService
import json
from datetime import datetime
import os
from dotenv import load_dotenv

def main():
    print("="*70)
    print("🚨 CYBER FRAUD PREVENTION ALERT SYSTEM - DEMO")
    print("="*70)
    
    # Load configuration from .env file
    load_dotenv()
    
    MONGODB_URI = os.getenv('MONGODB_URI', "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0")
    SENDER_EMAIL = os.getenv('SMTP_EMAIL')
    SENDER_PASSWORD = os.getenv('SMTP_PASSWORD')
    
    # Validate configuration
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("\n❌ Email configuration not found!")
        print("\nPlease configure .env file with:")
        print("  SMTP_EMAIL=your_email@gmail.com")
        print("  SMTP_PASSWORD=your_app_password")
        print("\nOr run the interactive version: demo_alert_system.py")
        return
    
    # Demo recipient emails
    DEMO_EMAILS = [
        'adityashravan2003@gmail.com',
        'anmoldev666@gmail.com',
        'nayak.swadhin25@gmail.com'
    ]
    
    print("\n✅ Email Configuration Loaded")
    print(f"   Sender: {SENDER_EMAIL}")
    print(f"   Recipients: {len(DEMO_EMAILS)} demo addresses")
    
    print("\n" + "="*70)
    print("STEP 1: Analyzing Fraud Patterns from MongoDB")
    print("="*70)
    
    # Initialize analyzer
    analyzer = FraudPatternAnalyzer(MONGODB_URI)
    
    # Generate analysis report
    print("\n📊 Generating comprehensive analysis...")
    report = analyzer.generate_comprehensive_report()
    
    # Display key insights
    print("\n✅ Analysis Complete!")
    print(f"\n📈 STATISTICS:")
    print(f"   Total Users: {report['total_users']}")
    print(f"   Total Cases: {report['total_cases']}")
    print(f"   Total Case Details: {report['total_case_details']}")
    
    print(f"\n⏰ PEAK FRAUD HOURS:")
    for peak in report['time_patterns']['peak_hours']:
        print(f"   - {peak['hour']}:00 - {(peak['hour']+1)%24}:00 ({peak['count']} cases)")
    
    print(f"\n🚨 RECOMMENDED ALERT TIMES (2 hours before peaks):")
    for hour in report['time_patterns']['recommended_alert_hours']:
        print(f"   - {hour}:00 (Send preventive alerts)")
    
    print(f"\n📍 HIGH-RISK LOCATIONS:")
    for loc in report['location_patterns']['high_risk_districts'][:3]:
        print(f"   - {loc['district']}: {loc['count']} cases")
    
    print(f"\n🎯 FRAUD TYPE DISTRIBUTION:")
    for fraud_type, count in list(report['fraud_types']['fraud_type_distribution'].items())[:5]:
        print(f"   - {fraud_type}: {count} cases")
    
    # Save report
    report_filename = f"fraud_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_filename, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    print(f"\n💾 Full report saved: {report_filename}")
    
    print("\n" + "="*70)
    print("STEP 2: Sending Preventive Alerts to Demo Users")
    print("="*70)
    
    # Initialize alert service
    alert_service = AlertService(
        sender_email=SENDER_EMAIL,
        sender_password=SENDER_PASSWORD
    )
    
    print(f"\n📧 Sending alerts to {len(DEMO_EMAILS)} demo recipients...")
    print("-"*70)
    
    # Send demo alerts
    results = alert_service.send_demo_alerts(DEMO_EMAILS, report)
    
    # Display results
    print("\n" + "="*70)
    print("ALERT DELIVERY RESULTS")
    print("="*70)
    
    success_count = sum(1 for r in results if r.get('success'))
    failure_count = len(results) - success_count
    
    print(f"\n✅ Successfully sent: {success_count}")
    print(f"❌ Failed: {failure_count}")
    
    print("\nDetailed Results:")
    for i, result in enumerate(results, 1):
        status = "✓ SUCCESS" if result.get('success') else "✗ FAILED"
        email = result.get('recipient', 'Unknown')
        print(f"  {i}. {email}: {status}")
        if not result.get('success'):
            print(f"     Error: {result.get('error', 'Unknown error')}")
    
    # Save results
    results_filename = f"alert_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_filename, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n💾 Results saved: {results_filename}")
    
    print("\n" + "="*70)
    print("DEMO COMPLETE!")
    print("="*70)
    print("\n📋 WHAT WAS DEMONSTRATED:")
    print("   1. ✓ Connected to MongoDB and analyzed fraud patterns")
    print("   2. ✓ Identified peak fraud hours and high-risk locations")
    print("   3. ✓ Generated preventive alert schedules")
    print("   4. ✓ Sent location-specific and general alerts via email")
    print("   5. ✓ Created detailed reports for analysis")
    
    print("\n🔗 INTEGRATION READY:")
    print("   - Use REST API (api_server.py) for WhatsApp bot integration")
    print("   - Endpoint: POST /api/alert/send")
    print("   - Supports bulk alerts and location-specific targeting")
    
    print("\n" + "="*70)
    
    # Close connections
    analyzer.close()
    
    print("\n✅ All done! Check the demo email addresses for alert messages.")
    print("📧 Check inbox for: " + ", ".join(DEMO_EMAILS))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Demo interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
