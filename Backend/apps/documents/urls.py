from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .views import DocumentListView, DocumentUploadView, DocumentDetailView


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'message': 'Documents API is running'})


urlpatterns = [
    path("health/", health_check, name='health_check'),
    path("", DocumentListView.as_view(), name='document-list'),  # Main list endpoint
    path("upload/", DocumentUploadView.as_view(), name='document-upload'),
    path("<int:pk>/", DocumentDetailView.as_view(), name='document-detail'),
]
