from rest_framework import generics, permissions
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from utils.pagination import ChatMessageCursorPagination


class ChatSessionView(generics.RetrieveAPIView):
    """
    GET /api/chat/<document_id>/
    Returns (or creates) the chat session for the authenticated user + document,
    including all messages nested inside.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatSessionSerializer

    def get_object(self):
        session, _ = ChatSession.objects.get_or_create(
            user=self.request.user,
            document_id=self.kwargs['document_id'],
        )
        return session


class ChatMessageView(generics.ListCreateAPIView):
    """
    GET /api/chat/<document_id>/messages/
    POST /api/chat/<document_id>/messages/
    Returns (or creates) messages for the session.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatMessageSerializer
    pagination_class = ChatMessageCursorPagination

    def get_queryset(self):
        session, _ = ChatSession.objects.get_or_create(
            user=self.request.user,
            document_id=self.kwargs['document_id'],
        )
        return ChatMessage.objects.filter(session=session).order_by('created_at')

    def perform_create(self, serializer):
        session, _ = ChatSession.objects.get_or_create(
            user=self.request.user,
            document_id=self.kwargs['document_id'],
        )
        # Note: If you want immediate AI response via HTTP, 
        # you would trigger it here or in a signal.
        # This currently just saves the user's message.
        serializer.save(session=session, role='user')