"""
Alert Configuration Module

This module handles alert configurations for the chaingate system,
including settings for failed access attempts, unusual patterns,
blockchain verification failures, and system status changes.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ...connections.mongodb.dbconf import con_string
from pymongo import MongoClient
from config.config import MONGODB
import json
import traceback
from bson import ObjectId
from datetime import datetime

class AlertConfigView(APIView):
    """API View for retrieving and updating alert configurations"""
    
    def get(self, request):
        """
        Return the alert configuration settings
        """
        try:
            # Connect to MongoDB and get alertconfig collection
            client = MongoClient(con_string)
            db = client[MONGODB["database_name"]]
            alert_config_collection = db["alertconfig"]
            
            # Get alert configuration - there should be only one document
            config = alert_config_collection.find_one({})
            
            # If no configuration exists, create default one
            if not config:
                default_config = self._create_default_config()
                result = alert_config_collection.insert_one(default_config)
                config = alert_config_collection.find_one({"_id": result.inserted_id})
            
            # Clean up the ObjectId for JSON response
            if config and '_id' in config:
                config['_id'] = str(config['_id'])
            
            # Format datetime fields if present
            for key in ['created_at', 'updated_at']:
                if key in config and isinstance(config[key], datetime):
                    config[key] = config[key].isoformat()
                    
            return Response(config, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log and return error
            print(f"Error retrieving alert configuration: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to retrieve alert configuration',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """
        Update the alert configuration settings
        """
        try:
            # Get data from request
            data = request.data
            
            # Connect to MongoDB
            client = MongoClient(con_string)
            db = client[MONGODB["database_name"]]
            alert_config_collection = db["alertconfig"]
            
            # Get existing config or create default if none exists
            config = alert_config_collection.find_one({})
            
            if not config:
                default_config = self._create_default_config()
                result = alert_config_collection.insert_one(default_config)
                config = alert_config_collection.find_one({"_id": result.inserted_id})
            
            # Update only the fields that are provided
            update_fields = {}
            
            # Handle failed access attempts settings
            if 'failed_access_attempts' in data:
                update_fields['failed_access_attempts'] = {
                    'threshold': int(data['failed_access_attempts'].get('threshold', 3)),
                    'enabled': bool(data['failed_access_attempts'].get('enabled', True))
                }
            
            # Handle unusual patterns settings
            if 'unusual_access_patterns' in data:
                update_fields['unusual_access_patterns'] = {
                    'enabled': bool(data['unusual_access_patterns'].get('enabled', True))
                }
            
            # Handle blockchain verification settings
            if 'blockchain_verification_failure' in data:
                update_fields['blockchain_verification_failure'] = {
                    'enabled': bool(data['blockchain_verification_failure'].get('enabled', True))
                }
            
            # Handle system status settings
            if 'system_status_changes' in data:
                update_fields['system_status_changes'] = {
                    'enabled': bool(data['system_status_changes'].get('enabled', True))
                }
            
            # Handle email recipients
            if 'alert_email_recipients' in data:
                if isinstance(data['alert_email_recipients'], str):
                    # Split comma-separated string into list
                    emails = [email.strip() for email in data['alert_email_recipients'].split(',')]
                    update_fields['alert_email_recipients'] = emails
                elif isinstance(data['alert_email_recipients'], list):
                    update_fields['alert_email_recipients'] = data['alert_email_recipients']
            
            # Update timestamp
            update_fields['updated_at'] = datetime.now()
            
            # Only perform update if there are changes
            if update_fields:
                result = alert_config_collection.update_one(
                    {"_id": config['_id']},
                    {"$set": update_fields}
                )
                
                if result.modified_count > 0:
                    # Get the updated configuration
                    updated_config = alert_config_collection.find_one({"_id": config['_id']})
                    
                    # Clean up the ObjectId for JSON response
                    if '_id' in updated_config:
                        updated_config['_id'] = str(updated_config['_id'])
                    
                    # Format datetime fields if present
                    for key in ['created_at', 'updated_at']:
                        if key in updated_config and isinstance(updated_config[key], datetime):
                            updated_config[key] = updated_config[key].isoformat()
                    
                    return Response(updated_config, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'No changes made to the alert configuration'
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'No valid fields to update'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            # Log and return error
            print(f"Error updating alert configuration: {e}")
            traceback.print_exc()
            return Response({
                'error': 'Failed to update alert configuration',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_default_config(self):
        """
        Create default alert configuration
        """
        now = datetime.now()
        return {
            "failed_access_attempts": {
                "enabled": True,
                "threshold": 3
            },
            "unusual_access_patterns": {
                "enabled": True
            },
            "blockchain_verification_failure": {
                "enabled": True
            },
            "system_status_changes": {
                "enabled": True
            },
            "alert_email_recipients": [
                "admin@chaingate.com",
                "security@chaingate.com"
            ],
            "created_at": now,
            "updated_at": now
        }