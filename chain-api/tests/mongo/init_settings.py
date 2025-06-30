#!/usr/bin/env python3
"""
Test script to populate MongoDB with system settings data
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

def populate_settings():
    """
    Populate the MongoDB database with system settings
    """
    try:
        # Connect to MongoDB
        client = MongoClient(con_string)
        db = client[MONGODB["database_name"]]
        
        # Create or get the settings collection
        settings_collection = db["settings"]
        
        # Check if collection already has data
        existing_count = settings_collection.count_documents({})
        if existing_count > 0:
            print(f"Found {existing_count} existing settings. Clearing collection...")
            settings_collection.delete_many({})
        
        # Define system settings
        system_settings = {
            "id": 1,
            "organization": {
                "name": "chaingate Corporation",
                "contact_email": "admin@chaingate.com"
            },
            "blockchain": {
                "enabled": True,
                "network_endpoint": "https://mainnet.infura.io/v3/..."
            },
            "system": {
                "maintenance_mode": False
            },
            "created_at": datetime.datetime.now(),
            "updated_at": datetime.datetime.now()
        }
        
        # Insert settings into the collection
        result = settings_collection.insert_one(system_settings)
        
        print(f"Successfully added system settings to the database.")
        print("Settings Details:")
        print(f"  - Organization: {system_settings['organization']['name']}")
        print(f"  - Contact Email: {system_settings['organization']['contact_email']}")
        print(f"  - Blockchain Enabled: {system_settings['blockchain']['enabled']}")
        print(f"  - Network Endpoint: {system_settings['blockchain']['network_endpoint']}")
        print(f"  - Maintenance Mode: {system_settings['system']['maintenance_mode']}")
        print(f"  - Settings ID: {result.inserted_id}")
        
        return result.inserted_id
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Starting database population script for system settings...")
    print("=" * 60)
    populate_settings()
    print("=" * 60)
    print("Script execution completed.")
