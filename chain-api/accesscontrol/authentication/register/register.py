from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ...connections.mongodb.dbconnect import admins_collection
from ...helper.utils import hash_password
from datetime import datetime

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not username or not password or not email:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        existing_user = admins_collection.find_one({"$or": [{"username": username}, {"email": email}]})
        if existing_user:
            return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)
        hashed_password = hash_password(password)
        new_user = {
            "username": username,
            "password": hashed_password,
            "email": email,
            "created_at": datetime.now()
        }
        admins_collection.insert_one(new_user)

        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)