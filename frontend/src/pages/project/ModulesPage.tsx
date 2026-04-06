import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Layers, Trash2 } from "lucide-react";
import { projectsApi } from "@/api/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectIconPicker, ProjectIcon, type IconProp } from "@/components/ui/project-icon-picker";
import type { Module } from "@/types";

/* 모듈 = 거대 분류(백엔드/프론트엔드/DB 등). 단순한 이름·설명만 유지.
   상태/일정은 Cycle(스프린트)에서 관리하므로 여기선 제거. */
const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ModulesPage() {
  const { workspaceSlug, projectId } = useParams<{
    workspaceSlug: string;
    projectId: string;
  }>();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  /* 아이콘 선택 — ProjectIconPicker는 Zod 바깥의 controlled state로 관리 */
  const [iconProp, setIconProp] = useState<IconProp | null>(null);

  const { data: modules = [] } = useQuery({
    queryKey: ["modules", workspaceSlug, projectId],
    queryFn: () => projectsApi.modules.list(workspaceSlug!, projectId!),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => {
      /* status는 백엔드 기본값 "backlog" 사용, 날짜는 전송하지 않음
         iconProp: 사용자가 선택했으면 함께 전송, 안 했으면 null → 백엔드에서 기본 아이콘 */
      return projectsApi.modules.create(workspaceSlug!, projectId!, {
        ...data,
        icon_prop: iconProp as unknown as Record<string, unknown> | null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules", workspaceSlug, projectId] });
      reset();
      setIconProp(null);
      setCreateOpen(false);
    },
    onError: () => toast.error(t("modules.createFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (moduleId: string) => projectsApi.modules.delete(workspaceSlug!, projectId!, moduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules", workspaceSlug, projectId] });
      toast.success(t("modules.deleted"));
    },
    onError: () => toast.error(t("modules.deleteFailed")),
  });

  const handleDelete = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    if (window.confirm(t("modules.deleteConfirm"))) {
      deleteMutation.mutate(moduleId);
    }
  };

  // 모듈 클릭 → 모듈 전용 이슈 뷰로 이동
  const handleModuleClick = (mod: Module) => {
    navigate(`/${workspaceSlug}/projects/${projectId}/modules/${mod.id}/issues`);
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("modules.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("modules.subtitle")}</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {t("modules.create")}
        </Button>
      </div>

      {/* 모듈 목록 */}
      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Layers className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{t("modules.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {modules.map((mod: Module) => (
            <div
              key={mod.id}
              onClick={() => handleModuleClick(mod)}
              className="group flex items-center gap-4 rounded-xl border glass p-4 hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <ProjectIcon value={mod.icon_prop} size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mod.name}</p>
                {mod.description && (
                  <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {t("modules.issueCount", { count: mod.issue_count })}
              </span>
              <button
                onClick={(e) => handleDelete(e, mod.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                title={t("modules.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 모듈 생성 다이얼로그 */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.createTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            {/* 아이콘 선택 + 이름 */}
            <div className="space-y-1.5">
              <Label>{t("modules.name")}</Label>
              <div className="flex items-center gap-3">
                <ProjectIconPicker value={iconProp as unknown as Record<string, unknown> | null} onChange={setIconProp} size="lg" />
                <Input placeholder={t("modules.namePlaceholder")} {...register("name")} autoFocus className="h-10 flex-1" />
              </div>
              {errors.name && <p className="text-xs text-destructive">{t("modules.nameRequired")}</p>}
            </div>

            <div className="space-y-1">
              <Label>{t("modules.description")}</Label>
              <Input placeholder={t("modules.descriptionPlaceholder")} {...register("description")} />
              <p className="text-2xs text-muted-foreground">{t("modules.categoryHint")}</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                {t("modules.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t("modules.creating") : t("modules.create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
