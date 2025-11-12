"""
Automated Alert Scheduler
Automatically sends fraud prevention alerts at peak times
"""

import schedule
import time
from datetime import datetime
from fraud_pattern_analyzer import FraudPatternAnalyzer
from alert_service import AlertService
import os
from dotenv import load_dotenv
import logging

# Setup logging with UTF-8 encoding
import sys
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Set UTF-8 encoding for stdout (Windows compatibility)
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python < 3.7
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

logger = logging.getLogger(__name__)

# Load configuration
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0")
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

# Validate configuration
if not SMTP_EMAIL or not SMTP_PASSWORD:
    logger.error("Email configuration missing! Please set SMTP_EMAIL and SMTP_PASSWORD in .env file")
    exit(1)

# Initialize services
logger.info("Initializing services...")
analyzer = FraudPatternAnalyzer(MONGODB_URI)
alert_service = AlertService(sender_email=SMTP_EMAIL, sender_password=SMTP_PASSWORD)

def send_preventive_alerts():
    """Send preventive alerts to all users"""
    try:
        logger.info("="*70)
        logger.info("Starting automated alert job...")
        logger.info(f"Triggered at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Get fresh analysis
        logger.info("Analyzing fraud patterns...")
        report = analyzer.generate_comprehensive_report()
        
        # Get all users
        users = analyzer.get_all_users()
        logger.info(f"Found {len(users)} users in database")
        
        # Send general alerts
        logger.info("Sending general preventive alerts...")
        results = alert_service.send_bulk_alerts(users, report, alert_type='general')
        
        # Log results
        success_count = sum(1 for r in results if r.get('success'))
        failure_count = len(results) - success_count
        
        logger.info(f"Alert delivery complete!")
        logger.info(f"  [OK] Success: {success_count}/{len(results)}")
        logger.info(f"  [FAIL] Failed: {failure_count}/{len(results)}")
        
        if failure_count > 0:
            logger.warning(f"Some alerts failed. Check logs for details.")
            for result in results:
                if not result.get('success'):
                    logger.error(f"Failed to send to {result.get('recipient')}: {result.get('error')}")
        
        logger.info("Automated alert job completed successfully!")
        logger.info("="*70)
        
    except Exception as e:
        logger.error(f"Error in automated alert job: {e}")
        import traceback
        logger.error(traceback.format_exc())

def send_location_specific_alerts():
    """Send alerts to users in high-risk locations"""
    try:
        logger.info("="*70)
        logger.info("Starting location-specific alert job...")
        logger.info(f"Triggered at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Get fresh analysis
        report = analyzer.generate_comprehensive_report()
        
        # Get high-risk districts
        high_risk_districts = report['location_patterns']['high_risk_districts'][:3]
        
        logger.info(f"High-risk districts: {[d['district'] for d in high_risk_districts]}")
        
        total_sent = 0
        for district_info in high_risk_districts:
            district = district_info['district']
            logger.info(f"Sending alerts to {district}...")
            
            # Get users in this district
            users = analyzer.get_users_by_location(district=district)
            
            if users:
                results = alert_service.send_bulk_alerts(users, report, alert_type='location_specific')
                success_count = sum(1 for r in results if r.get('success'))
                total_sent += success_count
                logger.info(f"  {district}: {success_count} alerts sent")
        
        logger.info(f"Location-specific alerts complete! Total sent: {total_sent}")
        logger.info("="*70)
        
    except Exception as e:
        logger.error(f"Error in location-specific alert job: {e}")
        import traceback
        logger.error(traceback.format_exc())

def update_schedule():
    """Update schedule based on latest fraud pattern analysis"""
    try:
        logger.info("Updating alert schedule based on fraud patterns...")
        
        # Get current patterns
        report = analyzer.generate_comprehensive_report()
        alert_hours = report['time_patterns']['recommended_alert_hours']
        
        logger.info(f"Recommended alert times: {alert_hours}")
        
        # Clear existing schedule
        schedule.clear()
        
        # Schedule alerts at recommended times
        for hour in alert_hours:
            schedule.every().day.at(f"{hour:02d}:00").do(send_preventive_alerts)
            logger.info(f"  Scheduled general alert at {hour:02d}:00")
        
        # Also schedule location-specific alerts once per day
        schedule.every().day.at("07:00").do(send_location_specific_alerts)
        logger.info(f"  Scheduled location alerts at 07:00")
        
        # Schedule daily re-analysis
        schedule.every().day.at("00:00").do(update_schedule)
        
        logger.info("Alert schedule updated successfully!")
        
    except Exception as e:
        logger.error(f"Error updating schedule: {e}")

def run_scheduler():
    """Main scheduler loop"""
    logger.info("="*70)
    logger.info("CYBER FRAUD ALERT SCHEDULER STARTED")
    logger.info("="*70)
    logger.info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("")
    logger.info("Configuration:")
    logger.info(f"  MongoDB: Connected")
    logger.info(f"  Email: {SMTP_EMAIL}")
    logger.info(f"  Logs: scheduler.log")
    logger.info("")
    
    # Initial schedule setup
    update_schedule()
    
    logger.info("")
    logger.info("Current Schedule:")
    for job in schedule.get_jobs():
        logger.info(f"  - {job}")
    logger.info("")
    logger.info("[*] Scheduler running... (Press Ctrl+C to stop)")
    logger.info("="*70)
    logger.info("")
    
    # Run scheduler loop
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
            
    except KeyboardInterrupt:
        logger.info("")
        logger.info("="*70)
        logger.info("[!] Scheduler stopped by user")
        logger.info(f"Stopped at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("="*70)
        analyzer.close()
    except Exception as e:
        logger.error(f"Scheduler error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        analyzer.close()

if __name__ == "__main__":
    run_scheduler()
