import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { issuesApi } from "@/api/issues";
import type { Issue } from "@/types";

/**
 * useParentChain — 이슈의 상위 조상 체인을 순차 fetch하여 반환
 *
 * 반환 배열 순서: [root, ..., grandparent, parent]
 * - 현재 이슈는 포함하지 않음
 * - parent가 없으면 빈 배열
 *
 * React Query 캐시(`["issue", id]`)를 재사용하므로, 이미 방문한 부모는 즉시 반환됨
 *
 * 사용:
 *   const chain = useParentChain(workspaceSlug, projectId, issue.parent);
 */
export function useParentChain(
  workspaceSlug: string | undefined,
  projectId: string | undefined,
  startParentId: string | null | undefined,
): Issue[] {
  const qc = useQueryClient();
  const [chain, setChain] = useState<Issue[]>([]);

  useEffect(() => {
    if (!workspaceSlug || !projectId || !startParentId) {
      setChain([]);
      return;
    }

    let cancelled = false;
    const visited = new Set<string>(); // 순환 참조 방어
    const result: Issue[] = [];

    (async () => {
      let pid: string | null = startParentId;
      while (pid && !visited.has(pid)) {
        visited.add(pid);
        try {
          const parent: Issue = await qc.fetchQuery({
            queryKey: ["issue", pid],
            queryFn:  () => issuesApi.get(workspaceSlug, projectId, pid!),
          });
          if (cancelled) return;
          result.unshift(parent);
          pid = parent.parent;
        } catch {
          break;
        }
      }
      if (!cancelled) setChain(result);
    })();

    return () => { cancelled = true; };
  }, [workspaceSlug, projectId, startParentId, qc]);

  return chain;
}
