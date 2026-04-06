/**
 * 재사용 가능한 모션 컴포넌트 모음
 *
 * 모든 컴포넌트는 useMotion()의 모드에 따라 자동으로
 * rich/minimal 애니메이션을 전환합니다.
 */

import { type ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useMotion } from "@/lib/motion-provider";

/* ──────────────── 페이지 전환 래퍼 ──────────────── */

/** 페이지 진입 시 fade + slight slide-up */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const { isRich, fade } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: fade.duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── 뷰 탭 전환 (crossfade) ──────────────── */

/** key가 바뀔 때 crossfade 전환 */
export function ViewTransition({ viewKey, children, className }: { viewKey: string; children: ReactNode; className?: string }) {
  const { isRich } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        className={className}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ──────────────── 리스트 아이템 (stagger 진입) ──────────────── */

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

/** stagger 리스트 컨테이너 */
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  const { isRich, staggerDelay } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** stagger 리스트의 개별 아이템 */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const { isRich, spring } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={listItemVariants}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── 호버 리프트 (카드용) ──────────────── */

/** 호버 시 살짝 떠오르는 효과 (shadow + scale) */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  const { isRich } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── 버튼 바운스 ──────────────── */

/** 클릭 시 bounce 피드백 */
export function BounceTap({ children, className }: { children: ReactNode; className?: string }) {
  const { isRich } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── 슬라이드 인/아웃 (패널, 드롭다운) ──────────────── */

export function SlideIn({ children, className, direction = "right" }: { children: ReactNode; className?: string; direction?: "left" | "right" | "up" | "down" }) {
  const { isRich, spring } = useMotion();

  const offset = { left: { x: -20 }, right: { x: 20 }, up: { y: -20 }, down: { y: 20 } };

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offset[direction] }}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── 펄스 (알림 벨 등) ──────────────── */

export function PulseOnUpdate({ children, className, trigger }: { children: ReactNode; className?: string; trigger: unknown }) {
  const { isRich } = useMotion();

  if (!isRich) return <div className={className}>{children}</div>;

  return (
    <motion.div
      key={String(trigger)}
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
