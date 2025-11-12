import pymongo
from pymongo import MongoClient
import json
from bson import json_util

# MongoDB connection string
MONGODB_URI = "mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/?appName=Cluster0"

def connect_and_inspect_db():
    try:
        # Connect to MongoDB
        print("Connecting to MongoDB...")
        client = MongoClient(MONGODB_URI)
        
        # Test the connection
        client.admin.command('ping')
        print("✓ Successfully connected to MongoDB!\n")
        
        # Access the 'test' database
        db = client['test']
        print("Accessing 'test' database...")
        
        # List all collections in the database
        collections = db.list_collection_names()
        print(f"Collections found: {collections}\n")
        
        # Inspect each collection
        target_collections = ['casedetails', 'cases', 'users']
        
        for collection_name in target_collections:
            if collection_name in collections:
                print(f"\n{'='*60}")
                print(f"Collection: {collection_name}")
                print(f"{'='*60}")
                
                collection = db[collection_name]
                
                # Get collection stats
                count = collection.count_documents({})
                print(f"Total documents: {count}")
                
                if count > 0:
                    # Get a sample document to inspect schema
                    sample_doc = collection.find_one()
                    print(f"\nSample document structure:")
                    print(json.dumps(sample_doc, indent=2, default=json_util.default))
                    
                    # Get field names
                    print(f"\nFields in collection:")
                    if sample_doc:
                        for field in sample_doc.keys():
                            field_type = type(sample_doc[field]).__name__
                            print(f"  - {field}: {field_type}")
                    
                    # Get index information
                    indexes = collection.list_indexes()
                    print(f"\nIndexes:")
                    for index in indexes:
                        print(f"  - {index['name']}: {index['key']}")
                else:
                    print("Collection is empty.")
            else:
                print(f"\n⚠ Collection '{collection_name}' not found in database.")
        
        print(f"\n{'='*60}")
        print("Database inspection complete!")
        print(f"{'='*60}")
        
        client.close()
        
    except pymongo.errors.ConnectionFailure as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
    except pymongo.errors.OperationFailure as e:
        print(f"✗ Authentication failed: {e}")
    except Exception as e:
        print(f"✗ An error occurred: {e}")

if __name__ == "__main__":
    connect_and_inspect_db()
