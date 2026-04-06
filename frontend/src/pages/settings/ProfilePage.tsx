import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "@/api/settings";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // ── 프로필 폼 스키마 (t() 사용을 위해 컴포넌트 내부에 정의) ──
  const profileSchema = z.object({
    display_name: z.string().min(1, t("settings.profile.displayNameRequired")),
    first_name: z.string().max(50).optional(),
    last_name: z.string().max(50).optional(),
  });
  type ProfileForm = z.infer<typeof profileSchema>;

  // ── 프로필 수정 ───────────────────────────────────────
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => settingsApi.updateProfile(data),
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success(t("common.profileSaved"));
    },
    onError: () => toast.error(t("common.profileSaveFailed")),
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold">{t("settings.profile.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("settings.profile.subtitle")}
        </p>
      </div>

      {/* ── 프로필 섹션 ── */}
      <form
        onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">{t("settings.profile.firstName")}</Label>
            <Input id="first_name" {...profileForm.register("first_name")} placeholder={t("settings.profile.firstNamePlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">{t("settings.profile.lastName")}</Label>
            <Input id="last_name" {...profileForm.register("last_name")} placeholder={t("settings.profile.lastNamePlaceholder")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="display_name">{t("settings.profile.displayName")}</Label>
          <Input
            id="display_name"
            {...profileForm.register("display_name")}
            placeholder={t("settings.profile.displayNameHint")}
          />
          {profileForm.formState.errors.display_name && (
            <p className="text-xs text-destructive">
              {profileForm.formState.errors.display_name.message}
            </p>
          )}
        </div>

        <Button type="submit" size="sm" disabled={profileMutation.isPending}>
          {profileMutation.isPending ? t("settings.profile.saving") : t("settings.profile.save")}
        </Button>
      </form>

      {/* ── 구분선 ── */}
      <hr className="border-border" />

      {/* ── 이메일 (읽기 전용) ── */}
      <div className="space-y-1.5">
        <Label>{t("settings.profile.emailTitle")}</Label>
        <Input
          type="email"
          value={user?.email ?? ""}
          readOnly
          className="bg-muted/40 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">{t("settings.profile.emailReadOnly")}</p>
      </div>
    </div>
  );
}
