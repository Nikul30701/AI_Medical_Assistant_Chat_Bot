import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
import httpx

from apps.documents.models import Document, DocumentAnalysis
from .models import ChatSession, ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket flow:
    1. connect()    → verify JWT user + document ownership → load analysis context
    2. receive()    → save user msg → build history → call Groq → save + send reply
    3. disconnect() → cleanup
    """

    async def connect(self):
        self.user        = self.scope['user']
        self.document_id = self.scope['url_route']['kwargs']['document_id']

        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return

        self.document = await self.get_document()
        if not self.document:
            await self.close(code=4004)
            return

        self.session     = await self.get_or_create_session()
        self.doc_context = await self.get_doc_context()

        await self.accept()
        await self.send(json.dumps({
            'type':    'connected',
            'message': f'Connected. Ask questions about: {self.document.title}',
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data         = json.loads(text_data)
        user_message = data.get('message', '').strip()
        if not user_message:
            return

        await self.save_message(role='user', content=user_message)
        history  = await self.get_recent_history(limit=10)
        ai_reply = await self.call_groq(user_message, history)
        await self.save_message(role='assistant', content=ai_reply)

        await self.send(json.dumps({
            'type':    'message',
            'role':    'assistant',
            'content': ai_reply,
        }))

    # ── DB helpers ────────────────────────────────────────────────

    @database_sync_to_async
    def get_document(self):
        try:
            return Document.objects.get(id=self.document_id, user=self.user)
        except Document.DoesNotExist:
            return None

    @database_sync_to_async
    def get_or_create_session(self):
        session, _ = ChatSession.objects.get_or_create(
            user=self.user, document=self.document
        )
        return session

    @database_sync_to_async
    def get_doc_context(self):
        try:
            a = self.document.analysis
            return (
                f"Title: {self.document.title}\n"
                f"Summary: {a.summary}\n"
                f"Key Findings: {', '.join(a.key_findings)}\n"
                f"Medications: {', '.join(a.medications)}\n"
                f"Warnings: {', '.join(a.warnings)}"
            )
        except DocumentAnalysis.DoesNotExist:
            return f"Title: {self.document.title}\n(No analysis available)"

    @database_sync_to_async
    def save_message(self, role, content):
        return ChatMessage.objects.create(
            session=self.session, role=role, content=content
        )

    @database_sync_to_async
    def get_recent_history(self, limit=10):
        msgs = (
            ChatMessage.objects
            .filter(session=self.session)
            .order_by('-created_at')[:limit]
        )
        return [{'role': m.role, 'content': m.content} for m in reversed(list(msgs))]

    # ── Groq call (async via httpx) ────────────────────────────────

    async def call_groq(self, user_message: str, history: list) -> str:
        system_prompt = (
            "You are a helpful medical document assistant.\n"
            "Answer questions based on the document context below.\n"
            "Always remind users to consult a doctor for medical decisions.\n\n"
            f"DOCUMENT CONTEXT:\n{self.doc_context}"
        )
        messages = [{'role': 'system', 'content': system_prompt}]
        messages.extend(history)
        messages.append({'role': 'user', 'content': user_message})

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {settings.GROQ_API_KEY}',
                        'Content-Type':  'application/json',
                    },
                    json={
                        'model':       settings.GROQ_MODEL,
                        'messages':    messages,
                        'temperature': 0.5,
                        'max_tokens':  500,
                    },
                )
                response.raise_for_status()
                return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"Error processing your question: {str(e)}"
