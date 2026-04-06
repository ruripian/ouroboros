from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """워크스페이스 내 내 알림 목록 (최신순, 최대 50개)"""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return (
            Notification.objects.filter(
                workspace__slug=self.kwargs["workspace_slug"],
                recipient=self.request.user,
            )
            .select_related("actor", "issue", "issue__project")
            [:50]
        )


class NotificationMarkReadView(APIView):
    """개별 알림 읽음 처리"""

    def patch(self, request, workspace_slug, pk):
        try:
            notification = Notification.objects.get(
                id=pk,
                workspace__slug=workspace_slug,
                recipient=request.user,
            )
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        notification.read = True
        notification.save(update_fields=["read"])
        return Response(NotificationSerializer(notification).data)


class NotificationReadAllView(APIView):
    """워크스페이스 내 모든 알림 읽음 처리"""

    def post(self, request, workspace_slug):
        count = Notification.objects.filter(
            workspace__slug=workspace_slug,
            recipient=request.user,
            read=False,
        ).update(read=True)
        return Response({"marked": count})


class NotificationUnreadCountView(APIView):
    """미읽음 알림 수 — TopBar 뱃지 카운터용"""

    def get(self, request, workspace_slug):
        count = Notification.objects.filter(
            workspace__slug=workspace_slug,
            recipient=request.user,
            read=False,
        ).count()
        return Response({"count": count})
