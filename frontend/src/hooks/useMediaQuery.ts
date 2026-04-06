import { useState, useEffect } from "react";

/**
 * 미디어 쿼리 훅 — 반응형 분기에 사용
 * @param query CSS 미디어 쿼리 문자열 (예: "(min-width: 1024px)")
 * @returns 현재 뷰포트가 쿼리에 매칭되는지 여부
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** lg 브레이크포인트 (1024px) 이상인지 — 사이드바 표시 기준 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
