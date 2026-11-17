import type { FastifyInstance } from "fastify";
import { getUserProfileController, meController, signupController, updateMeController } from "./user.controller";
import { authenticate } from "../../middleware/authenticate";

export const userRoutes = async (app: FastifyInstance) => {
    // Existing
    app.post("/auth/signup", signupController);

    // GET /users/me — read the caller's own profile (protected)
    app.get("/users/me", { preHandler: authenticate }, meController);

    // GET /users/:userId — read public user profile (protected)
    app.get("/users/:userId", { preHandler: authenticate }, getUserProfileController);

    // A3 — Edit profile (protected)
    app.patch(
        "/users/me",
        { preHandler: authenticate },
        updateMeController,
    );
};