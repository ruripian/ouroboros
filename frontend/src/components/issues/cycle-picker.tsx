import { ChevronDown, Check, Zap, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Cycle } from "@/types";

/**
 * CyclePicker — 이슈 사이클 단일 선택 드롭다운 (인라인 편집용)
 *
 * 재사용: TableView, IssueDetailPage 등 사이클을 인라인 변경하는 모든 곳
 *
 * 사용:
 *   <CyclePicker
 *     cycles={projectCycles}
 *     currentId={issue.cycle}
 *     onChange={(id) => updateMutation.mutate({ cycle: id })}
 *   />
 */

interface Props {
  cycles:    Pick<Cycle, "id" | "name" | "status">[];
  currentId: string | null | undefined;
  onChange:  (cycleId: string | null) => void;
  className?: string;
}

export function CyclePicker({ cycles, currentId, onChange, className }: Props) {
  const { t } = useTranslation();
  const cur = currentId ? cycles.find((c) => c.id === currentId) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs hover:bg-muted/60 transition-colors w-full min-h-[28px]",
            className,
          )}
        >
          <Zap className={cn("h-3.5 w-3.5 shrink-0", cur ? "text-foreground" : "text-muted-foreground/40")} />
          <span className={cn("truncate flex-1 text-left", !cur && "text-muted-foreground/40")}>
            {cur?.name ?? "—"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground/60 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 rounded-xl p-1.5" onClick={(e) => e.stopPropagation()}>
        {/* 없음 옵션 */}
        <DropdownMenuItem
          className="gap-2 rounded-lg text-xs cursor-pointer"
          onClick={() => onChange(null)}
        >
          <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <span className="flex-1 text-muted-foreground">{t("issues.picker.none")}</span>
          {!currentId && <Check className="h-3 w-3 text-primary shrink-0" />}
        </DropdownMenuItem>

        {cycles.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-1.5">{t("issues.picker.noCycles")}</p>
        ) : (
          cycles.map((c) => (
            <DropdownMenuItem
              key={c.id}
              className="gap-2 rounded-lg text-xs cursor-pointer"
              onClick={() => onChange(c.id)}
            >
              <Zap className={cn(
                "h-3.5 w-3.5 shrink-0",
                c.status === "active" ? "text-primary" :
                c.status === "completed" ? "text-muted-foreground/50" :
                "text-primary/70"
              )} />
              <span className="flex-1 truncate">{c.name}</span>
              {currentId === c.id && <Check className="h-3 w-3 text-primary shrink-0" />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
