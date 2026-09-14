const { z } = require("zod");

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),

  email: z
    .string()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

module.exports = {
  registerSchema
};