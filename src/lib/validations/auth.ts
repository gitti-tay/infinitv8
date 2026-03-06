import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(PASSWORD_REGEX, "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character"),
  name: z.string().min(1, "Name is required").max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
