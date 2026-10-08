"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import { exportTasksToCSV, exportTasksToJSON } from "@/lib/analyticsApi";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestEmail,
  sendTestPush,
  type NotificationPreferences,
} from "@/lib/notificationApi";

export default function SettingsPage() {
  const { theme, setTheme, isDark } = useTheme();
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  // In-app Alert preferences
  const [prefDeadlines, setPrefDeadlines] = useState(true);
  const [prefSharing, setPrefSharing] = useState(true);
  const [prefComments, setPrefComments] = useState(true);
  const [prefRecurrence, setPrefRecurrence] = useState(true);

  // Email and Push preferences from Backend
  const [emailPrefs, setEmailPrefs] = useState({
    deadlineAlerts: true,
    taskAssignments: true,
    comments: true,
    weeklyDigest: true,
  });
  const [pushPrefs, setPushPrefs] = useState({
    deadlineAlerts: true,
    taskAssignments: true,
    comments: true,
  });
  const [devicesCount, setDevicesCount] = useState(0);

  // Feedback states
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingPush, setSendingPush] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();

    // Load in-app prefs from localStorage
    try {
      const storedPrefs = localStorage.getItem("taskflow_notif_prefs");
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        setPrefDeadlines(parsed.deadlines ?? true);
        setPrefSharing(parsed.sharing ?? true);
        setPrefComments(parsed.comments ?? true);
        setPrefRecurrence(parsed.recurrence ?? true);
      }
    } catch {
      // ignore
    }

    // Load server-side email and push notification preferences
    getNotificationPreferences()
      .then((data: NotificationPreferences) => {
        if (data.emailPreferences) setEmailPrefs(data.emailPreferences);
        if (data.pushPreferences) setPushPrefs(data.pushPreferences);
        setDevicesCount(data.registeredDevicesCount || 0);
      })
      .catch((err) => console.warn("Failed to load server notification prefs:", err));
  }, [fetchTasks]);

  const showSuccessFeedback = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const saveInAppPrefs = (updated: {
    deadlines?: boolean;
    sharing?: boolean;
    comments?: boolean;
    recurrence?: boolean;
  }) => {
    const newPrefs = {
      deadlines: updated.deadlines ?? prefDeadlines,
      sharing: updated.sharing ?? prefSharing,
      comments: updated.comments ?? prefComments,
      recurrence: updated.recurrence ?? prefRecurrence,
    };
    if (updated.deadlines !== undefined) setPrefDeadlines(updated.deadlines);
    if (updated.sharing !== undefined) setPrefSharing(updated.sharing);
    if (updated.comments !== undefined) setPrefComments(updated.comments);
    if (updated.recurrence !== undefined) setPrefRecurrence(updated.recurrence);

    try {
      localStorage.setItem("taskflow_notif_prefs", JSON.stringify(newPrefs));
      showSuccessFeedback("In-app notification preferences saved");
    } catch {
      // ignore
    }
  };

  const saveServerEmailPrefs = async (key: keyof typeof emailPrefs, val: boolean) => {
    const updated = { ...emailPrefs, [key]: val };
    setEmailPrefs(updated);
    try {
      await updateNotificationPreferences({ emailPreferences: updated });
      showSuccessFeedback("Email notification preferences updated");
    } catch {
      // rollback
      setEmailPrefs(emailPrefs);
    }
  };

  const saveServerPushPrefs = async (key: keyof typeof pushPrefs, val: boolean) => {
    const updated = { ...pushPrefs, [key]: val };
    setPushPrefs(updated);
    try {
      await updateNotificationPreferences({ pushPreferences: updated });
      showSuccessFeedback("Mobile push notification preferences updated");
    } catch {
      // rollback
      setPushPrefs(pushPrefs);
    }
  };

  const handleTestEmail = async () => {
    setSendingEmail(true);
    setEmailPreviewUrl(null);
    try {
      const res = await sendTestEmail();
      showSuccessFeedback(res.message);
      if (res.previewUrl) {
        setEmailPreviewUrl(res.previewUrl);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send test email";
      alert(errorMsg);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleTestPush = async () => {
    setSendingPush(true);
    try {
      const res = await sendTestPush();
      showSuccessFeedback(res.message);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send test push notification";
      alert(errorMsg);
    } finally {
      setSendingPush(false);
    }
  };

  const themes: { id: Theme; title: string; desc: string; icon: "sun" | "moon" | "monitor" }[] = [
    {
      id: "light",
      title: "Light Theme",
      desc: "Crisp, clean layout with cool slate and neutral white surfaces",
      icon: "sun",
    },
    {
      id: "dark",
      title: "Dark Theme",
      desc: "Deep zinc & slate tones with high contrast accents",
      icon: "moon",
    },
    {
      id: "system",
      title: "System Synchronized",
      desc: "Automatically adapts to your operating system preference",
      icon: "monitor",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Application Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Customize your appearance, multichannel notifications (In-App, Email &amp; Push), and workspace preferences.
        </p>
      </div>

      {savedMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2 shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <Icon name="check-circle" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{savedMessage}</span>
          </div>
          {emailPreviewUrl && (
            <a
              href={emailPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-emerald-900 dark:text-emerald-200 font-bold hover:opacity-80"
            >
              View Email Preview ↗
            </a>
          )}
        </div>
      )}

      {/* 1. Theme & Appearance Section */}
      <section className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Icon name="sun" className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Appearance &amp; Theme
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Select how TaskFlow looks for you. Active mode:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                {theme} ({isDark ? "Dark" : "Light"})
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-black dark:border-white bg-gray-50/80 dark:bg-zinc-800/90 shadow-sm ring-1 ring-black dark:ring-white"
                    : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300"
                    }`}
                  >
                    <Icon name={t.icon} className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {t.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Automated Email Notifications (Nodemailer) */}
      <section className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Icon name="mail" className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Automated Email Notifications (Nodemailer)
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Receive scheduled email summaries and alerts sent to{" "}
                <span className="font-semibold text-gray-800 dark:text-zinc-200">{user?.email}</span>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestEmail}
            disabled={sendingEmail}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-700 transition disabled:opacity-50"
          >
            <Icon name="mail" className="h-3.5 w-3.5 text-rose-500" />
            <span>{sendingEmail ? "Sending..." : "Send Test Email"}</span>
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 mt-2">
          {/* Deadline Email Reminders */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Deadline &amp; Overdue Email Reminders
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Automated hourly background cron scans notify 24 hours before deadlines and when tasks become overdue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveServerEmailPrefs("deadlineAlerts", !emailPrefs.deadlineAlerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailPrefs.deadlineAlerts ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  emailPrefs.deadlineAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Task Shared / Assigned */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Task Assignment &amp; Collaborator Emails
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Receive an email when teammates assign or share a task with you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveServerEmailPrefs("taskAssignments", !emailPrefs.taskAssignments)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailPrefs.taskAssignments ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  emailPrefs.taskAssignments ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Discussion Comments */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Discussion &amp; Comment Emails
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Receive email alerts when comments are posted on collaborative tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveServerEmailPrefs("comments", !emailPrefs.comments)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailPrefs.comments ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  emailPrefs.comments ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Mobile Device Push Notifications (Expo) */}
      <section className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Icon name="smartphone" className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Mobile Push Notifications (Expo)
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {devicesCount} Device{devicesCount === 1 ? "" : "s"} Connected
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Direct push alerts delivered to your Android or iPhone device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestPush}
            disabled={sendingPush || devicesCount === 0}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-700 transition disabled:opacity-50"
            title={devicesCount === 0 ? "Log in on mobile app first to register push token" : "Send test push notification"}
          >
            <Icon name="bell" className="h-3.5 w-3.5 text-emerald-500" />
            <span>{sendingPush ? "Sending..." : "Send Test Push"}</span>
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 mt-2">
          {/* Deadline Push Alerts */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Deadline &amp; Due Date Push Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Direct pop-up notification on your phone when tasks are due or overdue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveServerPushPrefs("deadlineAlerts", !pushPrefs.deadlineAlerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pushPrefs.deadlineAlerts ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  pushPrefs.deadlineAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Task Shared / Assigned */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Task Assignment Push Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Instant notification when a collaborator assigns a new task to you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveServerPushPrefs("taskAssignments", !pushPrefs.taskAssignments)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pushPrefs.taskAssignments ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  pushPrefs.taskAssignments ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* New Comments Push */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Comment &amp; Discussion Push Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Instant notification when team members comment on collaborative tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveServerPushPrefs("comments", !pushPrefs.comments)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pushPrefs.comments ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  pushPrefs.comments ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. In-App Real-Time Notifications */}
      <section className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Icon name="bell" className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              In-App Notification Center
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Configure which real-time WebSocket events trigger top-nav notification badges.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 mt-2">
          {/* Deadline Reminders */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Deadline &amp; Due Date Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Notify when tasks are due within 24 hours or have become overdue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveInAppPrefs({ deadlines: !prefDeadlines })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefDeadlines ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  prefDeadlines ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Task Shared / Assigned */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Task Sharing &amp; Collaborator Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Notify when team members share or assign collaborative tasks to you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveInAppPrefs({ sharing: !prefSharing })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefSharing ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  prefSharing ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* New Comments */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Discussion &amp; Comment Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Notify when team members comment on tasks you are collaborating on.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveInAppPrefs({ comments: !prefComments })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefComments ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  prefComments ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Recurrence Cycles */}
          <div className="py-4 flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recurring Task Automation Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Notify when a completed recurring task automatically spawns the next cycle.
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveInAppPrefs({ recurrence: !prefRecurrence })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefRecurrence ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                  prefRecurrence ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Workspace Data Export Center */}
      <section className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Icon name="download" className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Workspace Data Export &amp; Backup
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Download your workspace data ({tasks.length} total tasks) for spreadsheet analysis or backup portability.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportTasksToCSV(tasks)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
          >
            <Icon name="download" className="h-4 w-4 text-emerald-600" />
            <span>Export to CSV (.csv spreadsheet)</span>
          </button>

          <button
            type="button"
            onClick={() => exportTasksToJSON(tasks)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
          >
            <Icon name="download" className="h-4 w-4 text-blue-600" />
            <span>Export JSON Full Backup (.json)</span>
          </button>
        </div>
      </section>

      {/* 6. Account & Mobile Shortcuts */}
      <section className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Icon name="user" className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Account &amp; Mobile Shortcuts
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Manage personal details, mobile APK download, and credentials.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{user?.email}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/dashboard/mobile"
              className="inline-flex items-center gap-2 rounded-xl bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-sm w-fit"
            >
              <Icon name="smartphone" className="h-3.5 w-3.5" />
              <span>Get Mobile App</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-gray-800 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-700 transition w-fit"
            >
              <Icon name="edit" className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
