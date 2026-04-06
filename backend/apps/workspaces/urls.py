from django.urls import path
from .views import (
    WorkspaceListCreateView,
    WorkspaceDetailView,
    WorkspaceMemberListView,
    WorkspaceMemberDetailView,
    WorkspaceInvitationListCreateView,
    WorkspaceInvitationRevokeView,
)

urlpatterns = [
    path("", WorkspaceListCreateView.as_view(), name="workspace-list"),
    path("<slug:slug>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
    path("<slug:slug>/members/", WorkspaceMemberListView.as_view(), name="workspace-members"),
    path("<slug:slug>/members/<uuid:member_id>/", WorkspaceMemberDetailView.as_view(), name="workspace-member-detail"),
    # 초대 관리 (워크스페이스 내)
    path("<slug:slug>/invitations/", WorkspaceInvitationListCreateView.as_view(), name="workspace-invitations"),
    path("<slug:slug>/invitations/<uuid:invitation_id>/revoke/", WorkspaceInvitationRevokeView.as_view(), name="workspace-invitation-revoke"),
]
