"use client";

import { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { addComment, deleteComment, getTaskComments } from "@/lib/commentApi";
import type { Task, TaskComment } from "@/types/task";
import { useSocket } from "@/context/SocketContext";
import { useAuthStore } from "@/store/authStore";

interface TaskCommentsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentChange?: () => void;
}

export default function TaskCommentsModal({
  task,
  isOpen,
  onClose,
  onCommentChange,
}: TaskCommentsModalProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { socket, joinTask, leaveTask, sendTyping, typingUsers, taskViewers } = useSocket();
  const currentUser = useAuthStore((state) => state.user);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (task && isOpen) {
      setError(null);
      fetchComments(task._id);
      joinTask(task._id);

      return () => {
        leaveTask(task._id);
      };
    }
  }, [task, isOpen, joinTask, leaveTask]);

  // Listen to real-time comment creation and deletion events
  useEffect(() => {
    if (!socket || !task?._id || !isOpen) return;

    const handleCommentCreated = (data: { taskId: string; comment: TaskComment }) => {
      if (data.taskId === task._id && data.comment) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [...prev, data.comment];
        });
        if (onCommentChange) onCommentChange();
      }
    };

    const handleCommentDeleted = (data: { taskId: string; commentId: string }) => {
      if (data.taskId === task._id && data.commentId) {
        setComments((prev) => prev.filter((c) => c._id !== data.commentId));
        if (onCommentChange) onCommentChange();
      }
    };

    socket.on("comment:created", handleCommentCreated);
    socket.on("comment:deleted", handleCommentDeleted);

    return () => {
      socket.off("comment:created", handleCommentCreated);
      socket.off("comment:deleted", handleCommentDeleted);
    };
  }, [socket, task?._id, isOpen, onCommentChange]);

  const fetchComments = async (taskId: string) => {
    setLoading(true);
    try {
      const data = await getTaskComments(taskId);
      setComments(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load comments");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewComment(val);

    if (task?._id) {
      sendTyping(task._id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(task._id, false);
      }, 1500);
    }
  };

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    // Stop typing indicator immediately on submit
    if (task?._id) {
      sendTyping(task._id, false);
    }

    try {
      const comment = await addComment(task._id, newComment.trim());
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
      setNewComment("");
      if (onCommentChange) onCommentChange();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post comment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    setError(null);

    try {
      await deleteComment(task._id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (onCommentChange) onCommentChange();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete comment");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Filter out current user from typing and viewer lists
  const activeTypers = (typingUsers[task._id] || []).filter(
    (u) => u !== currentUser?.username
  );
  const otherViewers = (taskViewers[task._id] || []).filter(
    (u) => u !== currentUser?.username
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 shadow-xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Icon name="comment" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Discussion &amp; Notes
                </h2>
                {otherViewers.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {otherViewers.join(", ")} viewing
                  </span>
                )}
              </div>
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
          <div className="mt-3 rounded-lg bg-red-50 dark:bg-rose-950/40 p-3 text-sm text-red-600 dark:text-rose-300 border border-red-200 dark:border-rose-900/60">
            {error}
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 min-h-[160px]">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500 dark:text-zinc-400">
              Loading discussion thread...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 dark:text-zinc-400 italic flex flex-col items-center gap-2">
              <Icon name="comment" className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
              No comments yet. Start the conversation below!
            </div>
          ) : (
            comments.map((comment) => {
              const username = comment.user?.username || comment.user?.email || "User";
              const avatar = comment.user?.profilePhoto || comment.user?.profileImage;

              return (
                <div key={comment._id} className="flex items-start gap-3 group">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 bg-gray-50 dark:bg-zinc-800/70 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800 text-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-zinc-100 text-xs">
                        {username}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        <button
                          onClick={() => handleDelete(comment._id)}
                          disabled={deletingId === comment._id}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-rose-400 transition"
                          title="Delete Comment"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Real-time Typing Indicator */}
        {activeTypers.length > 0 && (
          <div className="flex items-center gap-1.5 pb-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>
              {activeTypers.join(", ")} {activeTypers.length > 1 ? "are" : "is"} typing...
            </span>
          </div>
        )}

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-zinc-800 pt-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Write a comment... (real-time sync)"
              value={newComment}
              onChange={handleInputChange}
              className="flex-1 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-zinc-500 focus:ring-1 focus:ring-black dark:focus:ring-zinc-500 transition placeholder-gray-400 dark:placeholder-zinc-500"
              disabled={submitting}
            />
            <Button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? (
                "..."
              ) : (
                <div className="flex items-center gap-1.5">
                  <Icon name="send" className="w-4 h-4" />
                  <span>Send</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

