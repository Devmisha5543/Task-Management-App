"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { addComment, deleteComment, getTaskComments } from "@/lib/commentApi";
import type { Task, TaskComment } from "@/types/task";

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

  useEffect(() => {
    if (task && isOpen) {
      setError(null);
      fetchComments(task._id);
    }
  }, [task, isOpen]);

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

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const comment = await addComment(task._id, newComment.trim());
      setComments((prev) => [...prev, comment]);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Icon name="comment" className="w-5 h-5 text-gray-700" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Discussion & Notes</h2>
              <p className="text-xs text-gray-500 truncate max-w-xs">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 min-h-[160px]">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">
              Loading discussion thread...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 italic flex flex-col items-center gap-2">
              <Icon name="comment" className="w-8 h-8 text-gray-300" />
              No comments yet. Start the conversation below!
            </div>
          ) : (
            comments.map((comment) => {
              const username = comment.user?.username || comment.user?.email || "User";
              const avatar = comment.user?.profileImage;

              return (
                <div key={comment._id} className="flex items-start gap-3 group">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 bg-gray-50 rounded-2xl p-3 border border-gray-100 text-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-xs">
                        {username}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                        <button
                          onClick={() => handleDelete(comment._id)}
                          disabled={deletingId === comment._id}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                          title="Delete Comment"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="border-t pt-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
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
