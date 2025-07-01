from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from ...connections.mongodb.dbconnect import devices_collection,accesslog_collection,users_collection
from datetime import datetime
import json
import traceback
from bson import ObjectId
from web3 import Web3
from ...authentication.auth_utils import require_admin_auth, validate_admin_token
from django.contrib.sessions.models import Session
from ...middleware.sessioncontroller import verify_session

class OverviewView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if not verify_session(request):
            return Response({"error": "user is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            start_time = datetime.now()            
            total_devices = devices_collection.count_documents({})
            active_devices = devices_collection.count_documents({"status": "Active"})
            unique_nfc_ids = accesslog_collection.distinct("nfc_id")
            total_visitors_count = len(unique_nfc_ids)
            successful_verifications = accesslog_collection.count_documents({"access_status": "granted"})
            denied_verifications = accesslog_collection.count_documents({"access_status": "denied"})
            total_users = users_collection.count_documents({})
            active_users = users_collection.count_documents({"active": True})
            
            total_verifications = successful_verifications + denied_verifications
            success_rate = round((successful_verifications / total_verifications * 100), 2) if total_verifications > 0 else 0.0
            
            blockchain_connected = False
            blockchain_latency = None
            try:
                blockchain_start = datetime.now()
                web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545", request_kwargs={'timeout': 3}))
                blockchain_connected = web3.is_connected()
                if blockchain_connected:
                    blockchain_latency = round((datetime.now() - blockchain_start).total_seconds() * 1000, 2)
            except Exception as blockchain_error:
                print(f"Blockchain connection check failed: {blockchain_error}")
                blockchain_connected = False
            response_time_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
            # Get the last 8 access logs with nfcid and access time
            recent_logs = list(accesslog_collection.find(
                {}, 
                {"nfc_id": 1,"gate_name": 1, "location": 1, "name": 1, "timestamp": 1, "access_status": 1, "_id": 0}
            ).sort("timestamp", -1).limit(8))

            # Convert datetime objects to strings for JSON serialization
            for log in recent_logs:
                if "timestamp" in log:
                    log["timestamp"] = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            return Response({
                "message": "Overview data retrieved successfully",
                "response_time_ms": response_time_ms,
                "blockchain_sync": blockchain_connected,
                "blockchain_latency_ms": blockchain_latency,
                "total_devices": total_devices,
                "active_devices": active_devices,
                "total_users": total_users,
                "active_users": active_users,
                "total_visitors_count": total_visitors_count,
                "successful_verifications": successful_verifications,
                "denied_verifications": denied_verifications,
                "total_verifications": total_verifications,
                "verification_success_rate": success_rate,
                "recent_access_logs": recent_logs
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error retrieving overview data: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to retrieve overview data", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )