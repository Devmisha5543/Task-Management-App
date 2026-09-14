const { z } = require("zod");

const addTaskMemberSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email"),

  role: z
    .enum(["editor", "viewer"])
    .default("viewer")
});

module.exports = {
  addTaskMemberSchema
};