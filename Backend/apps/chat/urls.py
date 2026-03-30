from django.urls import path
from .views import ChatSessionView, ChatMessageView

urlpatterns = [
    path('<int:document_id>/', ChatSessionView.as_view(), name='chat-session'),
    path('<int:document_id>/messages/', ChatMessageView.as_view(), name='chat-messages'),
]
