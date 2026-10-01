const { z } = require("zod");

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),

  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),

  status: z
    .enum(["todo", "in-progress", "done"])
    .optional(),

  priority: z
    .enum(["low", "medium", "high"])
    .optional(),

  dueDate: z
    .string()
    .nullable()
    .optional()
    .or(z.literal("")),

  labels: z
    .array(z.string())
    .optional(),

  subtasks: z
    .array(
      z.object({
        _id: z.string().optional(),
        title: z.string().min(1, "Subtask title is required").max(300),
        completed: z.boolean().optional().default(false),
        completedAt: z.union([z.string(), z.date()]).nullable().optional()
      })
    )
    .optional()
});

const subtaskInputSchema = z.object({
  title: z.string().min(1, "Subtask title is required").max(300)
});

const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  completed: z.boolean().optional()
});

module.exports = {
  createTaskSchema,
  subtaskInputSchema,
  updateSubtaskSchema
};