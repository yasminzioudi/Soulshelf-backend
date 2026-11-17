import type { FastifyReply, FastifyRequest } from "fastify";
import {
    forgotPasswordSchema,
    googleAuthSchema,
    loginSchema,
    logoutSchema,
    resetPasswordSchema,
    verifyResetCodeSchema,
} from "./auth.schema";
import {
    forgotPassword,
    googleAuth,
    login,
    logout,
    resetPassword,
    verifyResetCode,
} from "./auth.service";

// ─── A1: POST /auth/login ──────────────────────────────────────────────────────

export const loginController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = loginSchema.parse(request.body);
    const result = await login(input);

    return reply.code(200).send({
        success: true,
        data: result,
    });
};

// ─── A2: POST /auth/logout ─────────────────────────────────────────────────────
// Route is protected: authenticate middleware runs before this controller.

export const logoutController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = logoutSchema.parse(request.body);
    await logout(input);

    return reply.code(200).send({
        success: true,
        data: null,
    });
};

// ─── A4: POST /auth/google ─────────────────────────────────────────────────────

export const googleAuthController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = googleAuthSchema.parse(request.body);
    const result = await googleAuth(input);

    return reply.code(200).send({
        success: true,
        data: result,
    });
};

// ─── Forgot Password Flow ───────────────────────────────────────────────────────

export const forgotPasswordController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = forgotPasswordSchema.parse(request.body);
    const result = await forgotPassword(input);

    return reply.code(200).send({
        success: true,
        data: result,
    });
};

export const verifyResetCodeController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = verifyResetCodeSchema.parse(request.body);
    const result = await verifyResetCode(input);

    return reply.code(200).send({
        success: true,
        data: result,
    });
};

export const resetPasswordController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = resetPasswordSchema.parse(request.body);
    const result = await resetPassword(input);

    return reply.code(200).send({
        success: true,
        data: result,
    });
};
