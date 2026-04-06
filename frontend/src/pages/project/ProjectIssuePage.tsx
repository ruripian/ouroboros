/**
 * 프로젝트 이슈 페이지 — 4가지 뷰를 하나의 페이지에서 전환
 *
 * URL 파라미터:
 *   ?view=table|board|calendar|timeline  — 현재 뷰 (기본: table)
 *   ?issue=<uuid>                         — 이슈 상세 패널 열기
 */

import { useCallback, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { List, LayoutGrid, Calendar, GanttChart, Zap, ChevronDown, CheckCircle2, Circle, BarChart3 } from "lucide-react";
import { issuesApi } from "@/api/issues";
import { projectsApi } from "@/api/projects";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IssueCreateDialog } from "@/components/issues/IssueCreateDialog";
import { IssueDetailPanel } from "./IssueDetailPanel";
import { TableView }    from "./views/TableView";
import { BoardView }    from "./views/BoardView";
import { CalendarView } from "./views/CalendarView";
import { TimelineView } from "./views/TimelineView";
import { CycleView }      from "./views/CycleView";
import { AnalyticsView }  from "./views/AnalyticsView";
import { TrashView }      from "./views/TrashView";
import { useViewSettings } from "@/hooks/useViewSettings";
import { ViewTransition } from "@/components/motion";
import type { Cycle } from "@/types";

type ViewId = "table" | "board" | "calendar" | "timeline" | "cycles" | "analytics" | "trash";

const VIEW_IDS: { id: ViewId; key: string; Icon: React.ElementType }[] = [
  { id: "table",     key: "views.tabs.table",     Icon: List        },
  { id: "board",     key: "views.tabs.board",      Icon: LayoutGrid  },
  { id: "calendar",  key: "views.tabs.calendar",   Icon: Calendar    },
  { id: "timeline",  key: "views.tabs.timeline",   Icon: GanttChart  },
  { id: "cycles",    key: "views.tabs.cycles",     Icon: Zap   },
  { id: "analytics", key: "views.tabs.analytics",  Icon: BarChart3   },
];

export function ProjectIssuePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceSlug, projectId, moduleId, cycleId } = useParams<{
    workspaceSlug: string;
    projectId:     string;
    moduleId?:     string;
    cycleId?:      string;
  }>();

  /* 모듈/사이클 컨텍스트 — 하위 뷰에 필터로 전달 */
  const issueFilter = {
    ...(moduleId ? { module: moduleId } : {}),
    ...(cycleId  ? { cycle: cycleId }   : {}),
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, updateCalendar, updateTimeline } = useViewSettings();

  const currentView   = (searchParams.get("view") as ViewId | null) ?? "table";
  const selectedIssue = searchParams.get("issue");

  const [createOpen, setCreateOpen] = useState(false);

  /* 이슈 목록 페이지용 state 데이터 (CreateDialog에 필요) */
  const { data: states = [] } = useQuery({
    queryKey: ["states", projectId],
    queryFn:  () => projectsApi.states.list(workspaceSlug!, projectId!),
  });

  /* 사이클 목록 — 사이클 셀렉터용 */
  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles", workspaceSlug, projectId],
    queryFn:  () => projectsApi.cycles.list(workspaceSlug!, projectId!),
  });

  /* 현재 선택된 사이클 객체 */
  const activeCycle = cycleId ? cycles.find((c: Cycle) => c.id === cycleId) : null;

  /* 사이클 이슈 통계 — 사이클 선택 시에만 fetch */
  const { data: cycleIssues = [] } = useQuery({
    queryKey: ["issues", workspaceSlug, projectId, { cycle: cycleId }],
    queryFn:  () => issuesApi.list(workspaceSlug!, projectId!, { cycle: cycleId! }),
    enabled:  !!cycleId,
  });

  /* 사이클 선택 시 URL 라우팅 */
  const selectCycle = useCallback((id: string | null) => {
    const base = `/${workspaceSlug}/projects/${projectId}`;
    const viewParam = currentView !== "table" ? `?view=${currentView}` : "";
    if (id) {
      navigate(`${base}/cycles/${id}/issues${viewParam}`);
    } else {
      /* moduleId가 있으면 모듈 컨텍스트 유지 */
      if (moduleId) {
        navigate(`${base}/modules/${moduleId}/issues${viewParam}`);
      } else {
        navigate(`${base}/issues${viewParam}`);
      }
    }
  }, [workspaceSlug, projectId, moduleId, currentView, navigate]);

  /* 뷰 전환 */
  const setView = useCallback((v: ViewId) => {
    setSearchParams((p) => { p.set("view", v); p.delete("issue"); return p; });
  }, [setSearchParams]);

  /* 이슈 패널 열기 */
  const openIssue = useCallback((issueId: string) => {
    setSearchParams((p) => { p.set("issue", issueId); return p; });
  }, [setSearchParams]);

  /* 이슈 패널 닫기 */
  const closeIssue = useCallback(() => {
    setSearchParams((p) => { p.delete("issue"); return p; });
  }, [setSearchParams]);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {currentView !== "trash" && (
      <div className="flex items-center gap-2 px-3 sm:px-5 py-1.5 border-b border-border shrink-0 overflow-x-auto">
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border shrink-0">
          {VIEW_IDS.map(({ id, key, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap",
                currentView === id
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(key)}</span>
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150",
                cycleId
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:bg-muted/40"
              )}
            >
              <Zap className="h-3 w-3" />
              {activeCycle ? activeCycle.name : t("views.cycleFilter.label")}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem
              className={cn("text-xs", !cycleId && "bg-muted/60")}
              onClick={() => selectCycle(null)}
            >
              {t("views.cycleFilter.all")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {cycles.length === 0 ? (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {t("cycles.empty")}
              </DropdownMenuItem>
            ) : (
              cycles.map((cycle: Cycle) => (
                <DropdownMenuItem
                  key={cycle.id}
                  className={cn("text-xs flex items-center gap-2", cycleId === cycle.id && "bg-muted/60")}
                  onClick={() => selectCycle(cycle.id)}
                >
                  <span className="flex-1 truncate">{cycle.name}</span>
                  <span className="text-2xs text-muted-foreground shrink-0">
                    {t("cycles.issueCount", { count: cycle.issue_count })}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-primary"
              onClick={() => navigate(`/${workspaceSlug}/projects/${projectId}/cycles`)}
            >
              {t("views.cycleFilter.manage")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

      </div>
      )}

      {activeCycle && cycleIssues.length > 0 && (() => {
        const total = cycleIssues.length;
        const completed = cycleIssues.filter((i: { state_detail?: { group?: string } }) =>
          i.state_detail?.group === "completed"
        ).length;
        const cancelled = cycleIssues.filter((i: { state_detail?: { group?: string } }) =>
          i.state_detail?.group === "cancelled"
        ).length;
        const inProgress = cycleIssues.filter((i: { state_detail?: { group?: string } }) =>
          i.state_detail?.group === "started"
        ).length;
        const pct = Math.round((completed / total) * 100);

        /* 사이클 기간 계산 */
        const startDate = new Date(activeCycle.start_date);
        const endDate = new Date(activeCycle.end_date);
        const now = new Date();
        const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
        const elapsed = Math.max(0, Math.min(totalDays, Math.ceil((now.getTime() - startDate.getTime()) / 86400000)));
        const daysLeft = Math.max(0, totalDays - elapsed);

        return (
          <div className="px-5 py-1.5 border-b border-border bg-muted/10 shrink-0 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-semibold">{activeCycle.name}</span>
            </div>
            <span className="text-muted-foreground shrink-0 hidden lg:inline">
              {startDate.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              {" ~ "}
              {endDate.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
            </span>

            <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden min-w-[60px]">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <span className="text-muted-foreground shrink-0 font-medium">{pct}%</span>
            <span className="flex items-center gap-1 text-green-600 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              {completed}
            </span>
            <span className="flex items-center gap-1 text-blue-600 shrink-0">
              <Circle className="h-3 w-3" />
              {inProgress}
            </span>
            {cancelled > 0 && (
              <span className="text-muted-foreground shrink-0 hidden xl:inline">
                {t("cycles.burndown.cancelled", { count: cancelled })}
              </span>
            )}
            <span className="text-muted-foreground shrink-0">
              {t("cycles.burndown.daysLeft", { count: daysLeft })}
            </span>
          </div>
        );
      })()}

      <ViewTransition viewKey={currentView} className="flex-1 overflow-hidden">
        {currentView === "table" && (
          <TableView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
            onIssueClick={openIssue}
            issueFilter={issueFilter}
          />
        )}

        {currentView === "board" && (
          <BoardView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
            onIssueClick={openIssue}
            issueFilter={issueFilter}
          />
        )}

        {currentView === "calendar" && (
          <CalendarView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
            onIssueClick={openIssue}
            issueFilter={issueFilter}
            settings={settings.calendar}
            onSettingsChange={updateCalendar}
          />
        )}

        {currentView === "timeline" && (
          <TimelineView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
            onIssueClick={openIssue}
            issueFilter={issueFilter}
            settings={settings.timeline}
            onSettingsChange={updateTimeline}
          />
        )}

        {currentView === "cycles" && (
          <CycleView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
            onIssueClick={openIssue}
          />
        )}

        {currentView === "analytics" && (
          <AnalyticsView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
          />
        )}
        {currentView === "trash" && (
          <TrashView
            workspaceSlug={workspaceSlug!}
            projectId={projectId!}
          />
        )}
      </ViewTransition>

      {selectedIssue && (
        <IssueDetailPanel issueId={selectedIssue} onClose={closeIssue} />
      )}

      <IssueCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        states={states}
        defaultStateId={states.find((s) => s.group === "unstarted")?.id ?? states.find((s) => s.default)?.id ?? states[0]?.id}
        workspaceSlug={workspaceSlug!}
        projectId={projectId!}
        defaultModuleId={moduleId}
        defaultCycleId={cycleId}
      />
    </div>
  );
}
