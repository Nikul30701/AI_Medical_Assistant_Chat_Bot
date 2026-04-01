from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import *

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class UserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # This ignores the 'pk' in the URL and always returns the current user
        return self.request.user
