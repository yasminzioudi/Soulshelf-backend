import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    forgotPasswordController,
    googleAuthController,
    loginController,
    logoutController,
    resetPasswordController,
    verifyResetCodeController,
} from "./auth.controller";

export const authRoutes = async (app: FastifyInstance) => {
    // A1 — Login (public)
    app.post("/auth/login", loginController);

    // A2 — Logout (protected: requires valid access token)
    app.post(
        "/auth/logout",
        { preHandler: authenticate },
        logoutController,
    );

    // A4 — Google Sign-In (public: idToken is verified server-side)
    app.post("/auth/google", googleAuthController);

    // Forgot password flow (public)
    app.post("/auth/forgot-password", forgotPasswordController);
    app.post("/auth/verify-reset-code", verifyResetCodeController);
    app.post("/auth/reset-password", resetPasswordController);
};
