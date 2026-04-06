import { useForm } from "react-hook-form";
import { useTranslation, getI18n } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


import { settingsApi } from "@/api/settings";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/lib/theme-provider";
import { useMotion, type MotionMode } from "@/lib/motion-provider";
import { TIMEZONES } from "@/lib/timezones";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  theme:             z.enum(["light", "dark"]),
  language:          z.enum(["ko", "en"]),
  timezone:          z.string().min(1),
  first_day_of_week: z.number().int().min(0).max(1),
});
type FormValues = z.infer<typeof schema>;

export function PreferencesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { setTheme } = useTheme();
  const { mode: motionMode, setMode: setMotionMode } = useMotion();

  // 옵션 목록 (t() 사용을 위해 컴포넌트 내부에 정의)
  const THEME_OPTIONS = [
    { value: "light",  label: t("settings.preferences.themeLight") },
    { value: "dark",   label: t("settings.preferences.themeDark") },
  ] as const;

  const LANGUAGE_OPTIONS = [
    { value: "ko", label: t("settings.preferences.langKo") },
    { value: "en", label: t("settings.preferences.langEn") },
  ];

  const DOW_OPTIONS = [
    { value: 0, label: t("settings.preferences.sunday") },
    { value: 1, label: t("settings.preferences.monday") },
  ];

  const { handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      theme:             ((user?.theme === "system" ? "dark" : user?.theme) ?? "dark") as FormValues["theme"],
      language:          (user?.language ?? "ko") as FormValues["language"],
      timezone:          user?.timezone ?? "Asia/Seoul",
      first_day_of_week: user?.first_day_of_week ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => settingsApi.updatePreferences(data),
    onSuccess: (updated) => {
      updateUser(updated);
      /* 언어 변경을 i18n에 즉시 반영 */
      if (updated.language) getI18n().changeLanguage(updated.language);
      toast.success(t("settings.preferences.saved"));
    },
    onError: () => toast.error(t("settings.preferences.saveFailed")),
  });

  // watch로 현재 값 추적 (Select에 value 바인딩 필요)
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">{t("settings.preferences.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("settings.preferences.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">

        {/* 테마 토글 */}
        <div className="flex items-center gap-6">
          <Label>{t("settings.preferences.theme")}</Label>
          <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            {THEME_OPTIONS.map((o) => {
              const active = values.theme === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    const themeVal = o.value as FormValues["theme"];
                    setValue("theme", themeVal);
                    setTheme(themeVal);
                  }}
                  className={cn(
                    "rounded-md px-5 py-1.5 text-xs font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 애니메이션 모드 */}
        <div className="flex items-center gap-6">
          <Label>{t("settings.preferences.motionMode")}</Label>
          <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            {([
              { value: "rich",    label: t("settings.preferences.motionRich") },
              { value: "minimal", label: t("settings.preferences.motionMinimal") },
            ] as const).map((o) => {
              const active = motionMode === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setMotionMode(o.value as MotionMode)}
                  className={cn(
                    "rounded-md px-5 py-1.5 text-xs font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 언어 */}
        <div className="space-y-1.5">
          <Label>{t("settings.preferences.language")}</Label>
          <Select
            value={values.language}
            onValueChange={(v) => setValue("language", v as FormValues["language"])}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 시간대 */}
        <div className="space-y-1.5">
          <Label>{t("settings.preferences.timezone")}</Label>
          <Select
            value={values.timezone}
            onValueChange={(v) => setValue("timezone", v)}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 주의 시작 요일 */}
        <div className="space-y-1.5">
          <Label>{t("settings.preferences.firstDayOfWeek")}</Label>
          <Select
            value={String(values.first_day_of_week)}
            onValueChange={(v) => setValue("first_day_of_week", Number(v))}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOW_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? t("settings.preferences.saving") : t("settings.preferences.save")}
        </Button>
      </form>
    </div>
  );
}
