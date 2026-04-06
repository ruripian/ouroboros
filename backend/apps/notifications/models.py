"""
알림 모델 — 인앱 알림을 저장하는 단일 모델

알림 타입:
  - issue_assigned:  이슈에 담당자로 배정됨
  - issue_updated:   담당 이슈의 상태/우선순위 변경
  - comment_added:   담당 이슈에 새 댓글
  - mentioned:       댓글/설명에서 멘션됨 (향후 확장)
"""

import uuid
from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        ISSUE_ASSIGNED = "issue_assigned", "Issue Assigned"
        ISSUE_UPDATED = "issue_updated", "Issue Updated"
        COMMENT_ADDED = "comment_added", "Comment Added"
        MENTIONED = "mentioned", "Mentioned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 알림 수신자
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    # 알림을 발생시킨 사용자
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="triggered_notifications",
    )

    type = models.CharField(max_length=30, choices=Type.choices)

    # 관련 이슈 (nullable — 향후 이슈 외 알림 확장 가능)
    issue = models.ForeignKey(
        "issues.Issue",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    # 관련 워크스페이스 — 알림 목록 필터링용
    workspace = models.ForeignKey(
        "workspaces.Workspace",
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    # 알림 메시지 (사람이 읽을 수 있는 요약)
    message = models.TextField()

    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "-created_at"]),
            models.Index(fields=["recipient", "read"]),
        ]

    def __str__(self):
        return f"[{self.type}] {self.recipient} ← {self.actor}: {self.message[:50]}"
