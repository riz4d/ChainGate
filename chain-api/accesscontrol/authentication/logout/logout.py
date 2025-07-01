from django.contrib.auth import logout
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

class LogoutView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        request.session.flush()
        return JsonResponse({"message": "Logged out"})
