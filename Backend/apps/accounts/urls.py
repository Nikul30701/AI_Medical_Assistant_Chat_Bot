from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .views import RegisterView, UserView, CustomTokenObtainPairView


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'message': 'Accounts API is running'})


urlpatterns = [
    path("", health_check, name='health_check'),
    path("register/", RegisterView.as_view(), name='register'),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path('token/refresh/', TokenRefreshView.as_view(), name="refresh"),
    path("me/", UserView.as_view(), name="me"),
    path("logout/", CustomTokenObtainPairView.as_view(), name="logout"),
]
