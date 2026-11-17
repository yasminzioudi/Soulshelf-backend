import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../utils/token";

declare module "fastify" {
    interface FastifyRequest {
        user: {
            id: number;
            email: string;
        };
    }
}

export const authenticate = async (
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> => {
    const authHeader = request.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.code(401).send({
            success: false,
            error: "Missing or invalid Authorization header.",
        });
    }

    const token = authHeader.slice(7); // strip "Bearer "

    try {
        const payload = verifyAccessToken(token);
        request.user = { id: payload.sub, email: payload.email };
    } catch {
        return reply.code(401).send({
            success: false,
            error: "Access token is invalid or has expired.",
        });
    }
};
