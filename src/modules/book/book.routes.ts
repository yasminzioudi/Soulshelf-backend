import type { FastifyInstance } from "fastify";
import { getBookByIdController, getBooksController, getFeaturedBooksController } from "./book.controller";

export const bookRoutes = async (app: FastifyInstance) => {
    // GET /books — search books by q or return demo books (public)
    app.get("/books", getBooksController);

    // GET /books/featured — get featured books only (public)
    app.get("/books/featured", getFeaturedBooksController);

    // GET /books/:id — get book details by numeric ID (public)
    app.get("/books/:id", getBookByIdController);
};
