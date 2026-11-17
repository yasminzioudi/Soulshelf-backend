import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    createPublicationController,
    deletePublicationController,
    getAllPublicationsController,
    getMyPublicationsController,
    getPublicationByIdController,
    updatePublicationController,
} from "./publication.controller";

export const publicationRoutes = async (app: FastifyInstance) => {
    // GET /publications — Public feed of recent publications from all community authors
    app.get("/publications", getAllPublicationsController);

    // POST /publications — Create a new publication for the authenticated user
    app.post("/publications", { preHandler: authenticate }, createPublicationController);

    // GET /publications/me — Retrieve authenticated user's publications
    app.get("/publications/me", { preHandler: authenticate }, getMyPublicationsController);

    // GET /publications/:id — Retrieve a single publication by ID
    app.get("/publications/:id", { preHandler: authenticate }, getPublicationByIdController);

    // PATCH /publications/:id — Update own publication (owner-only)
    app.patch("/publications/:id", { preHandler: authenticate }, updatePublicationController);

    // DELETE /publications/:id — Delete own publication (owner-only)
    app.delete("/publications/:id", { preHandler: authenticate }, deletePublicationController);
};
