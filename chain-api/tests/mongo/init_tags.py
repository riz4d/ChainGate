#!/usr/bin/env python3
"""
Test script to populate MongoDB with NFC tags data
"""
from pymongo import MongoClient
import sys
import os
import datetime
import random

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import MongoDB connection string
from accesscontrol.connections.mongodb.dbconf import con_string
from config.config import MONGODB

def generate_random_battery():
    """Generate random battery percentage between 15% and 100%"""
    return random.randint(15, 100)

def generate_random_scans():
    """Generate random scan count"""
    return random.randint(50, 5000)

def generate_last_scanned():
    """Generate random last scanned time (within last 24 hours)"""
    now = datetime.datetime.now()
    minutes_ago = random.randint(1, 1440)  # 1 minute to 24 hours ago
    return now - datetime.timedelta(minutes=minutes_ago)

def generate_last_restart():
    """Generate random last restart time (within last 30 days)"""
    now = datetime.datetime.now()
    days_ago = random.randint(1, 30)  # 1 to 30 days ago
    hours_ago = random.randint(0, 23)
    minutes_ago = random.randint(0, 59)
    return now - datetime.timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

def populate_nfc_tags():
    """
    Populate the MongoDB database with predefined NFC tags data
    """
    try:
        # Connect to MongoDB
        client = MongoClient(con_string)
        db = client[MONGODB["database_name"]]
        
        # Create or get the nfc_tags collection
        nfc_tags_collection = db["nfc_tags"]
        
        # Check if collection already has data
        existing_count = nfc_tags_collection.count_documents({})
        if existing_count > 0:
            print(f"Found {existing_count} existing NFC tags. Clearing collection...")
            nfc_tags_collection.delete_many({})
        
        # Define NFC tags data
        nfc_tags = [
            {
                "tag_id": "NFC001",
                "name": "Main Entrance",
                "location": "Building A - Level 1",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC002",
                "name": "Server Room",
                "location": "Building A - Basement",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["IT Team", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC003",
                "name": "Research Lab",
                "location": "Building B - Level 2",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Research Team", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC004",
                "name": "Executive Office",
                "location": "Building A - Level 3",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Executive Team", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC005",
                "name": "Storage Area",
                "location": "Building C - Level 1",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Warehouse Team", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC006",
                "name": "Conference Room A",
                "location": "Building A - Level 2",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["General Staff", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC007",
                "name": "Conference Room B",
                "location": "Building B - Level 1",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["General Staff", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC008",
                "name": "Emergency Exit",
                "location": "Building A - Level 1",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC009",
                "name": "Parking Garage",
                "location": "Building A - Underground",
                "status": "Active",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Security Team", "General Staff"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            },
            {
                "tag_id": "NFC010",
                "name": "Maintenance Room",
                "location": "Building C - Basement",
                "status": "Maintenance",
                "battery": generate_random_battery(),
                "last_scanned": generate_last_scanned(),
                "total_scans": generate_random_scans(),
                "assigned_to": ["Maintenance Team", "Security Team"],
                "last_restart": generate_last_restart(),
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now()
            }
        ]
        
        # Insert NFC tags into the collection
        result = nfc_tags_collection.insert_many(nfc_tags)
        
        print(f"Successfully added {len(result.inserted_ids)} NFC tags to the database.")
        print("\nNFC Tags Summary:")
        for tag in nfc_tags:
            battery_status = "🔋" if tag['battery'] > 50 else "🪫" if tag['battery'] > 20 else "⚠️"
            status_icon = "✅" if tag['status'] == "Active" else "🔧"
            print(f"  {status_icon} {tag['tag_id']}: {tag['name']} ({tag['location']}) - Battery: {tag['battery']}% {battery_status}")
        
        return result.inserted_ids
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Starting database population script for NFC tags...")
    print("=" * 60)
    populate_nfc_tags()
    print("=" * 60)
    print("Script execution completed.")
