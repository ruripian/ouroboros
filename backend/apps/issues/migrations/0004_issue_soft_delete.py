# 소프트 삭제(휴지통) 지원을 위한 마이그레이션
# 1. deleted_at 필드 추가 (null = 정상, 값 있음 = 삭제됨)
# 2. parent FK: SET_NULL → CASCADE (부모 완전 삭제 시 하위 이슈도 함께 제거)

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("issues", "0003_issue_link"),
    ]

    operations = [
        migrations.AddField(
            model_name="issue",
            name="deleted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="issue",
            name="parent",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sub_issues",
                to="issues.issue",
            ),
        ),
    ]
