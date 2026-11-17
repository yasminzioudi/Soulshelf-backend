import type { FastifyReply, FastifyRequest } from "fastify";
import {
    aiAssistantRequestSchema,
    smartDiscoveryRequestSchema,
} from "./ai.schema";
import {
    getRecommendations,
    readerAssistant,
    smartDiscovery,
} from "./ai.service";

export const smartDiscoveryController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = smartDiscoveryRequestSchema.parse(request.body);
    const data = await smartDiscovery(input.prompt);
    return reply.code(200).send({
        success: true,
        data,
    });
};

export const readerAssistantController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = aiAssistantRequestSchema.parse(request.body);
    const data = await readerAssistant(input);
    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getRecommendationsController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const userId = (request as any).user.id as number;
    const data = await getRecommendations(userId);
    return reply.code(200).send({
        success: true,
        data,
    });
};
