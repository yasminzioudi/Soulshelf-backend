import type { FastifyInstance } from "fastify";
import { addFavoriteController, getFavoritesController, removeFavoriteController } from "./favorites.controller";
import { authenticate } from "../../middleware/authenticate";

export const favoritesRoutes = async (app: FastifyInstance) => {
    // GET /favorites/me — read caller's own favorite books (protected)
    app.get(
        "/favorites/me",
        { preHandler: authenticate },
        getFavoritesController,
    );

    // POST /favorites/me/:bookId — add book to caller's favorites (protected)
    app.post(
        "/favorites/me/:bookId",
        { preHandler: authenticate },
        addFavoriteController,
    );

    // DELETE /favorites/me/:bookId — remove book from caller's favorites (protected)
    app.delete(
        "/favorites/me/:bookId",
        { preHandler: authenticate },
        removeFavoriteController,
    );
};
