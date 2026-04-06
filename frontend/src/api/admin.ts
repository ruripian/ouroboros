import { api } from "@/lib/axios";
import type { User } from "@/types";

export const adminApi = {
  getUsers: (params?: { status?: "pending" | "approved" }) =>
    api.get<User[]>("/admin/users/", { params }).then((r) => r.data),

  approveUser: (userId: string) =>
    api.post<{ detail: string }>(`/admin/users/${userId}/approve/`).then((r) => r.data),
};
