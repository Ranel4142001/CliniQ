"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { notify } from "@/shared/lib/notify";
import { apiClient } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      await apiClient.post("/api/auth/login", values);
      notify.success("Welcome back!");
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      notify.error(msg);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to CliniQ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="font-medium text-primary hover:underline"
        >
          Create account
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground shadow-2xs">
        <p className="font-semibold text-foreground mb-2 flex items-center justify-between">
          <span>Quick Sign-In for Testing:</span>
          <span className="text-[10px] font-normal text-muted-foreground">1-click fill</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] justify-start px-2.5 font-medium gap-1.5 hover:bg-muted/60"
            onClick={() => {
              setValue("email", "admin@cliniq.local");
              setValue("password", "Admin@CliniQ2025!");
            }}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
            <span className="truncate">Admin Portal</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] justify-start px-2.5 font-medium gap-1.5 hover:bg-muted/60"
            onClick={() => {
              setValue("email", "dr.cruz@cliniq.local");
              setValue("password", "Doctor@2026!");
            }}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <span className="truncate">Doctor / Clinician</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] justify-start px-2.5 font-medium gap-1.5 hover:bg-muted/60"
            onClick={() => {
              setValue("email", "staff.ana@cliniq.local");
              setValue("password", "Staff@2026!");
            }}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">Clinic Staff</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] justify-start px-2.5 font-medium gap-1.5 hover:bg-muted/60"
            onClick={() => {
              setValue("email", "juan.delacruz@example.com");
              setValue("password", "Patient@2026!");
            }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Patient Account</span>
          </Button>
        </div>
      </div>
    </>
  );
}
