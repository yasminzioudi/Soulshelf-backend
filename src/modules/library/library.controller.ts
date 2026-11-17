import type { FastifyReply, FastifyRequest } from "fastify";
import { addToUserLibrary, getUserLibrary, removeFromUserLibrary } from "./library.service";
import { addToLibrarySchema, removeFromLibraryParamsSchema } from "./library.schema";

export const getLibraryController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const data = await getUserLibrary(request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const addToLibraryController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = addToLibrarySchema.parse(request.body);

    const data = await addToUserLibrary(request.user.id, input);

    return reply.code(201).send({
        success: true,
        data,
    });
};

export const removeFromLibraryController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = removeFromLibraryParamsSchema.parse(request.params);

    const data = await removeFromUserLibrary(request.user.id, params.bookId);

    return reply.code(200).send({
        success: true,
        data,
    });
};
