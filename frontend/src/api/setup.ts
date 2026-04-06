import { api } from "@/lib/axios";
import type { User } from "@/types";

export interface SetupStatusResponse {
  is_complete: boolean;
}

export interface SetupPayload {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  password: string;
  timezone: string;
}

export interface SetupResponse {
  detail: string;
  access: string;
  refresh: string;
  user: User;
}

export const setupApi = {
  /** 서버 초기 설정 완료 여부 조회 */
  getStatus: () =>
    api.get<SetupStatusResponse>("/setup/status/").then((r) => r.data),

  /** 슈퍼어드민 + 초기 워크스페이스 생성 — JWT 토큰 포함 응답 */
  initialize: (payload: SetupPayload) =>
    api.post<SetupResponse>("/setup/", payload).then((r) => r.data),
};
