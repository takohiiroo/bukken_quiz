"""
ASGI config for bukken_quiz_web project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import quiz.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bukken_quiz_web.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # 普通のHTTPリクエストも受ける
    "websocket": AuthMiddlewareStack(
        URLRouter(
            quiz.routing.websocket_urlpatterns
        )
    ),
})
