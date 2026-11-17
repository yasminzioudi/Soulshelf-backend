import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(100).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;