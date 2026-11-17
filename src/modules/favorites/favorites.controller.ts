import type { FastifyReply, FastifyRequest } from "fastify";
import { addBookToFavorites, getUserFavorites, removeBookFromFavorites } from "./favorites.service";
import { favoriteBookParamsSchema } from "./favorites.schema";

export const getFavoritesController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const data = await getUserFavorites(request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const addFavoriteController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = favoriteBookParamsSchema.parse(request.params);

    const data = await addBookToFavorites(request.user.id, params.bookId);

    return reply.code(201).send({
        success: true,
        data,
    });
};

export const removeFavoriteController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = favoriteBookParamsSchema.parse(request.params);

    const data = await removeBookFromFavorites(request.user.id, params.bookId);

    return reply.code(200).send({
        success: true,
        data,
    });
};
