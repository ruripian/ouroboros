from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_detail = UserSerializer(source="actor", read_only=True)

    # 이슈 요약 정보 (전체 시리얼라이저 사용 시 순환 참조 위험 → 인라인 정의)
    issue_title = serializers.CharField(source="issue.title", read_only=True, default=None)
    issue_sequence_id = serializers.IntegerField(source="issue.sequence_id", read_only=True, default=None)
    project_id = serializers.UUIDField(source="issue.project_id", read_only=True, default=None)
    project_identifier = serializers.CharField(source="issue.project.identifier", read_only=True, default=None)

    class Meta:
        model = Notification
        fields = [
            "id", "type", "message", "read",
            "actor", "actor_detail",
            "issue", "issue_title", "issue_sequence_id",
            "project_id", "project_identifier",
            "workspace", "created_at",
        ]
        read_only_fields = [
            "id", "type", "message", "actor", "issue",
            "workspace", "created_at",
        ]
