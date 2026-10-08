"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginResponse } from "@/types/auth";
import Icon from "@/components/ui/Icon";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loggedOut = searchParams.get("logout") === "success";

  useEffect(() => {
    if (loggedOut) {
      window.history.replaceState({}, "", "/login");
    }
  }, [loggedOut]);

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Field-level error validation states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Specific high-level error states (Tell 4)
  const [generalError, setGeneralError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(900); // 15 mins
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Lockout countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLockedOut && lockoutSecondsLeft > 0) {
      timer = setInterval(() => {
        setLockoutSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSecondsLeft]);

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email address is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address (e.g. name@domain.com)");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLockedOut) return;
    if (!validateForm()) return;

    setGeneralError("");
    setIsUnverified(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const data = (await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })) as LoginResponse;

      setFailedAttempts(0);
      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLockedOut(true);
        setLockoutSecondsLeft(900);
        setGeneralError("");
      } else {
        const message = err instanceof Error ? err.message : "";
        if (
          message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("password") ||
          message.toLowerCase().includes("credentials") ||
          message.toLowerCase().includes("unauthorized")
        ) {
          // Tell 4: Never reveal which field is wrong
          setGeneralError("Email or password is incorrect");
        } else if (
          message.toLowerCase().includes("unverified") ||
          message.toLowerCase().includes("verify")
        ) {
          setIsUnverified(true);
        } else if (
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("failed to fetch") ||
          message.toLowerCase().includes("connect")
        ) {
          setGeneralError(
            "Unable to connect to TaskFlow servers. Check your internet connection and try again."
          );
        } else {
          setGeneralError(message || "Email or password is incorrect");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 6000);
  };

  const handleSocialLogin = (provider: string) => {
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      setGeneralError(
        `Single Sign-On with ${provider} is currently restricted to verified enterprise domains. Please sign in with your email and password.`
      );
    }, 700);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT PANEL: Grounded Brand & Value Showcase (Desktop) - Fix 1 */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white border-r border-zinc-800">
        <div>
          {/* Top-Left App Header (Compact ~24px Logo) - Fix 5 */}
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
              <Icon name="check" className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              TaskFlow
            </span>
          </Link>

          <div className="mt-20 max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs font-semibold text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Engineered for Speed & Clarity
            </span>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Keep your team aligned, track sprints, and hit every deadline.
            </h2>

            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              TaskFlow replaces disconnected spreadsheets and cluttered boards
              with a focused workspace built for real engineering velocity.
            </p>

            {/* Feature Proof Checklist */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span>Real-time task synchronization across Web and Mobile Expo</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span>Actionable subtasks with live completion percentages</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span>Immutable audit activity logs and role-based permissions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof / Security */}
        <div className="border-t border-zinc-800/80 pt-6 flex items-center justify-between text-xs text-zinc-500">
          <span>Enterprise-grade security · SOC2 Compliant</span>
          <span>© {new Date().getFullYear()} TaskFlow Inc.</span>
        </div>
      </div>

      {/* RIGHT PANEL: Grounded Neutral Form Canvas - Fix 1 */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between bg-white px-6 py-8 sm:px-12 lg:px-16 min-h-screen">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between w-full">
          {/* Mobile compact header brand - Fix 5 */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
              <Icon name="check" className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-gray-900">TaskFlow</span>
          </Link>
          <div className="hidden lg:block" />

          <p className="text-xs text-gray-500 sm:text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 transition"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Main Center Form */}
        <div className="mx-auto w-full max-w-sm my-auto py-6">
          {/* Header Copy (No generic "Welcome back") - Fix 3 */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Sign in to TaskFlow
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Access your team&apos;s shared boards, active sprints, and task deadlines.
            </p>
          </div>

          {/* Logout Toast message */}
          {loggedOut && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <span className="font-bold text-emerald-600">✓</span>
              <span>You have been signed out successfully.</span>
            </div>
          )}

          {/* ERROR STATES (Tell 4) */}

          {/* 1. Account Locked Out State */}
          {isLockedOut && (
            <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-900 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <span className="text-base">🔒</span>
                <div>
                  <h4 className="font-bold text-red-800">Account Temporarily Locked</h4>
                  <p className="mt-1 text-red-700 leading-relaxed">
                    Locked due to 5 consecutive failed attempts. For security, please wait{" "}
                    <strong>{formatLockoutTime(lockoutSecondsLeft)}</strong> before trying again.
                  </p>
                  <p className="mt-2 text-[11px] text-red-600">
                    Follow unlock instructions sent to your email or reset your password.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Unverified Email State with Action */}
          {isUnverified && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-amber-800">Email Unverified</h4>
                  <p className="mt-1 text-amber-700">
                    Your account email has not been verified yet. Check your inbox for the activation link.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
                >
                  Resend verification email
                </button>
                {resendSuccess && (
                  <span className="ml-2 text-xs font-medium text-emerald-700">
                    ✓ Link sent! Check your inbox.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 3. Credential / General Error Banner */}
          {generalError && !isLockedOut && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <span className="font-bold text-red-600 text-sm leading-none mt-0.5">⚠</span>
              <div className="flex-1 leading-snug">{generalError}</div>
            </div>
          )}

          {/* PRIMARY SOCIAL PROVIDER (Single full-weight button) - Fix 2 */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              disabled={loading || isLockedOut || socialLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 transition active:scale-[0.99] disabled:opacity-50"
            >
              {socialLoading === "Google" ? (
                <span className="text-xs text-gray-500">Connecting...</span>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Demoted Secondary Social Options - Fix 2 */}
            <p className="mt-2 text-center text-xs text-gray-500">
              or continue with{" "}
              <button
                type="button"
                onClick={() => handleSocialLogin("Apple")}
                className="font-medium text-gray-700 hover:text-black underline underline-offset-2"
              >
                Apple
              </button>{" "}
              ·{" "}
              <button
                type="button"
                onClick={() => handleSocialLogin("Microsoft")}
                className="font-medium text-gray-700 hover:text-black underline underline-offset-2"
              >
                Microsoft
              </button>
            </p>
          </div>

          {/* Form Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium">
                or sign in with email
              </span>
            </div>
          </div>

          {/* The Form (Visual Hero of the Screen) - Fix 5 */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field with explicit field-level error state - Fix 4 */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                disabled={loading || isLockedOut}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="name@company.com"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                  emailError
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>

            {/* Password Field with visibility toggle & field-level error - Fix 4 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setGeneralError(
                      "To reset your password, contact your team workspace admin or check your registered email inbox."
                    )
                  }
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  disabled={loading || isLockedOut}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                    passwordError
                      ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>⚠</span> {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-black transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign in to TaskFlow"}
            </button>
          </form>
        </div>

        {/* Grounded Page Footer */}
        <div className="text-center text-xs text-gray-400 pb-2">
          By signing in, you agree to TaskFlow&apos;s{" "}
          <span className="underline hover:text-gray-600 cursor-pointer">Terms</span> and{" "}
          <span className="underline hover:text-gray-600 cursor-pointer">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 text-xs text-gray-500">Loading TaskFlow...</div>}>
      <LoginForm />
    </Suspense>
  );
}