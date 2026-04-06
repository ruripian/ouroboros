/**
 * Analytics 뷰 — 프로젝트 이슈 통계 차트 대시보드
 */
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "@/api/issues";
import { StatsCharts } from "@/components/charts/StatsCharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  workspaceSlug: string;
  projectId: string;
}

export function AnalyticsView({ workspaceSlug, projectId }: Props) {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["issue-stats", workspaceSlug, projectId],
    queryFn: () => issuesApi.stats(workspaceSlug, projectId),
  });

  if (isLoading) {
    return (
      <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-5 sm:p-8 overflow-y-auto h-full">
      <StatsCharts stats={stats} t={t} />
    </div>
  );
}
