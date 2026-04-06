import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace, Project } from "@/types";

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  /** 즐겨찾기 프로젝트 ID 집합 (워크스페이스별 키: slug → Set<projectId>) */
  favorites: Record<string, string[]>;
  /** 프로젝트 순서 (워크스페이스별 키: slug → projectId[]) */
  projectOrder: Record<string, string[]>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentProject: (project: Project | null) => void;
  toggleFavorite: (slug: string, projectId: string) => void;
  setProjectOrder: (slug: string, order: string[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      currentProject: null,
      favorites: {},
      projectOrder: {},
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace, currentProject: null }),
      setCurrentProject: (project) => set({ currentProject: project }),
      toggleFavorite: (slug, projectId) =>
        set((state) => {
          const list = state.favorites[slug] ?? [];
          const next = list.includes(projectId)
            ? list.filter((id) => id !== projectId)
            : [...list, projectId];
          return { favorites: { ...state.favorites, [slug]: next } };
        }),
      setProjectOrder: (slug, order) =>
        set((state) => ({ projectOrder: { ...state.projectOrder, [slug]: order } })),
    }),
    { name: "workspace-storage" }
  )
);
