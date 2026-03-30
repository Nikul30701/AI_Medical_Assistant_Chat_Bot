from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from rest_framework.request import Request


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that reads JWT tokens from httpOnly cookies
    instead of Authorization header.
    """
    
    def get_validated_token(self, raw_token):
        """
        Validates the raw token and returns the validated token.
        """
        return super().get_validated_token(raw_token)
    
    def get_raw_token(self, request: Request):
        """
        Extracts the raw token from the httpOnly cookie.
        """
        # Try to get the access token from the cookie
        access_token = request.COOKIES.get(getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE', 'access_token'))
        
        if not access_token:
            return None
            
        return access_token
    
    def get_header(self, request: Request):
        """
        We override this method because we're not using Authorization header.
        The token is extracted from cookies in get_raw_token method.
        """
        if request.COOKIES.get(getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE', 'access_token')):
            return {'Authorization': 'Bearer cookie_token'}
        return None
