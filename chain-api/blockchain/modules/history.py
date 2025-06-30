"""
User access history module for chaingate project.
"""
import traceback
from datetime import datetime
from bson import ObjectId
from accesscontrol.connections.mongodb.dbconnect import users_collection

def update_access_history(user_id, access_data, tx_hash):
    try:
        timestamp = datetime.now()
        history_entry = {
            "timestamp": timestamp,
            "access_time": {
                "date": timestamp.strftime("%Y-%m-%d"),
                "time": timestamp.strftime("%H:%M:%S"),
                "unix_time": int(timestamp.timestamp())
            },
            "nfc_id": access_data.get("nfc_id"),
            "card_data": {
                "hex_uid": access_data.get("device_info", {}).get("original_uid"),
                "processed_hex": access_data.get("device_info", {}).get("processed_uid")
            },
            "blockchain_data": {
                "tx_hash": tx_hash,
                "block_time": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "stored_value": access_data.get("nfc_id")
            },
            "access_status": "granted",
            "access_method": "nfc_card",
            "success": True
        }
        
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
                print(f"Converted user_id string to ObjectId: {user_id}")
            except Exception as e:
                print(f"Error converting user_id to ObjectId: {e}")
        
        user = users_collection.find_one({"_id": user_id})
        
        if not user:
            print(f"User not found with ID: {user_id}")
            return False
        
        print(f"Found user: {user.get('name', 'Unknown')} with ID: {user_id}")

        if "access_history" not in user:
            print(f"Creating new access_history field for user {user_id}")
            result = users_collection.update_one(
                {"_id": user_id},
                {"$set": {"access_history": [history_entry]}}
            )
        else:
            print(f"Appending to existing access_history for user {user_id}")
            result = users_collection.update_one(
                {"_id": user_id},
                {"$push": {"access_history": history_entry}}
            )
        
        if result.matched_count > 0:
            print(f"User document matched for update: {result.matched_count}")
        else:
            print(f"No user document matched for update")
        
        if result.modified_count > 0:
            print(f"Access history updated for user {user_id}")
            return True
        else:
            print(f"Failed to update access history for user {user_id}")
            return False
            
    except Exception as e:
        print(f"Error updating user history: {e}")
        traceback.print_exc()
        return False

def get_access_history(user_id, limit=10):
    try:
        if isinstance(user_id, str):
            try:
                user_id = ObjectId(user_id)
            except Exception as e:
                print(f"Error converting user_id to ObjectId: {e}")
                return None
        
        user = users_collection.find_one(
            {"_id": user_id},
            {"access_history": {"$slice": -limit}}
        )
        
        if not user:
            print(f"User not found with ID: {user_id}")
            return None
        
        return user.get("access_history", [])
    
    except Exception as e:
        print(f"Error retrieving user access history: {e}")
        traceback.print_exc()
        return None