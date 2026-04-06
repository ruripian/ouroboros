import { api } from "@/lib/axios";
import type { Project, ProjectMember, Module, Cycle, State, ProjectEvent, PaginatedResponse } from "@/types";

export const projectsApi = {
  list: (workspaceSlug: string) =>
    api.get<PaginatedResponse<Project>>(`/workspaces/${workspaceSlug}/projects/`).then((r) => r.data.results),

  create: (workspaceSlug: string, data: Partial<Project> & { member_ids?: string[] }) =>
    api.post<Project>(`/workspaces/${workspaceSlug}/projects/`, data).then((r) => r.data),

  get: (workspaceSlug: string, projectId: string) =>
    api.get<Project>(`/workspaces/${workspaceSlug}/projects/${projectId}/`).then((r) => r.data),

  update: (workspaceSlug: string, projectId: string, data: Partial<Project>) =>
    api.patch<Project>(`/workspaces/${workspaceSlug}/projects/${projectId}/`, data).then((r) => r.data),

  /** 식별자 중복 검사 — exclude: 수정 시 현재 프로젝트 ID 제외 */
  checkIdentifier: (workspaceSlug: string, identifier: string, exclude?: string) =>
    api.get<{ available: boolean; identifier: string }>(
      `/workspaces/${workspaceSlug}/projects/check-identifier/`,
      { params: { identifier, ...(exclude ? { exclude } : {}) } },
    ).then((r) => r.data),

  delete: (workspaceSlug: string, projectId: string) =>
    api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/`),

  archive: (workspaceSlug: string, projectId: string) =>
    api.post<Project>(`/workspaces/${workspaceSlug}/projects/${projectId}/archive/`).then((r) => r.data),

  unarchive: (workspaceSlug: string, projectId: string) =>
    api.delete<Project>(`/workspaces/${workspaceSlug}/projects/${projectId}/archive/`).then((r) => r.data),

  discover: (workspaceSlug: string) =>
    api.get<PaginatedResponse<Project>>(`/workspaces/${workspaceSlug}/projects/discover/`).then((r) => r.data.results),

  join: (workspaceSlug: string, projectId: string) =>
    api.post<ProjectMember>(`/workspaces/${workspaceSlug}/projects/${projectId}/join/`).then((r) => r.data),

  leave: (workspaceSlug: string, projectId: string) =>
    api.post(`/workspaces/${workspaceSlug}/projects/${projectId}/leave/`),

  // 프로젝트 멤버
  members: {
    list: (workspaceSlug: string, projectId: string) =>
      api.get<PaginatedResponse<ProjectMember>>(`/workspaces/${workspaceSlug}/projects/${projectId}/members/`).then((r) => r.data.results),

    add: (workspaceSlug: string, projectId: string, data: { member_id: string; role?: number }) =>
      api.post<ProjectMember>(`/workspaces/${workspaceSlug}/projects/${projectId}/members/`, data).then((r) => r.data),

    updateRole: (workspaceSlug: string, projectId: string, memberId: string, data: { role: number }) =>
      api.patch<ProjectMember>(`/workspaces/${workspaceSlug}/projects/${projectId}/members/${memberId}/`, data).then((r) => r.data),

    remove: (workspaceSlug: string, projectId: string, memberId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/members/${memberId}/`),
  },

  // 모듈
  modules: {
    list: (workspaceSlug: string, projectId: string) =>
      api.get<PaginatedResponse<Module>>(`/workspaces/${workspaceSlug}/projects/${projectId}/modules/`).then((r) => r.data.results),

    create: (workspaceSlug: string, projectId: string, data: Partial<Module>) =>
      api.post<Module>(`/workspaces/${workspaceSlug}/projects/${projectId}/modules/`, data).then((r) => r.data),

    get: (workspaceSlug: string, projectId: string, moduleId: string) =>
      api.get<Module>(`/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/`).then((r) => r.data),

    update: (workspaceSlug: string, projectId: string, moduleId: string, data: Partial<Module>) =>
      api.patch<Module>(`/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/`, data).then((r) => r.data),

    delete: (workspaceSlug: string, projectId: string, moduleId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/`),
  },

  // 상태
  states: {
    list: (workspaceSlug: string, projectId: string) =>
      api.get<PaginatedResponse<State>>(`/workspaces/${workspaceSlug}/projects/${projectId}/states/`).then((r) => r.data.results),

    create: (workspaceSlug: string, projectId: string, data: Partial<State>) =>
      api.post<State>(`/workspaces/${workspaceSlug}/projects/${projectId}/states/`, data).then((r) => r.data),

    update: (workspaceSlug: string, projectId: string, stateId: string, data: Partial<State>) =>
      api.patch<State>(`/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/`, data).then((r) => r.data),

    delete: (workspaceSlug: string, projectId: string, stateId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/`),
  },

  cycles: {
    list: (workspaceSlug: string, projectId: string) =>
      api.get<PaginatedResponse<Cycle>>(`/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`).then((r) => r.data.results),

    create: (workspaceSlug: string, projectId: string, data: Partial<Cycle>) =>
      api.post<Cycle>(`/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`, data).then((r) => r.data),

    get: (workspaceSlug: string, projectId: string, cycleId: string) =>
      api.get<Cycle>(`/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/`).then((r) => r.data),

    update: (workspaceSlug: string, projectId: string, cycleId: string, data: Partial<Cycle>) =>
      api.patch<Cycle>(`/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/`, data).then((r) => r.data),

    delete: (workspaceSlug: string, projectId: string, cycleId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/`),
  },

  // 캘린더 이벤트 (프로젝트 멤버 공유)
  events: {
    list: (workspaceSlug: string, projectId: string, params?: { from?: string; to?: string }) =>
      api.get<PaginatedResponse<ProjectEvent>>(`/workspaces/${workspaceSlug}/projects/${projectId}/events/`, { params }).then((r) => r.data.results),

    create: (workspaceSlug: string, projectId: string, data: Partial<ProjectEvent>) =>
      api.post<ProjectEvent>(`/workspaces/${workspaceSlug}/projects/${projectId}/events/`, data).then((r) => r.data),

    update: (workspaceSlug: string, projectId: string, eventId: string, data: Partial<ProjectEvent>) =>
      api.patch<ProjectEvent>(`/workspaces/${workspaceSlug}/projects/${projectId}/events/${eventId}/`, data).then((r) => r.data),

    delete: (workspaceSlug: string, projectId: string, eventId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/events/${eventId}/`),
  },
};
