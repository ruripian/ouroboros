from django.urls import path
from . import views

urlpatterns = [
    # GET  /api/workspaces/<slug>/notifications/           — 알림 목록
    path(
        "workspaces/<str:workspace_slug>/notifications/",
        views.NotificationListView.as_view(),
        name="notification-list",
    ),
    # PATCH /api/workspaces/<slug>/notifications/<id>/read/ — 개별 읽음
    path(
        "workspaces/<str:workspace_slug>/notifications/<uuid:pk>/read/",
        views.NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
    # POST /api/workspaces/<slug>/notifications/read-all/  — 전체 읽음
    path(
        "workspaces/<str:workspace_slug>/notifications/read-all/",
        views.NotificationReadAllView.as_view(),
        name="notification-read-all",
    ),
    # GET  /api/workspaces/<slug>/notifications/unread-count/ — 미읽음 수
    path(
        "workspaces/<str:workspace_slug>/notifications/unread-count/",
        views.NotificationUnreadCountView.as_view(),
        name="notification-unread-count",
    ),
]
