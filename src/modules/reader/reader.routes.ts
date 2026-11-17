import type { FastifyInstance } from "fastify";
import {
    getChaptersController,
    getLatestReadingProgressController,
    getReadingProgressController,
    updateReadingProgressController,
} from "./reader.controller";
import { authenticate } from "../../middleware/authenticate";

export const readerRoutes = async (app: FastifyInstance) => {
    // GET /books/:id/chapters — get chapters for a book
    app.get(
        "/books/:id/chapters",
        getChaptersController,
    );

    // GET /reading-progress/me/latest — read caller's most recent reading progress (protected)
    // NOTE: Must be registered before /reading-progress/me/:bookId
    app.get(
        "/reading-progress/me/latest",
        { preHandler: authenticate },
        getLatestReadingProgressController,
    );

    // GET /reading-progress/me/:bookId — read caller's reading progress for a book (protected)
    app.get(
        "/reading-progress/me/:bookId",
        { preHandler: authenticate },
        getReadingProgressController,
    );

    // POST /reading-progress/me/:bookId — update caller's reading progress for a book (protected)
    app.post(
        "/reading-progress/me/:bookId",
        { preHandler: authenticate },
        updateReadingProgressController,
    );
};
