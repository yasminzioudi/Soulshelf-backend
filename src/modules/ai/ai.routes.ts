import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    getRecommendationsController,
    readerAssistantController,
    smartDiscoveryController,
} from "./ai.controller";

export const aiRoutes = async (app: FastifyInstance) => {
    // POST /ai/discover — Natural language smart book discovery
    app.post("/ai/discover", smartDiscoveryController);

    // POST /ai/assistant — Reader assistant (summaries, explanations, questions)
    app.post(
        "/ai/assistant",
        { preHandler: [authenticate] },
        readerAssistantController,
    );

    // GET /ai/recommendations — Personalized AI candidate recommendations
    app.get(
        "/ai/recommendations",
        { preHandler: [authenticate] },
        getRecommendationsController,
    );
};
