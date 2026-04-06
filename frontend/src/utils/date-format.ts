/**
 * 날짜 포맷 공통 유틸
 *
 * 통합된 함수들:
 *  - formatDate: "4월 5일" / "Apr 5" 형식
 *  - formatLongDate: "2026년 4월 5일 (일)" 형식
 *  - formatTime: "14:30"
 *  - formatRelative: "3분 전" / "2시간 전" / "5일 전"
 *  - formatDateRange: "4월 1일 ~ 4월 15일"
 *
 * i18n: 로케일은 "ko-KR" / "en-US" 기본. navigator.language 활용 가능.
 */

const DEFAULT_LOCALE = "ko-KR";

/** "4월 5일" 또는 "Apr 5" 형식 (짧은 월 + 일) */
export function formatDate(iso: string | Date, locale = DEFAULT_LOCALE): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

/** "2026년 4월 5일" 형식 (년 + 월 + 일) */
export function formatLongDate(iso: string | Date, locale = DEFAULT_LOCALE): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

/** "14:30" 형식 (24시간) */
export function formatTime(iso: string | Date, locale = DEFAULT_LOCALE): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
}

/**
 * 상대 시간 — "3분 전", "2시간 전", "5일 전"
 * i18n 번역이 필요한 경우 t 함수를 받는 오버로드 사용 권장
 */
export function formatRelative(
  iso: string | Date,
  t?: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);

  if (t) {
    if (minutes < 1) return t("dashboard.justNow");
    if (minutes < 60) return t("dashboard.minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("dashboard.hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    return t("dashboard.daysAgo", { count: days });
  }

  // i18n 없이 한국어 하드코딩 (폴백)
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

/** "4월 1일 ~ 4월 15일" 형식의 날짜 범위 */
export function formatDateRange(
  start: string | Date,
  end: string | Date,
  locale = DEFAULT_LOCALE,
): string {
  return `${formatDate(start, locale)} ~ ${formatDate(end, locale)}`;
}
