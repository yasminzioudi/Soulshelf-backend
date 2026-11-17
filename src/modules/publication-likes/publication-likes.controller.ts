import type { FastifyReply, FastifyRequest } from "fastify";
import {
    getPublicationLikeStatus,
    likePublication,
    unlikePublication,
} from "./publication-likes.service";

export const likePublicationController = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = request.user.id;
        const { id } = request.params as { id: string };
        const publicationId = parseInt(id, 10);
        if (isNaN(publicationId)) {
            return reply.code(400).send({ success: false, error: "Invalid publication ID" });
        }

        const result = await likePublication(userId, publicationId);
        return reply.send({ success: true, data: result });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ success: false, error: err?.message || "Internal server error." });
    }
};

export const unlikePublicationController = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = request.user.id;
        const { id } = request.params as { id: string };
        const publicationId = parseInt(id, 10);
        if (isNaN(publicationId)) {
            return reply.code(400).send({ success: false, error: "Invalid publication ID" });
        }

        const result = await unlikePublication(userId, publicationId);
        return reply.send({ success: true, data: result });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ success: false, error: err?.message || "Internal server error." });
    }
};

export const getPublicationLikeStatusController = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = request.user.id;
        const { id } = request.params as { id: string };
        const publicationId = parseInt(id, 10);
        if (isNaN(publicationId)) {
            return reply.code(400).send({ success: false, error: "Invalid publication ID" });
        }

        const result = await getPublicationLikeStatus(userId, publicationId);
        return reply.send({ success: true, data: result });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ success: false, error: err?.message || "Internal server error." });
    }
};
