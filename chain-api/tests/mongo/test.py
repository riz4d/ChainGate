#!/usr/bin/env python3
"""
Test script to populate MongoDB with access level data
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
        settings_collection = db["settings"]
        
        existing_count = settings_collection.count_documents({})
        if existing_count > 0:
            print(f"Found {existing_count} existing settings. Clearing collection...")
            settings_collection.delete_many({})
        
        system_settings = {
            "id": 1,
            "organization": {
                "name": "chaingate Corporation",
                "contact_email": "admin@chaingate.com",
                "phone": "+1-555-0123",
                "address": "123 Tech Street, Digital City, DC 12345"
            },
            "blockchain": {
                "enabled": True,
                "network_endpoint": "http://127.0.0.1:8545",
                "contract_address": "0x1234567890123456789012345678901234567890",
                "gas_limit": 300000,
                "gas_price": "20000000000"
            },
            "system": {
                "maintenance_mode": False,
                "debug_mode": False,
                "max_failed_attempts": 3,
                "session_timeout": 3600,
                "backup_enabled": True,
                "backup_frequency": "daily"
            },
            "security": {
                "password_min_length": 8,
                "password_require_special_chars": True,
                "two_factor_auth_enabled": False,
                "session_encryption": True,
                "audit_logging": True
            },
            "notifications": {
                "email_enabled": True,
                "sms_enabled": False,
                "push_notifications": True,
                "alert_threshold": "medium"
            },
            "access_control": {
                "default_access_level": "user",
                "auto_lock_timeout": 300,
                "max_concurrent_sessions": 5,
                "require_nfc_registration": True
            },
            "created_at": datetime.datetime.now(),
            "updated_at": datetime.datetime.now()
        }
        
        # Insert settings into the collection
        result = settings_collection.insert_one(system_settings)
        
        print(f"Successfully added system settings to the database.")
        print("Settings Categories:")
        print(f"  - Organization: {system_settings['organization']['name']}")
        print(f"  - Blockchain: {'Enabled' if system_settings['blockchain']['enabled'] else 'Disabled'}")
        print(f"  - System: {'Maintenance Mode' if system_settings['system']['maintenance_mode'] else 'Normal Operation'}")
        print(f"  - Security: {'2FA Enabled' if system_settings['security']['two_factor_auth_enabled'] else '2FA Disabled'}")
        print(f"  - Notifications: {'Email Enabled' if system_settings['notifications']['email_enabled'] else 'Email Disabled'}")
        print(f"  - Access Control: Default level - {system_settings['access_control']['default_access_level']}")
        
        return result.inserted_id
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Starting database population script for system settings...")
    populate_settings()
    print("Script execution completed.")