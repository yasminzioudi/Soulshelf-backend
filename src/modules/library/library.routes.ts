import type { FastifyInstance } from "fastify";
import { addToLibraryController, getLibraryController, removeFromLibraryController } from "./library.controller";
import { authenticate } from "../../middleware/authenticate";

export const libraryRoutes = async (app: FastifyInstance) => {
    // GET /library/me — read caller's own library (protected)
    app.get(
        "/library/me",
        { preHandler: authenticate },
        getLibraryController,
    );

    // POST /library/me — add existing book to caller's library (protected)
    app.post(
        "/library/me",
        { preHandler: authenticate },
        addToLibraryController,
    );

    // DELETE /library/me/:bookId — remove book from caller's library (protected)
    app.delete(
        "/library/me/:bookId",
        { preHandler: authenticate },
        removeFromLibraryController,
    );
};
