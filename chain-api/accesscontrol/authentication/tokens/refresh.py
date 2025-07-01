from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

class RefreshTokenView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Try to get refresh token from request body first (for compatibility)
        refresh_token = request.data.get('refresh')
        
        # If not in body, try to get from HTTP-only cookie
        if not refresh_token:
            refresh_token = request.COOKIES.get('auth_token')  # Changed from 'refresh_token' to 'auth_token'
        
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            # Create new access token
            access_token = refresh.access_token
            
            # Copy custom claims from refresh token to access token
            if 'admin_id' in refresh:
                access_token['admin_id'] = refresh['admin_id']
            if 'email' in refresh:
                access_token['email'] = refresh['email']
            if 'name' in refresh:
                access_token['name'] = refresh['name']
            
            return Response({
                'access_token': str(access_token),  # Changed from 'access' to 'access_token'
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)