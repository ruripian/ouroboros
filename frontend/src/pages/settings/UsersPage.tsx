import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, MailWarning, UserCheck, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function UsersPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin_users", filter],
    queryFn: () => adminApi.getUsers(filter === "all" ? undefined : { status: filter }),
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminApi.approveUser(userId),
    onSuccess: () => {
      toast.success(t("admin.users.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || t("admin.users.approveError"));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{t("admin.users.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.users.desc")}
        </p>
      </div>

      <div className="flex gap-2 border-b pb-4">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          {t("admin.users.tabPending")}
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("approved")}
        >
          {t("admin.users.tabApproved")}
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t("admin.users.tabAll")}
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 flex justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("admin.users.noUsers")}
          </div>
        ) : (
          users.map((u) => {
            // models.py 에 정의한 필드 (is_email_verified, is_approved)
            // (User 타입에 is_email_verified, is_approved 캐스팅 필요)
            const isEmailVerified = (u as any).is_email_verified;
            const isApproved = (u as any).is_approved;

            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                    {u.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {u.display_name}{" "}
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        ({u.last_name}{u.first_name})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    
                    <div className="flex gap-2 mt-1.5">
                      {isApproved ? (
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 gap-1 pl-1">
                          <UserCheck className="h-3 w-3" />
                          {t("users.statusApproved")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 pl-1">
                          <ShieldCheck className="h-3 w-3" />
                          {t("users.statusPending")}
                        </Badge>
                      )}

                      {!isEmailVerified && (
                        <Badge variant="outline" className="text-destructive border-destructive/30 gap-1 pl-1">
                          <MailWarning className="h-3 w-3" />
                          {t("users.statusUnverified")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {!isApproved && (
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(u.id)}
                    disabled={approveMutation.isPending || !isEmailVerified}
                  >
                    {approveMutation.isPending ? t("admin.users.approving") : t("admin.users.approveBtn")}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
