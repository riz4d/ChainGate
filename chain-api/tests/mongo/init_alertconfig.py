#!/usr/bin/env python3
"""
Test script to initialize MongoDB with alert configuration defaults
"""
from pymongo import MongoClient
import sys
import os
import datetime

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import MongoDB connection string
from accesscontrol.connections.mongodb.dbconf import con_string
from config.config import MONGODB

def initialize_alert_config():
    """
    Initialize the MongoDB database with default alert configuration
    """
    try:
        # Connect to MongoDB
        client = MongoClient(con_string)
        db = client[MONGODB["database_name"]]
        
        # Create or get the alertconfig collection
        alertconfig_collection = db["alertconfig"]
        
        # Check if collection already has data
        existing_config = alertconfig_collection.find_one({})
        
        if existing_config:
            print(f"Alert configuration already exists. Deleting and replacing with new format...")
            alertconfig_collection.delete_one({"_id": existing_config["_id"]})
        
        # Define default alert configuration with the requested format
        now = datetime.datetime.now()
        default_config = {
            "failed_access_attempts": {
                "enabled": True,
                "threshold": 3
            },
            "unusual_access_patterns": {
                "enabled": True
            },
            "blockchain_verification_failure": {
                "enabled": True
            },
            "system_status_changes": {
                "enabled": True
            },
            "alert_email_recipients": [
                "admin@chaingate.com",
                "security@chaingate.com"
            ],
            "created_at": now,
            "updated_at": now
        }
        
        # Insert alert configuration into the collection
        result = alertconfig_collection.insert_one(default_config)
        
        print(f"Successfully initialized alert configuration with new format:")
        print(f"  Failed Access Attempts Threshold: {default_config['failed_access_attempts']['threshold']}")
        print(f"  Unusual Access Patterns Enabled: {default_config['unusual_access_patterns']['enabled']}")
        print(f"  Blockchain Verification Failure Alerts: {default_config['blockchain_verification_failure']['enabled']}")
        print(f"  System Status Changes Alerts: {default_config['system_status_changes']['enabled']}")
        print(f"  Email Recipients: {', '.join(default_config['alert_email_recipients'])}")
        
        return default_config
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Starting initialization script for alert configuration...")
    initialize_alert_config()
    print("Script execution completed.")