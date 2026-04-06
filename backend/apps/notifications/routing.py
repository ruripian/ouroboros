from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/workspace/(?P<workspace_slug>[^/]+)/$", consumers.WorkspaceConsumer.as_asgi()),
]
