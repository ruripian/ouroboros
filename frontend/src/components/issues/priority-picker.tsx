import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PRIORITY_ICONS,
  PRIORITY_COLOR,
  PRIORITY_LABEL_KEY,
  PRIORITY_LIST,
  type Priority,
} from "@/constants/priority";
import { cn } from "@/lib/utils";

/**
 * PriorityPicker — 이슈 우선순위 선택 드롭다운 (인라인 편집용)
 *
 * 재사용: TableView, TimelineView 등 우선순위를 인라인 변경하는 모든 곳
 */

interface Props {
  currentPriority: Priority;
  onChange: (p: Priority) => void;
  className?: string;
}

export function PriorityPicker({ currentPriority, onChange, className }: Props) {
  const { t } = useTranslation();
  const color = PRIORITY_COLOR[currentPriority];
  const Icon = PRIORITY_ICONS[currentPriority];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs hover:bg-muted/60 transition-colors w-full",
            className,
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
          <span style={{ color }}>{t(PRIORITY_LABEL_KEY[currentPriority])}</span>
          <ChevronDown className="h-3 w-3 ml-auto text-muted-foreground/60 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 rounded-xl p-1.5" onClick={(e) => e.stopPropagation()}>
        {PRIORITY_LIST.map((p) => {
          const ItemIcon = PRIORITY_ICONS[p];
          return (
            <DropdownMenuItem
              key={p}
              className="gap-2 rounded-lg text-xs cursor-pointer"
              onClick={() => onChange(p)}
            >
              <ItemIcon className="h-3.5 w-3.5 shrink-0" style={{ color: PRIORITY_COLOR[p] }} />
              <span style={{ color: PRIORITY_COLOR[p] }}>{t(PRIORITY_LABEL_KEY[p])}</span>
              {currentPriority === p && <Check className="h-3 w-3 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
