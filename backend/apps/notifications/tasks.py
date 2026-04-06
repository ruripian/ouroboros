"""
알림 관련 Celery 태스크

- 30일 이상 된 알림 자동 삭제 (매일 새벽 4시)
"""

from datetime import timedelta
from celery import shared_task
from django.utils import timezone


@shared_task
def cleanup_old_notifications():
    """30일 이상 된 알림을 자동 삭제"""
    from .models import Notification

    cutoff = timezone.now() - timedelta(days=30)
    deleted, _ = Notification.objects.filter(created_at__lt=cutoff).delete()
    return f"Deleted {deleted} old notifications"
