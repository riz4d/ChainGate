from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ...connections.mongodb.dbconnect import settings_collection
from datetime import datetime
import json
import traceback
from bson import ObjectId
from ...middleware.sessioncontroller import verify_session


class SettingsView(APIView):

    def get(self, request):

        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            config = settings_collection.find_one({})
            if not config:
                default_config = self._create_default_config()
                result = settings_collection.insert_one(default_config)
                config = settings_collection.find_one({"_id": result.inserted_id})

            if config and '_id' in config:
                config['_id'] = str(config['_id'])

            return Response(config, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error retrieving settings configuration: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to retrieve settings configuration',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def put(self, request):

        if not verify_session(request):
            return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            config = settings_collection.find_one({})

            if not config:
                return Response({
                    'error': 'Settings configuration not found'
                }, status=status.HTTP_404_NOT_FOUND)

            updated_data = request.data
            settings_collection.update_one({"_id": config['_id']}, {"$set": updated_data})

            return Response({
                'message': 'Settings configuration updated successfully'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error updating settings configuration: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to update settings configuration',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)