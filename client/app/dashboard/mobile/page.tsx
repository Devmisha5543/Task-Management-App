"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<"expo" | "pwa">("expo");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(null), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Android &amp; iOS Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            TaskFlow on Android &amp; iPhone
          </h1>
          <p className="mt-1.5 text-sm text-gray-600 dark:text-zinc-300">
            Take your tasks, kanban boards, and deadlines anywhere with our native mobile app and PWA.
          </p>
        </div>
      </div>

      {/* Method Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("expo")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "expo"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
          }`}
        >
          <Icon name="smartphone" className="h-4 w-4" />
          <span>1. Native App via Expo Go (iOS &amp; Android)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pwa")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "pwa"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
          }`}
        >
          <Icon name="sparkles" className="h-4 w-4" />
          <span>2. 1-Click Install to Home Screen (PWA)</span>
        </button>
      </div>

      {/* 1. Expo Go Native App */}
      {activeTab === "expo" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon name="smartphone" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Run the Native App on Your Phone Instantly
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">
                You do not need to wait for Apple App Store or Google Play Store approval. You can run the full native TaskFlow mobile app right now using Expo Go.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Install Expo Go</h3>
                <p className="mt-1.5 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                  Download the free <span className="font-semibold text-gray-900 dark:text-white">Expo Go</span> app:
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href="https://play.google.com/store/apps/details?id=host.exp.exponent"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                  >
                    <span>Android (Google Play)</span>
                    <Icon name="link" className="h-3.5 w-3.5 text-gray-400" />
                  </a>
                  <a
                    href="https://apps.apple.com/app/expo-go/id982107779"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                  >
                    <span>iPhone (Apple App Store)</span>
                    <Icon name="link" className="h-3.5 w-3.5 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Start Mobile Server</h3>
                <p className="mt-1.5 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                  In your project root, run this command in a terminal:
                </p>
                <div className="mt-4 rounded-lg bg-black dark:bg-zinc-950 p-3 text-xs font-mono text-zinc-100 relative group">
                  <code>cd mobile &amp;&amp; npm start</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("cd mobile && npm start", "step2")}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-white text-[11px] font-sans"
                  >
                    {copiedCommand === "step2" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-gray-500 dark:text-zinc-400">
                  Ensure your phone and computer are on the same Wi-Fi network.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Scan &amp; Open</h3>
                <p className="mt-1.5 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                  Open Expo Go and scan the QR code printed in your terminal:
                </p>
                <ul className="mt-3 text-xs text-gray-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li><span className="font-semibold text-gray-900 dark:text-white">iPhone:</span> Open Camera app &amp; tap banner.</li>
                  <li><span className="font-semibold text-gray-900 dark:text-white">Android:</span> Open Expo Go &amp; tap &quot;Scan QR code&quot;.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PWA 1-Click Install */}
      {activeTab === "pwa" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Install TaskFlow as a Phone App (Zero Downloads Needed)
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">
                You can turn this web application into a standalone mobile app directly on your iPhone or Android home screen with zero app store downloads.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* iPhone Guide */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs">
                    iOS
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">On iPhone (Apple Safari)</h3>
                </div>

                <ol className="mt-4 text-xs text-gray-700 dark:text-zinc-300 space-y-3 list-decimal list-inside">
                  <li className="leading-relaxed">
                    Open <span className="font-semibold text-gray-900 dark:text-white">Safari</span> on your iPhone and visit your TaskFlow URL.
                  </li>
                  <li className="leading-relaxed">
                    Tap the <span className="font-semibold text-gray-900 dark:text-white">Share button</span> (square with arrow pointing up) at the bottom of the screen.
                  </li>
                  <li className="leading-relaxed">
                    Scroll down and tap <span className="font-semibold text-gray-900 dark:text-white">&quot;Add to Home Screen&quot;</span>.
                  </li>
                  <li className="leading-relaxed">
                    Tap <span className="font-semibold text-gray-900 dark:text-white">Add</span> in the top right. TaskFlow will appear as an app icon on your iPhone home screen!
                  </li>
                </ol>
              </div>

              {/* Android Guide */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs">
                    AND
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">On Android (Google Chrome)</h3>
                </div>

                <ol className="mt-4 text-xs text-gray-700 dark:text-zinc-300 space-y-3 list-decimal list-inside">
                  <li className="leading-relaxed">
                    Open <span className="font-semibold text-gray-900 dark:text-white">Chrome</span> on your Android phone and visit your TaskFlow URL.
                  </li>
                  <li className="leading-relaxed">
                    Tap the <span className="font-semibold text-gray-900 dark:text-white">Three Dots menu (⋮)</span> in the top right corner.
                  </li>
                  <li className="leading-relaxed">
                    Tap <span className="font-semibold text-gray-900 dark:text-white">&quot;Install app&quot;</span> (or &quot;Add to Home screen&quot;).
                  </li>
                  <li className="leading-relaxed">
                    Tap <span className="font-semibold text-gray-900 dark:text-white">Install</span>. The app installs to your app drawer and home screen like a native app!
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
