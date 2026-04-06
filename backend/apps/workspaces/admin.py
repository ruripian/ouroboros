from django.contrib import admin
from .models import Workspace, WorkspaceMember


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "owner", "created_at"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display = ["workspace", "member", "role"]
    list_filter = ["role"]
