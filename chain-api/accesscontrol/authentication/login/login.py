from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ...connections.mongodb.dbconnect import admins_collection
from ...helper.utils import hash_password, checkPassword
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
import json
import logging

logger = logging.getLogger(__name__)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        user_data = data.get('user_data', {})
        timestamp = user_data.get('timestamp')
        user_agent = user_data.get('userAgent', {})
        ip_address = user_data.get('ipAddress', None)
        timezone = user_data.get('timezone', {})
        referrer = user_data.get('referrer')
        url = user_data.get('url')
        
        login_history_entry = {
            "servertimestamp": datetime.now(),
            "clienttimestamp": timestamp,
            "ip_address": ip_address,
            "user_agent": user_agent.get('userAgent') if user_agent else None,
            "device_info": {
            "platform": user_agent.get('platform'),
            "app_name": user_agent.get('appName'),
            "app_version": user_agent.get('appVersion'),
            "vendor": user_agent.get('vendor'),

            },
            "location": user_data.get('location'),
            "referrer": referrer,
            "url": url,
            "language": user_agent.get('language'),
            "cookies_enabled": user_agent.get('cookiesEnabled'),
            "timezone": timezone,
        }
        if not username or not password:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = admins_collection.find_one({"username": username})
        print(user)
        if not user:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        hashed_password = user.get("password")
        print(hashed_password)
        if not checkPassword(password, hashed_password):
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        admins_collection.update_one(
            {"username": username}, 
            {
                "$set": {"last_login": datetime.now()},
                "$push": {"login_history": login_history_entry}
            }
        )
        
        user_dict = json.loads(json.dumps(user, default=str))
        refresh = RefreshToken()
        refresh['user_id'] = user_dict['_id']
        refresh['username'] = username
        
        refresh_token_str = str(refresh)
        access_token_str = str(refresh.access_token)
        
        return Response({
            "message": "Login successful.",
            "refresh": refresh_token_str,
            "access": access_token_str
        }, status=status.HTTP_200_OK)
