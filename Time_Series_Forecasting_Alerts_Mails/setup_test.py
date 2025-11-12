"""
Quick Setup and Test Script
Run this to verify everything is working
"""

import sys

def check_dependencies():
    """Check if all required packages are installed"""
    print("Checking dependencies...")
    required = ['pymongo', 'flask', 'flask_cors', 'schedule']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} - MISSING")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print(f"Install with: pip install {' '.join(missing)}")
        return False
    
    print("\n✅ All dependencies installed!")
    return True

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\nTesting MongoDB connection...")
    try:
        from pymongo import MongoClient
        MONGODB_URI = "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0"
        
        client = MongoClient(MONGODB_URI)
        client.admin.command('ping')
        
        db = client['test']
        collections = db.list_collection_names()
        
        print(f"  ✓ Connected to MongoDB")
        print(f"  ✓ Database: test")
        print(f"  ✓ Collections: {', '.join(collections)}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"  ✗ MongoDB connection failed: {e}")
        return False

def test_analysis():
    """Test fraud pattern analysis"""
    print("\nTesting fraud pattern analysis...")
    try:
        from fraud_pattern_analyzer import FraudPatternAnalyzer
        
        MONGODB_URI = "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0"
        analyzer = FraudPatternAnalyzer(MONGODB_URI)
        
        report = analyzer.generate_comprehensive_report()
        
        print(f"  ✓ Analysis complete")
        print(f"  ✓ Total cases analyzed: {report['fraud_types']['total_cases']}")
        print(f"  ✓ Peak hours identified: {len(report['time_patterns']['peak_hours'])}")
        print(f"  ✓ High-risk districts: {len(report['location_patterns']['high_risk_districts'])}")
        
        analyzer.close()
        return True
        
    except Exception as e:
        print(f"  ✗ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def show_next_steps():
    """Show what to do next"""
    print("\n" + "="*70)
    print("✅ SETUP COMPLETE!")
    print("="*70)
    
    print("\n📋 NEXT STEPS:")
    print("\n1. Configure Email (Required for sending alerts):")
    print("   - Copy .env.example to .env")
    print("   - Add your Gmail address")
    print("   - Get App Password from: https://myaccount.google.com/apppasswords")
    print("   - Add the 16-character app password to .env")
    
    print("\n2. Run Demo:")
    print("   python demo_alert_system.py")
    
    print("\n3. Start API Server (for WhatsApp bot integration):")
    print("   python api_server.py")
    
    print("\n4. Test API Endpoints:")
    print("   - GET  http://localhost:5000/api/analyze")
    print("   - POST http://localhost:5000/api/alert/demo")
    
    print("\n📚 Documentation:")
    print("   - README.md - Complete guide")
    print("   - INTEGRATION_GUIDE.md - For your project lead")
    
    print("\n" + "="*70)

def main():
    print("="*70)
    print("🚀 CYBER FRAUD ALERT SYSTEM - SETUP & TEST")
    print("="*70)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first:")
        print("pip install -r requirements.txt")
        sys.exit(1)
    
    # Test MongoDB
    if not test_mongodb_connection():
        print("\n❌ MongoDB connection failed. Check your connection string.")
        sys.exit(1)
    
    # Test analysis
    if not test_analysis():
        print("\n❌ Analysis test failed. Check the error above.")
        sys.exit(1)
    
    # Show next steps
    show_next_steps()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
