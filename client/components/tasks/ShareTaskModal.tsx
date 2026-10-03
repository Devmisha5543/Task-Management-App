"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { getTaskMembers } from "@/lib/taskApi";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import type { Task, TaskMember } from "@/types/task";

import Icon from "@/components/ui/Icon";

interface ShareTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareTaskModal({
  task,
  isOpen,
  onClose,
}: ShareTaskModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const addMember = useTaskStore((state) => state.addMember);
  const removeMember = useTaskStore((state) => state.removeMember);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [members, setMembers] = useState<TaskMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isOwner = currentUser?.id && task?.createdBy === currentUser.id;

  useEffect(() => {
    if (task && isOpen) {
      setError(null);
      setSuccess(null);
      setEmail("");
      fetchMembersList(task._id);
    }
  }, [task, isOpen]);

  const fetchMembersList = async (taskId: string) => {
    setLoadingMembers(true);
    try {
      const fetched = await getTaskMembers(taskId);
      setMembers(fetched);
    } catch (err) {
      console.error("Failed to load task members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await addMember(task._id, email.trim(), role);
      setSuccess(`User ${email} added as ${role}`);
      setEmail("");
      fetchMembersList(task._id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add member");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberEmail?: string) => {
    setError(null);
    setSuccess(null);
    try {
      await removeMember(task._id, userId);
      setSuccess(`Removed ${memberEmail || "user"} from task`);
      fetchMembersList(task._id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to remove member");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Icon name="users" className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Share Task</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate max-w-xs">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 p-3 text-sm text-red-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 text-sm text-emerald-600 dark:text-emerald-300">
            {success}
          </div>
        )}

        {/* Add Member Form (Only Owner) */}
        {isOwner ? (
          <form onSubmit={handleAddMember} className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Invite Collaborator
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none transition"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-black dark:focus:border-zinc-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-xs italic text-gray-500 dark:text-zinc-400">
            Only the task owner can invite new members.
          </p>
        )}

        {/* Members List */}
        <div className="mt-6 border-t border-gray-100 dark:border-zinc-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Task Members</h3>

          {loadingMembers ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">No members listed.</p>
          ) : (
            <div className="mt-3 divide-y divide-gray-100 dark:divide-zinc-800 max-h-48 overflow-y-auto">
              {members.map((member, idx) => {
                const u = member.user as unknown as { _id?: string; username?: string; email?: string };
                const uId = typeof member.user === "string" ? member.user : u._id || "";
                const uName = typeof member.user === "string" ? "User" : u.username || u.email || "User";
                const uEmail = typeof member.user === "string" ? "" : u.email || "";

                return (
                  <div key={idx} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{uName}</p>
                      {uEmail && <p className="text-xs text-gray-500 dark:text-zinc-400">{uEmail}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700 dark:text-zinc-300">
                        {member.role}
                      </span>

                      {isOwner && member.role !== "owner" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(uId, uEmail)}
                          className="text-xs text-red-500 dark:text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-100 dark:border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
