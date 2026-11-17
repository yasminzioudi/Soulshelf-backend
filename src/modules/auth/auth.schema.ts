import { z } from "zod";

// ─── A1: Login ─────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── A2: Logout ─────────────────────────────────────────────────────────────────
// Body: the raw refresh token to revoke.
export const logoutSchema = z.object({
    refreshToken: z.string().min(1),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

// ─── A4: Google Sign-In ─────────────────────────────────────────────────────────
export const googleAuthSchema = z.object({
    idToken: z.string().min(1),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

// ─── Forgot Password Flow ───────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const verifyResetCodeSchema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(6),
});

export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;

export const resetPasswordSchema = z.object({
    resetToken: z.string().min(1),
    newPassword: z.string().min(6),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
