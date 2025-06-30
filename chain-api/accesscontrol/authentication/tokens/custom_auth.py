from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings
from ...connections.mongodb.dbconnect import admins_collection


class MongoJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication class that works with MongoDB user storage 
    instead of Django's User model
    """
    
    def get_user(self, validated_token):
        """
        Retrieves user from MongoDB using the JWT token payload
        instead of looking it up in Django's database
        """
        try:
            username = validated_token.get('username', None)
            
            if not username:
                raise InvalidToken('Token contained no recognizable user identification')
            
            # Find user in MongoDB collection
            user_data = admins_collection.find_one({"username": username})
            
            if not user_data:
                raise AuthenticationFailed('User not found')
                
            # Create a custom user object with the required attributes
            class CustomUser:
                def __init__(self, user_data):
                    self.id = str(user_data.get('_id'))
                    self.username = user_data.get('username')
                    self.email = user_data.get('email')
                    self.is_authenticated = True
                    self.is_active = True
            
            user = CustomUser(user_data)
            return user
            
        except Exception as e:
            raise InvalidToken(f'Failed to get user: {str(e)}')