import type { FastifyReply, FastifyRequest } from "fastify";
import { getBookByIdParamsSchema, getBooksQuerySchema } from "./book.schema";
import { getBookDetails, getFeaturedBooks, searchBooks } from "./book.service";

export const getBooksController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const query = getBooksQuerySchema.parse(request.query);
    const data = await searchBooks(query.q);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getFeaturedBooksController = async (
    _request: FastifyRequest,
    reply: FastifyReply,
) => {
    const data = await getFeaturedBooks();

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getBookByIdController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = getBookByIdParamsSchema.parse(request.params);
    const data = await getBookDetails(params.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};
