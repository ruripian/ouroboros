import { ChevronsUp, ChevronUp, Minus, ChevronDown, MinusCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * 이슈 우선순위 아이콘 + 색상 통합 상수
 *
 * 재사용 대상: 우선순위 표시가 있는 모든 곳
 * (TableView, IssueDetailPage, IssueCreateDialog, TimelineView, BoardView 등)
 *
 * 사용:
 *   const Icon = PRIORITY_ICONS[issue.priority];
 *   const color = PRIORITY_COLOR[issue.priority];
 *   const label = t(PRIORITY_LABEL_KEY[issue.priority]);
 */

export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export const PRIORITY_LIST: Priority[] = ["urgent", "high", "medium", "low", "none"];

export const PRIORITY_ICONS: Record<Priority, LucideIcon> = {
  urgent: ChevronsUp,   // 이중 상향 화살 — 긴급
  high:   ChevronUp,    // 단일 상향 화살 — 높음
  medium: Minus,        // 가로 선 — 보통
  low:    ChevronDown,  // 단일 하향 화살 — 낮음
  none:   MinusCircle,  // 원 안 가로 선 — 없음
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: "#ef4444",
  high:   "#f97316",
  medium: "#eab308",
  low:    "#60a5fa",
  none:   "#9ca3af",
};

/** i18n 번역 키 매핑 — t(PRIORITY_LABEL_KEY[p])로 라벨 조회 */
export const PRIORITY_LABEL_KEY: Record<Priority, string> = {
  urgent: "issues.priority.urgent",
  high:   "issues.priority.high",
  medium: "issues.priority.medium",
  low:    "issues.priority.low",
  none:   "issues.priority.none",
};
