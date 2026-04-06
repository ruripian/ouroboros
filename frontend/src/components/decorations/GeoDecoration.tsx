/**
 * 기하학적 배경 장식 — 페이지별 다른 도형 조합
 *
 * variant:
 *   "home"    — 메인 홈: 화려, 좌상단+우하단 분산, 다양한 도형
 *   "work"    — 작업 페이지(이슈): 절제, 우하단 작은 삼각형만
 *   "settings"— 설정: 좌상단 원호+삼각
 *   "minimal" — 최소: 장식 거의 없음
 */

const S = "hsl(var(--primary) / "; // stroke 색상 헬퍼

type Variant = "home" | "work" | "settings" | "minimal";

interface Props {
  variant?: Variant;
}

/* ── 궤도 시스템 ── */
function Orbit({ cx, cy, r1, r2, s1, s2 }: {
  cx: string; cy: string; r1: number; r2: number; s1: number; s2: number;
}) {
  return (
    <>
      <div className="geo-orbit-ring" style={{ width: r1*2, height: r1*2, left: `calc(${cx} - ${r1}px)`, top: `calc(${cy} - ${r1}px)` }} />
      <div className="geo-orbit-ring" style={{ width: r2*2, height: r2*2, left: `calc(${cx} - ${r2}px)`, top: `calc(${cy} - ${r2}px)`, borderStyle: "dashed" }} />
      <div className="geo-dot" style={{ width: 5, height: 5, left: cx, top: cy, "--orbit-r": `${r1}px`, animation: `geo-orbit-1 ${s1}s linear infinite` } as React.CSSProperties} />
      <div className="geo-dot" style={{ width: 3, height: 3, left: cx, top: cy, "--orbit-r": `${r2}px`, animation: `geo-orbit-2 ${s2}s linear infinite` } as React.CSSProperties} />
    </>
  );
}

/* ══════════ HOME — 콘텐츠를 감싸는 3D 천체 시스템 ══════════
   원이 콘텐츠의 "세계관"을 형성하는 배경 프레임 역할.
   중심점 = 콘텐츠 영역 중앙 상단 (인사말 뒤) → 원이 콘텐츠를 감싸는 느낌.
   위쪽 반만 보이고 아래는 콘텐츠에 가려져서 "지평선 너머 천체" 효과.
══════════════════════════════════════════════════════════════ */
function Home() {
  return (
    <>
      {/* 메인 천체 — 콘텐츠 중앙 상단에 위치, 위쪽 반원만 보임 */}
      <div style={{
        position: "absolute",
        top: -340,
        left: "50%",
        width: 900,
        height: 900,
        marginLeft: -450,
        transform: "perspective(1000px) rotateX(30deg)",
        transformOrigin: "50% 50%",
      }}>
        <svg width="900" height="900" viewBox="0 0 900 900" style={{ position:"absolute", inset:0 }}>
          {/* 동심원 — 바깥에서 안쪽으로 밀도 증가 */}
          <circle cx="450" cy="450" r="440" fill="none" stroke={`${S}0.04)`} strokeWidth="0.8" />
          <circle cx="450" cy="450" r="370" fill="none" stroke={`${S}0.06)`} strokeWidth="1" />
          <circle cx="450" cy="450" r="300" fill="none" stroke={`${S}0.04)`} strokeWidth="0.8" strokeDasharray="8 14" />
          <circle cx="450" cy="450" r="230" fill="none" stroke={`${S}0.07)`} strokeWidth="1" />
          <circle cx="450" cy="450" r="160" fill="none" stroke={`${S}0.05)`} strokeWidth="0.8" strokeDasharray="4 10" />
          <circle cx="450" cy="450" r="90" fill="none" stroke={`${S}0.08)`} strokeWidth="1" />

          {/* 경선 — 세로축 (시계의 12시/6시) */}
          <line x1="450" y1="10" x2="450" y2="890" stroke={`${S}0.025)`} strokeWidth="0.5" />
          {/* 위선 — 가로축 */}
          <line x1="10" y1="450" x2="890" y2="450" stroke={`${S}0.025)`} strokeWidth="0.5" />

          {/* 눈금 — 4방위 */}
          <line x1="450" y1="10" x2="450" y2="35" stroke={`${S}0.1)`} strokeWidth="1.5" />
          <line x1="890" y1="450" x2="865" y2="450" stroke={`${S}0.08)`} strokeWidth="1" />
          <line x1="10" y1="450" x2="35" y2="450" stroke={`${S}0.08)`} strokeWidth="1" />

          {/* 사선 눈금 — 8방위 보조선 */}
          <line x1="450" y1="450" x2="762" y2="138" stroke={`${S}0.015)`} strokeWidth="0.5" />
          <line x1="450" y1="450" x2="138" y2="138" stroke={`${S}0.015)`} strokeWidth="0.5" />
        </svg>
      </div>

      {/* 궤도 — 천체 중심 근처에서 공전 */}
      <Orbit cx="50%" cy="8%" r1={100} r2={160} s1={28} s2={44} />
    </>
  );
}

/* ══════════ WORK — 작업 페이지: 절제된 장식 ══════════ */
function Work() {
  return (
    <>
      {/* 우하단만 — 작은 삼각형 2개 */}
      <svg style={{ position:"absolute", bottom:-20, right:-30 }} width="200" height="173" viewBox="0 0 200 173">
        <polygon points="100,8 192,166 8,166" fill="none" stroke={`${S}0.06)`} strokeWidth="1" />
      </svg>
      <svg style={{ position:"absolute", bottom:10, right:10, transform:"rotate(180deg)" }} width="120" height="104" viewBox="0 0 120 104">
        <polygon points="60,5 116,99 4,99" fill="none" stroke={`${S}0.08)`} strokeWidth="1" />
      </svg>
      {/* 궤도 하나만 — 작게 */}
      <Orbit cx="85%" cy="78%" r1={45} r2={70} s1={30} s2={45} />
    </>
  );
}

/* ══════════ SETTINGS — 좌상단 원호 + 삼각 ══════════ */
function SettingsVariant() {
  return (
    <>
      {/* 좌상단 — 원호 */}
      <svg style={{ position:"absolute", top:-30, left:-30 }} width="200" height="200" viewBox="0 0 200 200">
        <circle cx="0" cy="0" r="160" fill="none" stroke={`${S}0.06)`} strokeWidth="1" />
        <circle cx="0" cy="0" r="120" fill="none" stroke={`${S}0.04)`} strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="0" cy="0" r="80" fill="none" stroke={`${S}0.03)`} strokeWidth="1" />
      </svg>
      {/* 좌상단 — 작은 삼각 */}
      <svg style={{ position:"absolute", top:80, left:60, transform:"rotate(-15deg)" }} width="100" height="87" viewBox="0 0 100 87">
        <polygon points="50,4 96,83 4,83" fill="none" stroke={`${S}0.07)`} strokeWidth="0.8" />
      </svg>
      <Orbit cx="12%" cy="20%" r1={50} r2={80} s1={26} s2={40} />
    </>
  );
}

/* ══════════ MINIMAL — 거의 없음 ══════════ */
function Minimal() {
  return (
    <>
      <svg style={{ position:"absolute", bottom:-10, right:-15 }} width="100" height="87" viewBox="0 0 100 87">
        <polygon points="50,4 96,83 4,83" fill="none" stroke={`${S}0.04)`} strokeWidth="0.8" />
      </svg>
    </>
  );
}

const VARIANTS: Record<Variant, React.FC> = {
  home: Home,
  work: Work,
  settings: SettingsVariant,
  minimal: Minimal,
};

export function GeoDecoration({ variant = "work" }: Props) {
  const Comp = VARIANTS[variant];
  return (
    <div className="geo-deco" aria-hidden="true">
      <Comp />
    </div>
  );
}
