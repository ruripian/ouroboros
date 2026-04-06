import { cn } from "@/lib/utils";

/**
 * AvatarInitials — 사용자 이름의 첫 글자를 원형 아바타로 표시
 *
 * 재사용 대상: 이슈 목록/담당자/멤버 리스트 등 프로젝트 전반
 *
 * 사용:
 *   <AvatarInitials name="홍길동" size="md" />
 *   <AvatarInitials name={user.display_name} size="sm" title={user.email} />
 */

type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "h-5 w-5 text-3xs",
  sm: "h-6 w-6 text-2xs",
  md: "h-7 w-7 text-xs",
  lg: "h-9 w-9 text-sm",
};

export interface AvatarInitialsProps {
  /** 표시 이름(첫 글자만 사용) */
  name: string | null | undefined;
  /** 크기 (기본 sm = h-6 w-6) */
  size?: AvatarSize;
  /** 툴팁 */
  title?: string;
  /** 추가 클래스 */
  className?: string;
  /** 테두리(ring) 표시 — 겹친 아바타 리스트용 */
  ring?: boolean;
}

export function AvatarInitials({
  name,
  size = "sm",
  title,
  className,
  ring = false,
}: AvatarInitialsProps) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  return (
    <span
      title={title ?? name ?? undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/20 font-bold text-primary shrink-0",
        SIZE_CLASSES[size],
        ring && "border-2 border-background",
        className,
      )}
    >
      {initial}
    </span>
  );
}
