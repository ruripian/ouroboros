import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  auto_archive_days: z.coerce.number().int().min(1).nullable(),
});
type FormValues = z.infer<typeof schema>;

export function AutoArchivePage() {
  const { workspaceSlug, projectId } = useParams<{
    workspaceSlug: string;
    projectId: string;
  }>();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ["project", workspaceSlug, projectId],
    queryFn: () => projectsApi.get(workspaceSlug!, projectId!),
    enabled: !!workspaceSlug && !!projectId,
  });

  const enabled = project?.auto_archive_days != null;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { auto_archive_days: project?.auto_archive_days ?? null },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      projectsApi.update(workspaceSlug!, projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", workspaceSlug, projectId] });
      toast.success(t("project.settings.autoArchive.saved"));
    },
    onError: () => toast.error(t("project.settings.autoArchive.saveFailed")),
  });

  const toggleArchive = () => {
    if (enabled) {
      mutation.mutate({ auto_archive_days: null });
    } else {
      mutation.mutate({ auto_archive_days: 30 });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">{t("project.settings.autoArchive.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("project.settings.autoArchive.subtitle")}
        </p>
      </div>

      {/* 활성화/비활성화 토글 */}
      <div className="flex items-center justify-between rounded-lg border glass p-4 max-w-sm">
        <div>
          <p className="text-sm font-medium">{t("project.settings.autoArchive.enableLabel")}</p>
          <p className="text-xs text-muted-foreground">{t("project.settings.autoArchive.enableDescription")}</p>
        </div>
        <Button variant={enabled ? "default" : "outline"} size="sm" onClick={toggleArchive}>
          {enabled ? t("project.settings.autoArchive.enabled") : t("project.settings.autoArchive.disabled")}
        </Button>
      </div>

      {/* 일수 설정 (활성화 시만 표시) */}
      {enabled && (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>{t("project.settings.autoArchive.daysLabel")}</Label>
            <Input
              type="number"
              min={1}
              {...register("auto_archive_days")}
            />
            <p className="text-xs text-muted-foreground">
              {t("project.settings.autoArchive.daysDescription")}
            </p>
            {errors.auto_archive_days && (
              <p className="text-xs text-destructive">{t("project.settings.autoArchive.daysInvalid")}</p>
            )}
          </div>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? t("project.settings.autoArchive.saving") : t("project.settings.autoArchive.save")}
          </Button>
        </form>
      )}
    </div>
  );
}
