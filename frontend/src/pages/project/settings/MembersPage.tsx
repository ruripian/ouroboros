import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import { workspacesApi } from "@/api/workspaces";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Crown } from "lucide-react";
import type { ProjectMember } from "@/types";

const ROLES = [
  { value: 10, key: "viewer" },
  { value: 15, key: "member" },
  { value: 20, key: "admin" },
] as const;

export function MembersPage() {
  const { workspaceSlug, projectId } = useParams<{
    workspaceSlug: string;
    projectId: string;
  }>();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [addUserId, setAddUserId] = useState("");

  const { data: members = [] } = useQuery({
    queryKey: ["project-members", workspaceSlug, projectId],
    queryFn: () => projectsApi.members.list(workspaceSlug!, projectId!),
  });

  const { data: wsMembers = [] } = useQuery({
    queryKey: ["workspace-members", workspaceSlug],
    queryFn: () => workspacesApi.members(workspaceSlug!),
  });

  /* 현재 프로젝트 정보 — 리더(lead) id 확인용 */
  const { data: project } = useQuery({
    queryKey: ["project", workspaceSlug, projectId],
    queryFn: () => projectsApi.get(workspaceSlug!, projectId!),
    enabled: !!workspaceSlug && !!projectId,
  });
  const leadId = project?.lead ?? null;

  // 이미 프로젝트 멤버인 유저를 제외한 워크스페이스 멤버
  const memberIds = new Set(members.map((m: ProjectMember) => m.member.id));
  const available = wsMembers.filter((wm) => !memberIds.has(wm.member.id));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["project-members", workspaceSlug, projectId] });
  };

  const addMutation = useMutation({
    mutationFn: (memberId: string) =>
      projectsApi.members.add(workspaceSlug!, projectId!, { member_id: memberId }),
    onSuccess: () => { invalidate(); setAddUserId(""); },
    onError: () => toast.error(t("project.settings.members.addFailed")),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: number }) =>
      projectsApi.members.updateRole(workspaceSlug!, projectId!, id, { role }),
    onSuccess: invalidate,
    onError: () => toast.error(t("project.settings.members.updateFailed")),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      projectsApi.members.remove(workspaceSlug!, projectId!, id),
    onSuccess: invalidate,
    onError: () => toast.error(t("project.settings.members.removeFailed")),
  });

  /* 리더 지정 — Project.lead 업데이트 */
  const setLeadMutation = useMutation({
    mutationFn: (memberUserId: string) =>
      projectsApi.update(workspaceSlug!, projectId!, { lead: memberUserId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", workspaceSlug, projectId] });
      qc.invalidateQueries({ queryKey: ["project-members", workspaceSlug, projectId] });
      toast.success(t("project.settings.members.leadUpdated"));
    },
    onError: () => toast.error(t("project.settings.members.leadUpdateFailed")),
  });

  /* 리더 해제 — Project.lead = null */
  const clearLeadMutation = useMutation({
    mutationFn: () =>
      projectsApi.update(workspaceSlug!, projectId!, { lead: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", workspaceSlug, projectId] });
      toast.success(t("project.settings.members.leadCleared"));
    },
    onError: () => toast.error(t("project.settings.members.leadUpdateFailed")),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">{t("project.settings.members.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("project.settings.members.subtitle")}
        </p>
      </div>

      {/* 멤버 추가 */}
      {available.length > 0 && (
        <div className="flex items-center gap-2 max-w-md">
          <Select value={addUserId} onValueChange={setAddUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("project.settings.members.selectUser")} />
            </SelectTrigger>
            <SelectContent>
              {available.map((wm) => (
                <SelectItem key={wm.member.id} value={wm.member.id}>
                  {wm.member.display_name} ({wm.member.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!addUserId || addMutation.isPending}
            onClick={() => addUserId && addMutation.mutate(addUserId)}
          >
            {t("project.settings.members.add")}
          </Button>
        </div>
      )}

      {/* 멤버 목록 */}
      <div className="space-y-2">
        {members.map((pm: ProjectMember) => {
          const isLead = pm.member.id === leadId;
          return (
            <div
              key={pm.id}
              className="flex items-center gap-3 rounded-lg border glass p-3"
            >
              {/* 아바타 */}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                {pm.member.display_name[0]?.toUpperCase()}
              </span>

              {/* 이름/이메일 + 리더 배지 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{pm.member.display_name}</p>
                  {isLead && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-2xs font-medium text-amber-600 dark:text-amber-400">
                      <Crown className="h-3 w-3" />
                      {t("project.settings.members.leadBadge")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{pm.member.email}</p>
              </div>

              {/* 리더 버튼: 리더가 아니고 Admin이면 "리더로 지정", 리더면 "리더 해제" */}
              {isLead ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearLeadMutation.mutate()}
                  disabled={clearLeadMutation.isPending}
                  className="text-xs"
                >
                  {t("project.settings.members.clearLead")}
                </Button>
              ) : pm.role === 20 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeadMutation.mutate(pm.member.id)}
                  disabled={setLeadMutation.isPending}
                  className="text-xs"
                >
                  {t("project.settings.members.setLead")}
                </Button>
              ) : null}

              {/* 역할 변경 */}
              <Select
                value={String(pm.role)}
                onValueChange={(v) => roleMutation.mutate({ id: pm.id, role: Number(v) })}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {t(`project.settings.members.role.${r.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 제거 — 리더도 제거 가능(백엔드에서 자동으로 lead=null 처리) */}
              <button
                onClick={() => removeMutation.mutate(pm.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
