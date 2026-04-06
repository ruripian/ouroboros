import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, AuthCardHeader } from "@/components/auth/AuthCard";

/* 비밀번호 복잡도: 8자 이상 + 영문 + 숫자 + 특수문자 */
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

const schema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  display_name: z.string().min(1, "Display name is required"),
  password: z.string().regex(PASSWORD_RE),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  path: ["confirm_password"],
  message: "passwordMismatch",
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // 초대 토큰 + 이메일 고정 (초대 링크에서 넘어온 경우)
  const inviteToken = searchParams.get("invite");
  const inviteEmail = searchParams.get("email");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: inviteEmail || "",
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data: any) => {
      /* 초대 토큰으로 가입 → 자동 활성화됨, 바로 로그인 가능 */
      if (data.auto_activated) {
        toast.success(t("auth.register.successAutoActivated"));
        navigate(`/auth/login?redirect=/invite/${inviteToken}`);
        return;
      }
      if (data.email_verification_required) {
        toast.success(t("auth.register.successWithEmail"));
      } else {
        toast.success(t("auth.register.successNoEmail"));
      }
      // 초대 토큰이 있으면 로그인 후 초대 수락 페이지로 리다이렉트
      if (inviteToken) {
        navigate(`/auth/login?redirect=/invite/${inviteToken}`);
      } else {
        navigate("/auth/login");
      }
    },
    onError: () => {
      toast.error(t("auth.register.error"));
    },
  });

  return (
    <AuthCard className="">
      <AuthCardHeader subtitle={t("auth.register.subtitle")} />

      {inviteToken && inviteEmail && (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">
            {t("invite.registerHint", { email: inviteEmail })}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(({ confirm_password: _cp, ...d }) =>
          /* 초대 토큰이 있으면 백엔드가 자동 활성화 처리 (관리자 승인 우회) */
          mutation.mutate(inviteToken ? { ...d, invite_token: inviteToken } : d)
        )}
        className="space-y-4"
      >
        <div className="flex gap-4">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("auth.register.lastName")}
            </Label>
            <Input
              placeholder={t("auth.register.lastNamePlaceholder")}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive">{errors.last_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("auth.register.firstName")}
            </Label>
            <Input
              placeholder={t("auth.register.firstNamePlaceholder")}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-xs text-destructive">{errors.first_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("auth.register.displayName")}
          </Label>
          <Input
            placeholder={t("auth.register.namePlaceholder")}
            {...register("display_name")}
          />
          {errors.display_name && (
            <p className="text-xs text-destructive">{errors.display_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("auth.register.email")}
          </Label>
          <Input
            type="email"
            placeholder={t("auth.register.emailPlaceholder")}
            {...register("email")}
            readOnly={!!inviteEmail}
            className={inviteEmail ? "bg-muted cursor-not-allowed" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("auth.register.password")}
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.register.passwordPlaceholder")}
              {...register("password")}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-2xs text-muted-foreground/70">{t("auth.register.passwordRule")}</p>
          {errors.password && (
            <p className="text-xs text-destructive">{t("auth.register.passwordRuleError")}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">
            {t("auth.register.confirmPassword")}
          </Label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder={t("auth.register.confirmPasswordPlaceholder")}
              {...register("confirm_password")}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-destructive">{t("auth.register.passwordMismatch")}</p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-xs text-destructive">{t("auth.register.error")}</p>
        )}

        <Button type="submit" className="w-full font-semibold tracking-widest" disabled={mutation.isPending}>
          {mutation.isPending ? t("auth.register.submitting") : t("auth.register.submit")}
        </Button>
      </form>

      <p className="mt-7 text-center text-xs text-muted-foreground">
        {t("auth.register.haveAccount")}{" "}
        <Link to="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          {t("auth.register.signInLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
