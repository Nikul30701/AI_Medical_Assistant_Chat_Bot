from rest_framework import generics, permissions
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from utils.pagination import ChatMessageCursorPagination


class ChatSessionView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatSessionSerializer

    def get_object(self):
        session, _ = ChatSession.objects.get_or_create(
            user=self.request.user,
            document_id=self.kwargs['document_id'],
        )
        return session


class ChatMessageView(generics.ListCreateAPIView):
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
     
        serializer.save(session=session, role='user')
