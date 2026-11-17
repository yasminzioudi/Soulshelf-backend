import type { FastifyInstance } from "fastify";
import {
    createReviewController,
    deleteReviewController,
    getBookReviewsController,
    updateReviewController,
} from "./review.controller";
import { authenticate } from "../../middleware/authenticate";

export const reviewRoutes = async (app: FastifyInstance) => {
    // GET /books/:id/reviews — get all reviews for a book (public)
    app.get(
        "/books/:id/reviews",
        getBookReviewsController,
    );

    // POST /books/:id/reviews — post a review for a book (protected)
    app.post(
        "/books/:id/reviews",
        { preHandler: authenticate },
        createReviewController,
    );

    // PATCH /reviews/:id — update user's own review (protected)
    app.patch(
        "/reviews/:id",
        { preHandler: authenticate },
        updateReviewController,
    );

    // DELETE /reviews/:id — delete user's own review (protected)
    app.delete(
        "/reviews/:id",
        { preHandler: authenticate },
        deleteReviewController,
    );
};
