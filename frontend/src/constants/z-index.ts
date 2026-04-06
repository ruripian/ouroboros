/**
 * 전역 z-index 체계
 *
 * 새 모달/팝오버/오버레이 추가 시 반드시 이 상수를 사용할 것.
 * Tailwind 클래스에서는 z-[값] 형태로, inline style에서는 직접 사용.
 *
 * 레이어 순서 (낮은 → 높은):
 *   콘텐츠 내부 요소 → sticky 헤더 → 오버레이 → 모달 → 검색 → 설정 패널 → 팝오버 → 에디터 툴바
 */

/* ── 콘텐츠 내부 (뷰 컴포넌트 안) ── */
/** 오늘 날짜 강조 등 미세한 쌓임 */
export const Z_CONTENT_HIGHLIGHT = 1;
/** 캘린더/타임라인 바, 드롭 인디케이터 등 */
export const Z_CONTENT_OVERLAY = 10;
/** 드래그 핸들, 네스트 오버레이 등 */
export const Z_CONTENT_INTERACTIVE = 20;
/** sticky 헤더 (테이블 컬럼 헤더, 타임라인 헤더) */
export const Z_STICKY_HEADER = 10;
/** 타임라인 sticky 사이드 컬럼 */
export const Z_STICKY_SIDE = 20;
/** 타임라인 sticky 코너 (헤더 + 사이드 교차) */
export const Z_STICKY_CORNER = 30;

/* ── 전역 레이어 (fixed position) ── */
/** 모바일 사이드바 오버레이 배경 */
export const Z_SIDEBAR_OVERLAY = 40;
/** 모바일 사이드바 본체, 드롭다운 메뉴, 셀렉트 팝오버 */
export const Z_SIDEBAR = 50;
/** 이슈 상세 패널 오버레이 (배경 블러) */
export const Z_MODAL_OVERLAY = 40;
/** 이슈 상세 패널 본체, dialog, 벌크 툴바 */
export const Z_MODAL = 50;
/** 전역 검색 다이얼로그 (모든 모달 위) */
export const Z_SEARCH = 60;
/** 설정 패널 (캘린더/타임라인 설정 등) 오버레이 */
export const Z_SETTINGS_OVERLAY = 100;
/** 설정 패널 본체 */
export const Z_SETTINGS_PANEL = 110;
/** DatePicker 달력 팝오버 */
export const Z_DATEPICKER = 300;
/** 에디터 플로팅 툴바 (최상위) */
export const Z_EDITOR_TOOLBAR = 9999;
