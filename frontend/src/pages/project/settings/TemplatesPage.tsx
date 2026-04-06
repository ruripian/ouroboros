/**
 * 이슈 템플릿 관리 페이지 — 프로젝트 설정 내부
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, FileText, Trash2 } from "lucide-react";
import { issuesApi } from "@/api/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IssueTemplate } from "@/types";

export function TemplatesPage() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  /* 폼 상태 */
  const [name, setName] = useState("");
  const [titleTemplate, setTitleTemplate] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [priority, setPriority] = useState("none");

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", workspaceSlug, projectId],
    queryFn: () => issuesApi.templates.list(workspaceSlug!, projectId!),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      issuesApi.templates.create(workspaceSlug!, projectId!, {
        name,
        title_template: titleTemplate,
        description_html: descriptionHtml,
        priority,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates", workspaceSlug, projectId] });
      toast.success(t("issues.templates.saved"));
      setCreateOpen(false);
      setName(""); setTitleTemplate(""); setDescriptionHtml(""); setPriority("none");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => issuesApi.templates.delete(workspaceSlug!, projectId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates", workspaceSlug, projectId] });
      toast.success(t("issues.templates.deleted"));
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("issues.templates.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("issues.templates.subtitle")}</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {t("issues.templates.create")}
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{t("issues.templates.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((tmpl: IssueTemplate) => (
            <div key={tmpl.id} className="group flex items-start gap-4 rounded-xl border glass p-4 hover:bg-accent/50 transition-colors">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{tmpl.name}</p>
                {tmpl.title_template && (
                  <p className="text-xs text-muted-foreground mt-0.5">{t("issues.templates.titleLabel")} {tmpl.title_template}</p>
                )}
                {tmpl.description_html && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tmpl.description_html}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`issues.priority.${tmpl.priority}`)}
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(t("issues.templates.deleteConfirm"))) {
                    deleteMutation.mutate(tmpl.id);
                  }
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 생성 다이얼로그 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("issues.templates.create")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>{t("issues.templates.name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("issues.templates.namePlaceholder")}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>{t("issues.templates.titleTemplate")}</Label>
              <Input
                value={titleTemplate}
                onChange={(e) => setTitleTemplate(e.target.value)}
                placeholder={t("issues.templates.titleTemplatePlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("issues.templates.description")}</Label>
              <textarea
                rows={4}
                value={descriptionHtml}
                onChange={(e) => setDescriptionHtml(e.target.value)}
                placeholder={t("issues.templates.descriptionPlaceholder")}
                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label>{t("issues.templates.priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("issues.priority.none")}</SelectItem>
                  <SelectItem value="urgent">{t("issues.priority.urgent")}</SelectItem>
                  <SelectItem value="high">{t("issues.priority.high")}</SelectItem>
                  <SelectItem value="medium">{t("issues.priority.medium")}</SelectItem>
                  <SelectItem value="low">{t("issues.priority.low")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("issues.create.cancel")}</Button>
              <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
                {createMutation.isPending ? t("issues.templates.saving") : t("issues.templates.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
