from django.contrib import admin
from .models import Project, ProjectMember, State


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["identifier", "name", "workspace", "created_by"]
    search_fields = ["name", "identifier"]


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "group", "sequence"]
    list_filter = ["group"]


admin.site.register(ProjectMember)
