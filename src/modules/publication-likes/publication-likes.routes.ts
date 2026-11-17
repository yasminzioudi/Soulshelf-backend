import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    getPublicationLikeStatusController,
    likePublicationController,
    unlikePublicationController,
} from "./publication-likes.controller";

export const publicationLikesRoutes = async (app: FastifyInstance) => {
    app.post("/publications/:id/like", { preHandler: [authenticate] }, likePublicationController);
    app.delete("/publications/:id/like", { preHandler: [authenticate] }, unlikePublicationController);
    app.post("/publications/:id/unlike", { preHandler: [authenticate] }, unlikePublicationController);
    app.get("/publications/:id/likes", { preHandler: [authenticate] }, getPublicationLikeStatusController);
};
