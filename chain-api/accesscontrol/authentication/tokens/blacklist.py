from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

class TokenBlacklist:
    
    @staticmethod
    def blacklist_token(token):
        try:
            outstanding_token = OutstandingToken.objects.get(token=token)
            BlacklistedToken.objects.create(token=outstanding_token)
            return True
        except Exception:
            return False
    
    @staticmethod
    def is_blacklisted(token):
        try:
            outstanding_token = OutstandingToken.objects.get(token=token)
            return BlacklistedToken.objects.filter(token=outstanding_token).exists()
        except Exception:
            return True
    
    @staticmethod
    def clean_expired_tokens():
        current_time = timezone.now()
        expired_tokens = OutstandingToken.objects.filter(expires_at__lt=current_time)
        count = expired_tokens.count()
        expired_tokens.delete()
        return count