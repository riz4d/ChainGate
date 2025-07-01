from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from ...connections.mongodb.dbconnect import accesslog_collection
from ...connections.mongodb.dbconf import con_string
from pymongo import MongoClient
from config.config import MONGODB
import json
import traceback
from bson import ObjectId
from datetime import datetime
from ...middleware.sessioncontroller import verify_session

class AccessLevelsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, level_id=None):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            client = MongoClient(con_string)
            db = client[MONGODB["database_name"]]
            access_levels_collection = db["access_levels"]
            
            if level_id:
                try:
                    level_id_int = int(level_id)
                    level = access_levels_collection.find_one({"id": level_id_int})
                except ValueError:
                    level = access_levels_collection.find_one({"_id": ObjectId(level_id)})
                    
                if not level:
                    return Response({
                        'error': 'Access level not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                level['_id'] = str(level['_id'])
                
                if 'created_at' in level and isinstance(level['created_at'], datetime):
                    level['created_at'] = level['created_at'].isoformat()
                if 'updated_at' in level and isinstance(level['updated_at'], datetime):
                    level['updated_at'] = level['updated_at'].isoformat()
                
                return Response(level, status=status.HTTP_200_OK)
            
            levels_cursor = access_levels_collection.find({}).sort("id", 1)
            
            levels_list = []
            for level in levels_cursor:
                if '_id' in level:
                    level['_id'] = str(level['_id'])
                
                if 'created_at' in level:
                    level['created_at'] = level['created_at'].isoformat() \
                        if hasattr(level['created_at'], 'isoformat') else level['created_at']
                        
                if 'updated_at' in level:
                    level['updated_at'] = level['updated_at'].isoformat() \
                        if hasattr(level['updated_at'], 'isoformat') else level['updated_at']
                
                levels_list.append(level)
                
            return Response({
                'access_levels': levels_list,
                'count': len(levels_list)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error retrieving access levels: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to retrieve access levels',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            data = request.data
            required_fields = ['name', 'description', 'permissions']
            for field in required_fields:
                if field not in data:
                    return Response({
                        'error': f'Missing required field: {field}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            client = MongoClient(con_string)
            db = client[MONGODB["database_name"]]
            access_levels_collection = db["access_levels"]
            
            existing = access_levels_collection.find_one({"name": data['name']})
            if existing:
                return Response({
                    'error': f"Access level with name '{data['name']}' already exists"
                }, status=status.HTTP_409_CONFLICT)
                
            max_id_result = access_levels_collection.find_one(
                sort=[("id", -1)],
                projection={"id": 1}
            )
            next_id = 1
            if max_id_result and 'id' in max_id_result:
                next_id = max_id_result['id'] + 1
                
            now = datetime.now()
            new_level = {
                "id": next_id,
                "name": data['name'],
                "description": data['description'],
                "permissions": data['permissions'],
                "created_at": now,
                "updated_at": now
            }
            
            result = access_levels_collection.insert_one(new_level)
            
            created_level = access_levels_collection.find_one({"_id": result.inserted_id})
            if created_level:
                created_level['_id'] = str(created_level['_id'])
                
                if 'created_at' in created_level and isinstance(created_level['created_at'], datetime):
                    created_level['created_at'] = created_level['created_at'].isoformat()
                if 'updated_at' in created_level and isinstance(created_level['updated_at'], datetime):
                    created_level['updated_at'] = created_level['updated_at'].isoformat()
                
                return Response(created_level, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Failed to retrieve the created access level'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            print(f"Error creating access level: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to create access level',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, level_id):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            data = request.data
            
            client = MongoClient(con_string)
            db = client[MONGODB["database_name"]]
            access_levels_collection = db["access_levels"]
            
            level = None
            
            try:
                level_id_int = int(level_id)
                level = access_levels_collection.find_one({"id": level_id_int})
            except ValueError:
                level = access_levels_collection.find_one({"_id": ObjectId(level_id)})
                
            if not level:
                return Response({
                    'error': 'Access level not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if 'name' in data and data['name'] != level['name']:
                existing = access_levels_collection.find_one({"name": data['name']})
                if existing and str(existing['_id']) != str(level['_id']):
                    return Response({
                        'error': f"Access level with name '{data['name']}' already exists"
                    }, status=status.HTTP_409_CONFLICT)
                
            update_fields = {}
            
            if 'name' in data:
                update_fields['name'] = data['name']
            if 'description' in data:
                update_fields['description'] = data['description']
            if 'permissions' in data:
                update_fields['permissions'] = data['permissions']
                
            if update_fields:
                update_fields['updated_at'] = datetime.now()
                
                result = access_levels_collection.update_one(
                    {"_id": level['_id']},
                    {"$set": update_fields}
                )
                
                if result.modified_count > 0:
                    updated_level = access_levels_collection.find_one({"_id": level['_id']})
                    
                    updated_level['_id'] = str(updated_level['_id'])
                    
                    if 'created_at' in updated_level and isinstance(updated_level['created_at'], datetime):
                        updated_level['created_at'] = updated_level['created_at'].isoformat()
                    if 'updated_at' in updated_level and isinstance(updated_level['updated_at'], datetime):
                        updated_level['updated_at'] = updated_level['updated_at'].isoformat()
                    
                    return Response(updated_level, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'No changes made to the access level'
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'No valid fields to update'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error updating access level: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to update access level',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, level_id):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            client = MongoClient(con_string)
            db = client[MONGODB["database_name"]]
            access_levels_collection = db["access_levels"]
            
            level = None
            
            try:
                level_id_int = int(level_id)
                level = access_levels_collection.find_one({"id": level_id_int})
            except ValueError:
                level = access_levels_collection.find_one({"_id": ObjectId(level_id)})
                
            if not level:
                return Response({
                    'error': 'Access level not found'
                }, status=status.HTTP_404_NOT_FOUND)
            

            result = access_levels_collection.delete_one({"_id": level['_id']})
            
            if result.deleted_count > 0:
                return Response({
                    'message': f"Access level '{level['name']}' successfully deleted"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to delete access level'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            print(f"Error deleting access level: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to delete access level',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)