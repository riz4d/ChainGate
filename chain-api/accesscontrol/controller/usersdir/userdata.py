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

class UserListView(APIView):
    #permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            page = int(request.query_params.get('page', 1))
            per_page = int(request.query_params.get('per_page', 10))
            
            skip = (page - 1) * per_page
            sort_field = request.query_params.get('sort_by', 'name')
            sort_direction = 1 if request.query_params.get('sort_order', 'asc') == 'asc' else -1
            
            filters = {}
            name_filter = request.query_params.get('name', None)
            if name_filter:
                filters['name'] = {'$regex': name_filter, '$options': 'i'}
            
            active_filter = request.query_params.get('active', None)
            if active_filter is not None:
                filters['active'] = active_filter.lower() == 'true'
            
            access_level = request.query_params.get('access_level', None)
            if access_level:
                filters['access_level'] = access_level
            
            users_cursor = users_collection.find(
                filters,
                {
                    "name": 1,
                    "email": 1,
                    "nfc_id": 1, 
                    "access_level": 1,
                    "created_at": 1,
                    "active": 1,
                    "position": 1,
                    "last_access": 1,
                    "last_gate_id": 1,
                    "last_gate_name": 1
                }
            ).sort(sort_field, sort_direction).skip(skip).limit(per_page)
            
            users_list = []
            for user in users_cursor:
                user['_id'] = str(user['_id'])
                users_list.append(user)
            
            total_users = users_collection.count_documents(filters)
            total_pages = (total_users + per_page - 1) // per_page
            
            total_users_count = users_collection.count_documents({})
            active_users_count = users_collection.count_documents({"active": True})
            inactive_users_count = users_collection.count_documents({"active": False})
            
            pagination = {
                "total_users": total_users,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
            
            user_stats = {
                "total_count": total_users_count,
                "active_count": active_users_count,
                "inactive_count": inactive_users_count
            }
            
            return Response({
                "users": users_list,
                "pagination": pagination,
                "user_stats": user_stats
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response(
                {"error": "Invalid pagination parameters", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error fetching users: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to retrieve users", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def post(self, request):
        try:
            data = request.data
            
            if not data.get('name') or not data.get('email'):
                return Response(
                    {"error": "Name and email are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            new_user = {
                "name": data['name'],
                "email": data['email'],
                "nfc_id": data.get('nfc_id', None),
                "access_level": data.get('access_level', 'user'),
                "active": data.get('active', True),
                "position": data.get('position', 'Unknown'),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            result = users_collection.insert_one(new_user)
            new_user['_id'] = str(result.inserted_id)
            
            return Response(new_user, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            print(f"Error creating user: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to create user", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def delete(self, request, user_id=None):
        try:
            if not user_id:
                user_id = request.query_params.get('user_id')
            
            if not user_id:
                return Response(
                    {"error": "User ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if isinstance(user_id, str):
                try:
                    user_id = ObjectId(user_id)
                except Exception as e:
                    print(f"Error converting user_id to ObjectId: {e}")
                    return Response(
                        {"error": "Invalid User ID format"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            result = users_collection.delete_one({"_id": user_id})
            
            if result.deleted_count == 0:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        
        except Exception as e:
            print(f"Error deleting user: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to delete user", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def put(self, request, user_id=None):
        try:
            if not user_id:
                user_id = request.query_params.get('user_id')
            
            if not user_id:
                return Response(
                    {"error": "User ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if isinstance(user_id, str):
                try:
                    user_id = ObjectId(user_id)
                except Exception as e:
                    print(f"Error converting user_id to ObjectId: {e}")
                    return Response(
                        {"error": "Invalid User ID format"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            data = request.data
            
            update_fields = {}
            if 'name' in data:
                update_fields['name'] = data['name']
            if 'email' in data:
                update_fields['email'] = data['email']
            if 'nfc_id' in data:
                update_fields['nfc_id'] = data['nfc_id']
            if 'access_level' in data:
                update_fields['access_level'] = data['access_level']
            if 'active' in data:
                update_fields['active'] = data['active']
            if 'position' in data:
                update_fields['position'] = data['position']
            
            if not update_fields:
                return Response(
                    {"error": "No fields to update"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            update_fields['updated_at'] = datetime.now()
            
            result = users_collection.update_one({"_id": user_id}, {"$set": update_fields})
            
            if result.matched_count == 0:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            updated_user = users_collection.find_one({"_id": user_id})
            updated_user['_id'] = str(updated_user['_id'])
            
            return Response(updated_user, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error updating user: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to update user", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

