const { z } = require("zod");

const loginSchema = z.object({
  email: z.email({
    error: "Invalid email format.",
  }),

  password: z
    .string({
      error: "Password is required.",
    })
    .min(6, {
      error: "Password must be at least 6 characters long.",
    }),
});

module.exports = {
  loginSchema,
};
