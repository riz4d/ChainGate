from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..connections.mongodb.dbconnect import users_collection, accesslog_collection, devices_collection
from datetime import datetime
import json
import traceback
from bson import ObjectId
from datetime import datetime
from blockchain.modules.connection import blockchain_connection
from blockchain.modules.access import store_access_record
from blockchain.modules.history import update_access_history

class pn532data(APIView):
    
    def post(self, request):
        
        data = request.data
        print("Received data:", data)
        uid_hex = data.get('uidHex', '')
        uid_length = data.get('uidLength', 0)
        gateId = data.get('gateId', None)
        
        if not uid_hex:
            return Response({"error": "No UID data provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        standardized_uid = self.standardize_uid(uid_hex)
        print("Standardized UID:", standardized_uid)
        
        processed_uid = self.process_uid(standardized_uid, 4)
        
        print("Original UID:", uid_hex)
        print("Processed UID (4 bytes reversed):", processed_uid)
        
        try:
            clean_uid = processed_uid.replace(':', '')
            print("Clean UID:", clean_uid)
            decimal_value = int(clean_uid, 16)
            decimal_str = str(decimal_value)
            if len(decimal_str) < 10:
                decimal_value = decimal_str.zfill(10) 
            
            user = self.find_user_by_nfc(f"{decimal_value}")
        except ValueError:
            print(f"Could not convert '{processed_uid}' to decimal")
            decimal_value = None
            user = None
            
        response_data = {
            "message": "Data received successfully",
            "original_uid": uid_hex,
            "standardized_uid": standardized_uid,
            "processed_uid": processed_uid,
            "uid_length": uid_length,
            "decimal_value": decimal_value
        }
        if gateId == None:
            return Response("No gateId provided", status=status.HTTP_400_BAD_REQUEST)
        
        if gateId:
            device = devices_collection.find_one({"tag_id": gateId})
            print(f"Device found: {device}")
            device_status = device.get("status", "Unknown") if device else "Unknown"
            if device_status != "Active":
                return Response({"error": "Device is not active"}, status=status.HTTP_403_FORBIDDEN)
            if not device:
                return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)
            GateName = device.get("name", "Unknown")
            location = device.get("location", "Unknown")    
        
        device_access_levels = device.get("assigned_to", [])
        user_access_level = user.get("access_level", "Unknown") if user else "Unknown"

        
        timestamp = datetime.now()
        
        access_data = {
                "nfc_id": str(decimal_value),
                "timestamp": datetime.now().isoformat(),
                "device_info": {
                    "original_uid": uid_hex,
                    "processed_uid": processed_uid
                }
            }
        if user:
            if user_access_level not in device_access_levels:
                return Response({"error": "User does not have access to this device"}, status=status.HTTP_403_FORBIDDEN)
            
            user_id = user.get("_id")
            access_data["user_id"] = user_id
            print(f"User found with ID: {user_id}, type: {type(user_id)}")
            response_data["user_found"] = True
            response_data["user"] = user
            response_data["message"] = f"Access granted to {user.get('name', 'Unknown')}"
            tx_hash = store_access_record(str(decimal_value), access_data)
            print(tx_hash)
            if tx_hash:
                response_data["blockchain_tx"] = tx_hash
                history_updated = update_access_history(user_id, access_data, tx_hash)
                accesslog_entry = {
                    "timestamp": timestamp,
                    "gate_name": GateName,
                    "location": location,
                    "gateId": gateId,
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
                    
                    "access_method": "GateTag",
                    "success": True,
                    

                }
                accesslog_entry["name"] = user.get('name', 'Unknown')
                accesslog_entry["email"] = user.get('email', 'Unknown')
                accesslog_entry["position"] = user.get('position', 'Unknown')
                accesslog_entry["access_level"] = user.get('access_level', 'Unknown')
                accesslog_entry["access_status"] = "granted"
                resultlog = accesslog_collection.insert_one(accesslog_entry)
                user_update_status = users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {
                        "last_access": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        "last_gate_id": gateId,
                        "last_gate_name": GateName
                    }}
                )
                response_data["history_updated"] = history_updated
                
                print(f"Access record stored on blockchain with tx: {tx_hash}")
            else:
                response_data["blockchain_tx"] = None
                response_data["blockchain_error"] = "Failed to store on blockchain"
                print("Failed to store access record on blockchain")
        else:
            tx_hash = store_access_record(str(decimal_value), access_data)
            
            if tx_hash:
                response_data["blockchain_tx"] = tx_hash
                accesslog_entry = {
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
                    
                    "access_method": "GateTag",
                    "success": True
                }
                accesslog_entry["name"] = "unauthorized"
                accesslog_entry["email"] = "Unknown"
                accesslog_entry["position"] = "Unknown"
                accesslog_entry["access_level"] = "Unknown"
                accesslog_entry["access_status"] = "denied"
                accesslog_entry["gate_name"] = GateName if GateName else "Unknown"
                accesslog_entry["location"] = location if location else "Unknown"
                accesslog_entry["gateId"] = gateId if gateId else "Unknown"
                resultlog = accesslog_collection.insert_one(accesslog_entry)
                print(f"Access record stored on blockchain with tx: {tx_hash}")
            else:
                response_data["blockchain_tx"] = None
                response_data["blockchain_error"] = "Failed to store on blockchain"
                print("Failed to store access record on blockchain")
            response_data["user_found"] = False
            response_data["message"] = "No user found with this NFC ID"
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def find_user_by_nfc(self, nfc_id):
        user = users_collection.find_one({"nfc_id": nfc_id})
        if user:
            return json.loads(json.dumps(user, default=str))
        return None
    
    def standardize_uid(self, uid_hex):
        if ':' in uid_hex:
            parts = uid_hex.split(':')
            standardized_parts = [part.zfill(2) for part in parts]
            return ':'.join(standardized_parts)
        else:
            return uid_hex
    
    def process_uid(self, uid_hex, num_bytes=None):
        if ':' in uid_hex:
            parts = uid_hex.split(':')
            if num_bytes is not None and num_bytes > 0 and num_bytes < len(parts):
                parts = parts[:num_bytes]
                
            reversed_parts = parts[::-1]
            return ':'.join(reversed_parts)
        else:
            if num_bytes is not None and num_bytes > 0:
                bytes_to_process = uid_hex[:num_bytes*2]
                return bytes_to_process[::-1]
            else:
                return uid_hex[::-1]
