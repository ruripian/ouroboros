from django.contrib import admin
from .models import Issue, IssueComment, IssueActivity, Label


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ["sequence_id", "title", "project", "state", "priority", "created_by"]
    list_filter = ["priority", "state__group"]
    search_fields = ["title"]


admin.site.register(IssueComment)
admin.site.register(IssueActivity)
admin.site.register(Label)
