"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { apiRequest } from "@/lib/api";
import type { RegisterResponse } from "@/types/auth";
import Icon from "@/components/ui/Icon";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Field-level error validation states (Tell 4)
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    setUsernameError("");
    setEmailError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
      valid = false;
    } else if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      valid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      setUsernameError("Username can only contain letters, numbers, hyphens, and underscores");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address (e.g. name@domain.com)");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setGeneralError("");
    setLoading(true);

    try {
      await (apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      }) as Promise<RegisterResponse>);

      // Send to login upon successful creation
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("conflict")
      ) {
        setGeneralError("An account with this email or username already exists. Try signing in.");
      } else if (
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("failed to fetch")
      ) {
        setGeneralError("Unable to reach TaskFlow servers. Check your internet connection.");
      } else {
        setGeneralError(message || "Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
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
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Modern Task Collaboration
            </span>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Start building better projects with your team today.
            </h2>

            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              Create your organization in seconds. Experience streamlined Kanban
              boards, interactive checklist subtasks, and real-time team collaboration.
            </p>

            {/* Product Value Highlights */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span>Unlimited tasks, subtask checklists, and Kanban columns</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span>Cloudinary file attachments & instant discussion threads</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span>Sync with iOS & Android Expo companion apps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof */}
        <div className="border-t border-zinc-800/80 pt-6 flex items-center justify-between text-xs text-zinc-500">
          <span>Enterprise-grade encryption · SOC2 Type II</span>
          <span>© {new Date().getFullYear()} TaskFlow Inc.</span>
        </div>
      </div>

      {/* RIGHT PANEL: Grounded Neutral Form Canvas - Fix 1 */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between bg-white px-6 py-8 sm:px-12 lg:px-16 min-h-screen">
        {/* Top Navigation */}
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Main Center Form */}
        <div className="mx-auto w-full max-w-sm my-auto py-6">
          {/* Header Copy (No generic platitudes) - Fix 3 */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Create your TaskFlow account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Start organizing sprints, collaborating with your team, and tracking deliverables.
            </p>
          </div>

          {/* General Error Banner - Fix 4 */}
          {generalError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <span className="font-bold text-red-600 text-sm leading-none mt-0.5">⚠</span>
              <div className="flex-1 leading-snug">{generalError}</div>
            </div>
          )}

          {/* The Form (Visual Hero of the Screen) */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
            {/* Username Field with Field-level Error - Fix 4 */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                disabled={loading}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError("");
                }}
                placeholder="alex_dev"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                  usernameError
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              {usernameError && (
                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>⚠</span> {usernameError}
                </p>
              )}
            </div>

            {/* Email Field with Field-level Error - Fix 4 */}
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
                disabled={loading}
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

            {/* Password Field with Field-level Error - Fix 4 */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="At least 6 characters"
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
              {passwordError ? (
                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>⚠</span> {passwordError}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-gray-400">
                  Must be at least 6 characters with mixed letters and numbers.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-black transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>
        </div>

        {/* Grounded Page Footer */}
        <div className="text-center text-xs text-gray-400 pb-2">
          By creating an account, you agree to TaskFlow&apos;s{" "}
          <span className="underline hover:text-gray-600 cursor-pointer">Terms</span> and{" "}
          <span className="underline hover:text-gray-600 cursor-pointer">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}