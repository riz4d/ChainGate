from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ...connections.mongodb.dbconnect import accesslog_collection
from datetime import datetime
import json
import traceback
from bson import ObjectId

class AccessLogsView(APIView):
    #permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Parse pagination parameters
            page = int(request.query_params.get('page', 1))
            per_page = int(request.query_params.get('per_page', 5))  # Default to 5 logs per page
            
            # Calculate skip value
            skip = (page - 1) * per_page
            
            # Parse filter parameters
            filters = {}
            
            # Filter by access status if provided
            access_status = request.query_params.get('status', None)
            if access_status:
                filters['access_status'] = access_status
                
            # Filter by user ID if provided
            user_id = request.query_params.get('user_id', None)
            if user_id:
                filters['user_id'] = user_id
                
            # Filter by date range if provided
            start_date = request.query_params.get('start_date', None)
            end_date = request.query_params.get('end_date', None)
            
            if start_date or end_date:
                date_filter = {}
                if start_date:
                    date_filter['$gte'] = start_date
                if end_date:
                    date_filter['$lte'] = end_date
                    
                if date_filter:
                    filters['access_time.date'] = date_filter
            
            # Get total count for pagination
            total_logs = accesslog_collection.count_documents(filters)
            
            # Get logs sorted by timestamp (newest first)
            logs_cursor = accesslog_collection.find(
                filters
            ).sort(
                'timestamp', -1  # -1 for descending order (newest first)
            ).skip(skip).limit(per_page)
            
            # Convert cursor to list and process ObjectId
            logs_list = []
            for log in logs_cursor:
                # Convert ObjectId to string
                if '_id' in log:
                    log['_id'] = str(log['_id'])
                    
                # Convert timestamp to ISO format if it's a datetime object
                if 'timestamp' in log and isinstance(log['timestamp'], datetime):
                    log['timestamp'] = log['timestamp'].isoformat()
                    
                logs_list.append(log)
            
            # Calculate pagination metadata
            total_pages = (total_logs + per_page - 1) // per_page if total_logs > 0 else 1
            
            # Build response
            response_data = {
                'logs': logs_list,
                'pagination': {
                    'total_logs': total_logs,
                    'total_pages': total_pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': page < total_pages,
                    'has_prev': page > 1
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response(
                {'error': 'Invalid pagination parameters', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'Failed to retrieve access logs', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )