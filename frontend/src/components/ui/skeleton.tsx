import { cn } from "@/lib/utils";

/**
 * Skeleton — 로딩 상태 플레이스홀더
 * shimmer 애니메이션으로 콘텐츠 로딩 중임을 시각적으로 표현
 *
 * 사용법:
 *   <Skeleton className="h-4 w-32" />           // 텍스트 줄
 *   <Skeleton className="h-10 w-full" />         // 입력 필드
 *   <Skeleton className="h-32 w-full rounded-xl" /> // 카드
 *   <Skeleton variant="circle" className="h-8 w-8" /> // 아바타
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circle";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        variant === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
      {...props}
    />
  );
}

/**
 * 테이�� 로딩 스켈레톤 — TableView 전용
 * rows: 표시할 행 수 (기본 8)
 * cols: 표시할 컬럼 수 (기본 5)
 */
export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === 0 ? "w-16" : i === 1 ? "flex-1" : "w-20")}
          />
        ))}
      </div>
      {/* 행 */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-3 px-4 py-3">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className={cn("h-4", col === 0 ? "w-16" : col === 1 ? "flex-1" : "w-20")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 보드 로딩 스켈레톤 — BoardView 전용
 * columns: 컬럼 수 (기본 4)
 * cardsPerColumn: 컬럼당 카드 수 (기본 3)
 */
export function BoardSkeleton({ columns = 4, cardsPerColumn = 3 }: { columns?: number; cardsPerColumn?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Array.from({ length: columns }).map((_, col) => (
        <div key={col} className="min-w-[250px] flex-1 space-y-3">
          {/* 컬럼 헤더 */}
          <div className="flex items-center gap-2 px-2">
            <Skeleton variant="circle" className="h-3 w-3" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-6" />
          </div>
          {/* 카드 */}
          {Array.from({ length: cardsPerColumn }).map((_, card) => (
            <div key={card} className="rounded-lg border border-border p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton variant="circle" className="h-5 w-5" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 대시보드 로딩 스켈레톤
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* 인사 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      {/* 카드 */}
      <Skeleton className="h-40 w-full rounded-2xl" />
      {/* ��슈 목록 */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-32 mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
