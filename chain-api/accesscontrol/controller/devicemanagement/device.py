from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from accesscontrol.connections.mongodb.dbconnect import devices_collection
from datetime import datetime
import json
import traceback
from bson import ObjectId
from ...middleware.sessioncontroller import verify_session


class DeviceManagementView(APIView):
    permission_classes = [AllowAny] 
    def get(self, request):

        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            devices = list(devices_collection.find({}))
            for device in devices:
                device['_id'] = str(device['_id'])
            
            return Response({
                "message": "Devices retrieved successfully",
                "count": len(devices),
                "devices": devices
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error retrieving devices: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to retrieve devices", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            data = request.data
            print("Received data:", data)
            required_fields = ['tag_id', 'name', 'location']
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {"error": f"{field} is required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if devices_collection.find_one({"tag_id": data['tag_id']}):
                return Response(
                    {"error": "Tag ID already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            new_device = {
                "tag_id": data['tag_id'],
                "name": data['name'],
                "location": data['location'],
                "status": data.get('status', 'Active'),
                "last_scanned": datetime.now(),
                "total_scans": data.get('total_scans', 0),
                "assigned_to": data.get('assigned_to', []),
                "last_restart": datetime.now(),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            result = devices_collection.insert_one(new_device)
            new_device['_id'] = str(result.inserted_id)
            
            return Response({
                "message": "Device created successfully",
                "device": new_device
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error adding device: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to add device", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def put(self, request, device_id=None):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            if not device_id:
                device_id = request.query_params.get('device_id')
            
            if not device_id:
                return Response(
                    {"error": "Device ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            data = request.data
            
            update_fields = {}
            allowed_fields = ['name', 'location', 'status', 'battery', 'assigned_to', 'total_scans']
            
            for field in allowed_fields:
                if field in data:
                    update_fields[field] = data[field]
            
            if not update_fields:
                return Response(
                    {"error": "No fields to update"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            update_fields['updated_at'] = datetime.now()
            
            result = devices_collection.update_one(
                {'_id': ObjectId(device_id)},
                {'$set': update_fields}
            )
            
            if result.matched_count == 0:
                return Response(
                    {"error": "Device not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            updated_device = devices_collection.find_one({'_id': ObjectId(device_id)})
            updated_device['_id'] = str(updated_device['_id'])
            
            return Response({
                "message": "Device updated successfully",
                "device": updated_device
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error updating device: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to update device", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def delete(self, request, device_id=None):
        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            if not device_id:
                device_id = request.query_params.get('device_id')
            
            if not device_id:
                return Response(
                    {"error": "Device ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = devices_collection.delete_one({'_id': ObjectId(device_id)})
            
            if result.deleted_count == 0:
                return Response(
                    {"error": "Device not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(
                {"message": "Device deleted successfully"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"Error deleting device: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Failed to delete device", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )