"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import {
  deleteTaskAttachment,
  getTaskAttachments,
  uploadAttachment,
} from "@/lib/attachmentApi";
import type { TaskAttachment } from "@/types/attachment";
import type { Task } from "@/types/task";

interface TaskAttachmentsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskAttachmentsModal({
  task,
  isOpen,
  onClose,
}: TaskAttachmentsModalProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (task && isOpen) {
      setError(null);
      fetchAttachments(task._id);
    }
  }, [task, isOpen]);

  const fetchAttachments = async (taskId: string) => {
    setLoading(true);
    try {
      const data = await getTaskAttachments(taskId);
      setAttachments(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch attachments");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const newAttachment = await uploadAttachment(task._id, file);
      setAttachments((prev) => [newAttachment, ...prev]);
      e.target.value = ""; // reset file input
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload file");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    setError(null);

    try {
      await deleteTaskAttachment(task._id, attachmentId);
      setAttachments((prev) => prev.filter((att) => att._id !== attachmentId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete attachment");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getViewerUrl = (rawUrl?: string, filename?: string) => {
    if (!rawUrl) return "#";
    const nameToTest = filename || rawUrl.split("?")[0];
    const ext = nameToTest.split(".").pop()?.toLowerCase() || "";
    const docExtensions = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];

    if (docExtensions.includes(ext)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Icon name="attachment" className="w-5 h-5 text-gray-700" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Task Attachments</h2>
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
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* File Upload Box */}
        <div className="mt-4 rounded-xl border-2 border-dashed border-gray-300 p-5 text-center hover:border-black transition">
          <label className="cursor-pointer flex flex-col items-center gap-1.5">
            <Icon name="cloud-upload" className="w-8 h-8 text-blue-600 mb-1" />
            <span className="text-sm font-semibold text-gray-900">
              {uploading ? "Uploading to Cloudinary..." : "Click to select a file to upload"}
            </span>
            <span className="text-xs text-gray-500">Images, PDFs, documents up to 10MB</span>
            <input
              type="file"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Attachments List */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Attached Files ({attachments.length})
          </h3>

          {loading ? (
            <div className="py-6 text-center text-xs text-gray-500">
              Loading attachments...
            </div>
          ) : attachments.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500 italic">
              No files attached to this task yet.
            </div>
          ) : (
            <div className="divide-y max-h-60 overflow-y-auto pr-1">
              {attachments.map((att) => {
                const rawUrl = att.url || (att as unknown as { fileUrl?: string }).fileUrl;
                const viewerUrl = getViewerUrl(rawUrl, att.filename);
                const uploaderName =
                  typeof att.uploadedBy === "object" && att.uploadedBy !== null
                    ? att.uploadedBy.username || att.uploadedBy.email
                    : "User";

                return (
                  <div
                    key={att._id}
                    className="flex items-center justify-between py-3 gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                        <Icon name="file" className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={viewerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                        >
                          {att.filename}
                        </a>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(att.size)} • Uploaded by {uploaderName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {viewerUrl && (
                        <a
                          href={viewerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                        >
                          Open Link
                        </a>
                      )}

                      <button
                        onClick={() => handleDelete(att._id)}
                        disabled={deletingId === att._id}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        title="Delete Attachment"
                      >
                        {deletingId === att._id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Icon name="trash" className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
