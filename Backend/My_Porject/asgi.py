"""
ASGI config for My_Porject project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'My_Porject.settings')

# Must initialise Django before importing any app modules
django_asgi_app = get_asgi_application()

from apps.chat.middleware import JWTAuthMiddleware   # noqa: E402
import apps.chat.routing as chat_routing              # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(chat_routing.websocket_urlpatterns)
        )
    ),
})
