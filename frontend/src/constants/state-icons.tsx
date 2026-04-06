import { Circle, CircleDashed, CircleDot, CheckCircle2, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * 프로젝트 상태(state.group) → lucide 아이콘 매핑
 *
 * 재사용: 이슈 상태 표시하는 모든 곳(TableView, TimelineView, BoardView, etc.)
 *
 * 사용:
 *   const Icon = STATE_ICONS[state.group] ?? Circle;
 *   <Icon className="h-3.5 w-3.5" style={{ color: state.color }} />
 */

export type StateGroup = "backlog" | "unstarted" | "started" | "completed" | "cancelled";

export const STATE_ICONS: Record<string, LucideIcon> = {
  backlog:   CircleDashed,   // 점선 원 — 미정
  unstarted: Circle,         // 빈 원 — 시작 전
  started:   CircleDot,      // 중심점 원 — 진행 중
  completed: CheckCircle2,   // 체크 원 — 완료
  cancelled: XCircle,        // X 원 — 취소
};

/** 상태 group 키로 아이콘을 안전하게 조회 (없으면 Circle 폴백) */
export function getStateIcon(group: string | undefined | null): LucideIcon {
  return STATE_ICONS[group ?? "backlog"] ?? Circle;
}
