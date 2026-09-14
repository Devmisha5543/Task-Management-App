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
    .optional(),

  labels: z
    .array(z.string())
    .optional()
});

module.exports = {
  createTaskSchema
};