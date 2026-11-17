import type { FastifyReply, FastifyRequest } from "fastify";
import {
    getBookChapters,
    getLatestUserReadingProgress,
    getUserReadingProgress,
    updateUserReadingProgress,
} from "./reader.service";
import {
    getBookChaptersParamsSchema,
    getReadingProgressParamsSchema,
    updateReadingProgressBodySchema,
    updateReadingProgressParamsSchema,
} from "./reader.schema";

export const getChaptersController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = getBookChaptersParamsSchema.parse(request.params);
    const data = await getBookChapters(params.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getReadingProgressController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = getReadingProgressParamsSchema.parse(request.params);
    const data = await getUserReadingProgress(request.user.id, params.bookId);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getLatestReadingProgressController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const data = await getLatestUserReadingProgress(request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const updateReadingProgressController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = updateReadingProgressParamsSchema.parse(request.params);
    const body = updateReadingProgressBodySchema.parse(request.body);

    const data = await updateUserReadingProgress(
        request.user.id,
        params.bookId,
        body.currentChapter,
    );

    return reply.code(200).send({
        success: true,
        data,
    });
};
