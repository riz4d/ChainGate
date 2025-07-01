from django.contrib.auth import logout
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ...connections.mongodb.dbconnect import admins_collection
import json
import traceback

from hashlib import sha256

class AccessControlView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        try:
            data = request.data
            email = data.get('email')
            password = data.get('password')
            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            hashed_password = sha256(password.encode()).hexdigest()
            print(f"Hashed password: {hashed_password}")
            admin = admins_collection.find_one({
                "email": email
            })
            print(admin)
            if not admin:
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            if hashed_password != admin.get('password'):
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            if hashed_password == admin.get('password'):
                request.session['admin_id'] = str(admin.get('_id'))
                return Response({
                    'message': 'Login successful',
                    'admin_id': str(admin.get('_id')),
                    'email': admin.get('email'),
                    'name': admin.get('name')
                }, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Error occurred: {e}")
            traceback.print_exc()
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
