import { Users, Plane, Flag, Presentation, Target, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * 프로젝트 캘린더 이벤트 타입 — 아이콘 + 라벨 매핑
 *
 * 각 이벤트에 type을 지정하면 해당 아이콘이 캘린더에 표시됨.
 * 타입: meeting(회의) / trip(출장) / deadline(마감) / presentation(발표) / milestone(마일스톤) / other(기타)
 */

export type EventType = "meeting" | "trip" | "deadline" | "presentation" | "milestone" | "other";

export const EVENT_TYPES: Record<EventType, { icon: LucideIcon; labelKey: string; defaultColor: string }> = {
  meeting:      { icon: Users,        labelKey: "events.type.meeting",      defaultColor: "#5E6AD2" },
  trip:         { icon: Plane,        labelKey: "events.type.trip",         defaultColor: "#A855F7" },
  deadline:     { icon: Flag,         labelKey: "events.type.deadline",     defaultColor: "#D94F4F" },
  presentation: { icon: Presentation, labelKey: "events.type.presentation", defaultColor: "#F0AD4E" },
  milestone:    { icon: Target,       labelKey: "events.type.milestone",    defaultColor: "#26B55E" },
  other:        { icon: Calendar,     labelKey: "events.type.other",        defaultColor: "#64748B" },
};

export const EVENT_TYPE_LIST: EventType[] = ["meeting", "trip", "deadline", "presentation", "milestone", "other"];

/** 색상 팔레트 — ProjectIconPicker와 동일 */
export const EVENT_COLORS = [
  "#5E6AD2", "#26B55E", "#F0AD4E", "#D94F4F", "#A855F7", "#64748B",
];
