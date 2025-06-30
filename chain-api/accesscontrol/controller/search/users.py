from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ...connections.mongodb.dbconnect import users_collection
from datetime import datetime
import json
import traceback
from bson import ObjectId
from ...controller.models.engine import summarize

class UserSearchView(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request, user_id):
        try:
            start_time = datetime.now()
            print(f"Searching user by ID: {user_id}")
            if not user_id:
                return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            user = users_collection.find_one({"_id": ObjectId(user_id)}, {"_id": 0})

            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
            if "created_at" in user and isinstance(user["created_at"], datetime):
                user["created_at"] = user["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            if "updated_at" in user and isinstance(user["updated_at"], datetime):
                user["updated_at"] = user["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
            
            if "access_history" in user and isinstance(user["access_history"], list):
                valid_access_history = [
                    access for access in user["access_history"] 
                    if isinstance(access, dict) and access.get("timestamp")
                ]
                
                user["access_history"] = valid_access_history[-5:]
                
                for access in user["access_history"]:
                    if "timestamp" in access and isinstance(access["timestamp"], datetime):
                        access["timestamp"] = access["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            
            user_summary = summarize("give me the user summary as a small paragraph", user)
            
            response_time_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
            return Response({
                "message": "User found successfully",
                "user": user,
                "user_summary": user_summary,
                "response_time_ms": response_time_ms
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            start_time = datetime.now()
            search_query = request.data.get("query", "")
            print(f"Search query received: {search_query}")
            if not search_query:
                return Response({"error": "Search query is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            search_filter = {
                "$or": [
                    {"name": {"$regex": search_query, "$options": "i"}},
                    {"email": {"$regex": search_query, "$options": "i"}},
                    {"nfc_id": {"$regex": search_query, "$options": "i"}},
                ]
            }
            
            projection = {
                "_id": 1,
                "name": 1,
                "email": 1,
                "position": 1,
                "access_level": 1
            }
            
            users = list(users_collection.find(search_filter, projection).sort("_id", -1).limit(4))
            print(f"Found {len(users)} users matching query: {search_query}")

            for user in users:
                if "_id" in user:
                    user["id"] = str(user["_id"])
                    del user["_id"]
            
            response_time_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
            return Response({
                "message": "User search completed successfully",
                "users": users,
                "response_time_ms": response_time_ms
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserSummarizeView(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request, user_id=None):
        try:
            start_time = datetime.now()
            if not user_id:
                return Response({
                    "message": "User Summarize API",
                    "usage": {
                        "GET /api/summarize/<user_id>/": "Get summary for specific user",
                        "POST /api/summarize/": "Custom summarization with user_id and message"
                    },
                    "example_post": {
                        "userid": "682a0a7d61d3d8f830ca5672",
                        "message": "Give me a summary of this user's access patterns"
                    }
                }, status=status.HTTP_200_OK)
            
            print(f"Summarizing user with ID: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)}, {"_id": 0})

            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
                
            if "created_at" in user and isinstance(user["created_at"], datetime):
                user["created_at"] = user["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            if "updated_at" in user and isinstance(user["updated_at"], datetime):
                user["updated_at"] = user["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
            
            if "access_history" in user and isinstance(user["access_history"], list):
                valid_access_history = [
                    access for access in user["access_history"] 
                    if isinstance(access, dict) and access.get("timestamp")
                ]
                
                user["access_history"] = valid_access_history[-5:]
                
                for access in user["access_history"]:
                    if "timestamp" in access and isinstance(access["timestamp"], datetime):
                        access["timestamp"] = access["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            
            user_summary = summarize("give me the user summary as a small paragraph", user)
            
            response_time_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
            return Response({
                "message": "User summary generated successfully",
                "user_summary": user_summary,
                "response_time_ms": response_time_ms
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            start_time = datetime.now()
            user_id = request.data.get("userid", "")
            message = request.data.get("message", "")
            
            print(f"User ID received for summarization: {user_id}")
            print(f"Message received: {message}")
            
            if not user_id:
                return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not message:
                return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            user_data = users_collection.find_one({"nfc_id": user_id}, {"_id": 0})
            
            if not user_data:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
            # Format datetime fields to avoid JSON serialization errors
            if "created_at" in user_data and isinstance(user_data["created_at"], datetime):
                user_data["created_at"] = user_data["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            if "updated_at" in user_data and isinstance(user_data["updated_at"], datetime):
                user_data["updated_at"] = user_data["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
            
            # Format access history and take last 5
            if "access_history" in user_data and isinstance(user_data["access_history"], list):
                valid_access_history = [
                    access for access in user_data["access_history"] 
                    if isinstance(access, dict) and access.get("timestamp")
                ]
                
                user_data["access_history"] = valid_access_history[-5:]
                
                for access in user_data["access_history"]:
                    if "timestamp" in access and isinstance(access["timestamp"], datetime):
                        access["timestamp"] = access["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            
            user_summary = summarize(message, user_data)
            print(f"Generated user summary: {user_summary}")
            response_time_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
            return Response({
                "message": "User summary generated successfully",
                "response": user_summary,
                "response_time_ms": response_time_ms
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)