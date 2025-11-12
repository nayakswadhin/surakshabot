"""
Fraud Pattern Analyzer
Analyzes MongoDB data to identify:
- Peak fraud hours and days
- High-risk locations
- Fraud type patterns
- Generates preventive alert schedules
"""

import pymongo
from pymongo import MongoClient
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import json

class FraudPatternAnalyzer:
    def __init__(self, mongodb_uri, db_name='test'):
        """Initialize connection to MongoDB"""
        self.client = MongoClient(mongodb_uri)
        self.db = self.client[db_name]
        self.cases_collection = self.db['cases']
        self.users_collection = self.db['users']
        self.casedetails_collection = self.db['casedetails']
    
    def analyze_time_patterns(self):
        """Analyze when frauds occur most frequently"""
        cases = list(self.cases_collection.find({}))
        
        hourly_distribution = defaultdict(int)
        daily_distribution = defaultdict(int)
        fraud_type_by_hour = defaultdict(lambda: defaultdict(int))
        
        for case in cases:
            try:
                # Extract time from fraudDateTime
                fraud_time = case.get('fraudDateTime', {})
                time_str = fraud_time.get('time', '00:00')
                timestamp = fraud_time.get('timestamp')
                
                # Parse hour
                hour = int(time_str.split(':')[0])
                hourly_distribution[hour] += 1
                
                # Parse day of week if timestamp available
                if timestamp:
                    day_of_week = timestamp.strftime('%A')
                    daily_distribution[day_of_week] += 1
                
                # Fraud type distribution by hour
                fraud_type = case.get('typeOfFraud', 'Unknown')
                fraud_type_by_hour[hour][fraud_type] += 1
                
            except Exception as e:
                continue
        
        # Find peak hours (top 3)
        peak_hours = sorted(hourly_distribution.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Calculate alert times (2 hours before peak times)
        alert_hours = []
        for hour, count in peak_hours:
            alert_hour = (hour - 2) % 24
            alert_hours.append(alert_hour)
        
        return {
            'hourly_distribution': dict(hourly_distribution),
            'daily_distribution': dict(daily_distribution),
            'peak_hours': [{'hour': h, 'count': c} for h, c in peak_hours],
            'recommended_alert_hours': sorted(alert_hours),
            'fraud_type_by_hour': dict(fraud_type_by_hour)
        }
    
    def analyze_location_patterns(self):
        """Analyze high-risk locations"""
        cases = list(self.cases_collection.find({}))
        
        district_fraud_count = defaultdict(int)
        area_fraud_count = defaultdict(int)
        district_fraud_types = defaultdict(lambda: defaultdict(int))
        
        for case in cases:
            try:
                fraud_location = case.get('fraudLocation', {})
                district = fraud_location.get('district', 'Unknown')
                area = fraud_location.get('area', 'Unknown')
                fraud_type = case.get('typeOfFraud', 'Unknown')
                
                district_fraud_count[district] += 1
                area_fraud_count[area] += 1
                district_fraud_types[district][fraud_type] += 1
                
            except Exception as e:
                continue
        
        # Get top 5 high-risk districts
        high_risk_districts = sorted(district_fraud_count.items(), 
                                     key=lambda x: x[1], reverse=True)[:5]
        
        # Get top 5 high-risk areas
        high_risk_areas = sorted(area_fraud_count.items(), 
                                key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'district_fraud_count': dict(district_fraud_count),
            'area_fraud_count': dict(area_fraud_count),
            'high_risk_districts': [{'district': d, 'count': c} for d, c in high_risk_districts],
            'high_risk_areas': [{'area': a, 'count': c} for a, c in high_risk_areas],
            'district_fraud_types': dict(district_fraud_types)
        }
    
    def analyze_fraud_types(self):
        """Analyze distribution of fraud types"""
        cases = list(self.cases_collection.find({}))
        
        fraud_type_count = Counter()
        category_count = Counter()
        
        for case in cases:
            fraud_type = case.get('typeOfFraud', 'Unknown')
            category = case.get('caseCategory', 'Unknown')
            
            fraud_type_count[fraud_type] += 1
            category_count[category] += 1
        
        return {
            'fraud_type_distribution': dict(fraud_type_count),
            'category_distribution': dict(category_count),
            'total_cases': len(cases)
        }
    
    def get_users_by_location(self, district=None, area=None):
        """Get users from specific locations"""
        query = {}
        if district:
            query['address.district'] = district
        if area:
            query['address.area'] = area
        
        users = list(self.users_collection.find(query, {
            'name': 1, 
            'emailid': 1, 
            'phoneNumber': 1, 
            'address': 1,
            'aadharNumber': 1
        }))
        
        return users
    
    def get_all_users(self):
        """Get all users for mass alerts"""
        users = list(self.users_collection.find({}, {
            'name': 1, 
            'emailid': 1, 
            'phoneNumber': 1, 
            'address': 1,
            'aadharNumber': 1
        }))
        
        return users
    
    def generate_comprehensive_report(self):
        """Generate complete analysis report"""
        print("Analyzing fraud patterns...")
        
        time_patterns = self.analyze_time_patterns()
        location_patterns = self.analyze_location_patterns()
        fraud_types = self.analyze_fraud_types()
        
        report = {
            'analysis_timestamp': datetime.now().isoformat(),
            'time_patterns': time_patterns,
            'location_patterns': location_patterns,
            'fraud_types': fraud_types,
            'total_users': self.users_collection.count_documents({}),
            'total_cases': self.cases_collection.count_documents({}),
            'total_case_details': self.casedetails_collection.count_documents({})
        }
        
        return report
    
    def close(self):
        """Close MongoDB connection"""
        self.client.close()


if __name__ == "__main__":
    # Test the analyzer
    MONGODB_URI = "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0"
    
    analyzer = FraudPatternAnalyzer(MONGODB_URI)
    
    print("="*60)
    print("FRAUD PATTERN ANALYSIS REPORT")
    print("="*60)
    
    report = analyzer.generate_comprehensive_report()
    
    print("\n📊 FRAUD TYPE ANALYSIS:")
    print(f"Total Cases: {report['fraud_types']['total_cases']}")
    print("\nFraud Type Distribution:")
    for fraud_type, count in report['fraud_types']['fraud_type_distribution'].items():
        print(f"  - {fraud_type}: {count}")
    
    print("\n⏰ TIME PATTERN ANALYSIS:")
    print("Peak Fraud Hours:")
    for peak in report['time_patterns']['peak_hours']:
        print(f"  - {peak['hour']}:00 - {(peak['hour']+1)%24}:00 ({peak['count']} cases)")
    
    print(f"\n🚨 Recommended Alert Times (2 hours before peaks):")
    for hour in report['time_patterns']['recommended_alert_hours']:
        print(f"  - {hour}:00")
    
    print("\n📍 HIGH-RISK LOCATIONS:")
    print("Top Districts:")
    for loc in report['location_patterns']['high_risk_districts']:
        print(f"  - {loc['district']}: {loc['count']} cases")
    
    print("\nTop Areas:")
    for loc in report['location_patterns']['high_risk_areas']:
        print(f"  - {loc['area']}: {loc['count']} cases")
    
    # Save report to JSON
    with open('fraud_analysis_report.json', 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print("\n✅ Report saved to fraud_analysis_report.json")
    
    analyzer.close()
