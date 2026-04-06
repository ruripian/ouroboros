import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { issuesApi } from "@/api/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Label } from "@/types";

// 인라인 편집 행
function LabelRow({
  label,
  onSave,
  onDelete,
}: {
  label: Label;
  onSave: (id: string, data: { name: string; color: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(label.id, { name, color });
    setEditing(false);
  };
  const handleCancel = () => {
    setName(label.name);
    setColor(label.color);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 group">
      {/* 색상 선택 */}
      <div className="relative shrink-0">
        <span
          className="block h-4 w-4 rounded-full border border-border"
          style={{ backgroundColor: color }}
        />
        {editing && (
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer"
          />
        )}
      </div>

      {editing ? (
        <>
          <Input
            className="h-7 text-sm flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            onBlur={() => { if (name.trim()) handleSave(); else handleCancel(); }}
            autoFocus
          />
          <button onClick={handleSave} className="text-primary hover:text-primary/80">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
            style={{ borderColor: label.color, color: label.color, backgroundColor: `${label.color}18` }}
          >
            {label.name}
          </span>
          <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(label.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function LabelsPage() {
  const { t } = useTranslation();
  const { workspaceSlug, projectId } = useParams<{
    workspaceSlug: string;
    projectId: string;
  }>();
  const qc = useQueryClient();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#5E6AD2");
  const [adding, setAdding] = useState(false);

  const { data: labels = [] } = useQuery({
    queryKey: ["labels", workspaceSlug, projectId],
    queryFn: () => issuesApi.labels.list(workspaceSlug!, projectId!),
    enabled: !!workspaceSlug && !!projectId,
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["labels", workspaceSlug, projectId] });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; color: string } }) =>
      issuesApi.labels.update(workspaceSlug!, projectId!, id, data),
    onSuccess: () => { invalidate(); toast.success(t("labels.updated")); },
    onError:   () => toast.error(t("labels.updateFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => issuesApi.labels.delete(workspaceSlug!, projectId!, id),
    onSuccess: () => { invalidate(); toast.success(t("labels.deleted")); },
    onError:   () => toast.error(t("labels.deleteFailed")),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      issuesApi.labels.create(workspaceSlug!, projectId!, {
        name:  newName,
        color: newColor,
      }),
    onSuccess: () => {
      invalidate();
      setNewName("");
      setNewColor("#5E6AD2");
      setAdding(false);
      toast.success(t("labels.created"));
    },
    onError: () => toast.error(t("labels.createFailed")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{t("labels.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("labels.subtitle")}
        </p>
      </div>

      <div className="rounded-xl border glass divide-y divide-border overflow-hidden">
        {labels.length === 0 && !adding && (
          <p className="px-4 py-6 text-sm text-center text-muted-foreground">
            {t("labels.empty")}
          </p>
        )}

        {labels.map((label) => (
          <LabelRow
            key={label.id}
            label={label}
            onSave={(id, data) => updateMutation.mutate({ id, data })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}

        {/* 새 라벨 추가 행 */}
        {adding && (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="relative shrink-0">
              <span
                className="block h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: newColor }}
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer"
              />
            </div>
            <Input
              className="h-7 text-sm flex-1"
              placeholder={t("labels.labelName")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) createMutation.mutate();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              onBlur={() => { if (newName.trim()) createMutation.mutate(); else { setAdding(false); setNewName(""); } }}
              autoFocus
            />
            <button
              onClick={() => newName.trim() && createMutation.mutate()}
              className="text-primary hover:text-primary/80"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setAdding(false); setNewName(""); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!adding && (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {t("labels.addLabel")}
        </Button>
      )}
    </div>
  );
}
