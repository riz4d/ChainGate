from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        print(request.user)
        try:
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
            logout(request)
            
            return Response(
                {"message": "Successfully logged out."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Logout failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )