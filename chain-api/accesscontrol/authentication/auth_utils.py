from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


def validate_admin_token(request):
    """
    Validates JWT token for admin users without Django User lookup
    Returns tuple (is_valid, token_data, error_response)
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return False, None, Response(
            {'error': 'Authentication required'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    token = auth_header.split(' ')[1]
    
    try:
        # Validate token without user lookup
        access_token = AccessToken(token)
        
        # Extract admin info from token
        token_data = {
            'admin_id': access_token.get('admin_id'),
            'email': access_token.get('email'),
            'name': access_token.get('name')
        }
        
        return True, token_data, None
        
    except TokenError as e:
        return False, None, Response(
            {'error': f'Invalid or expired token: {str(e)}'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


def require_admin_auth(view_func):
    """
    Decorator to require admin authentication for view methods
    """
    def wrapper(self, request, *args, **kwargs):
        is_valid, token_data, error_response = validate_admin_token(request)
        
        if not is_valid:
            return error_response
        
        # Add token data to request for use in view
        request.admin_data = token_data
        
        return view_func(self, request, *args, **kwargs)
    
    return wrapper
