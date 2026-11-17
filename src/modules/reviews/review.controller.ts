import type { FastifyReply, FastifyRequest } from "fastify";
import {
    addBookReview,
    getBookReviews,
    modifyReview,
    removeReview,
} from "./review.service";
import {
    createReviewBodySchema,
    createReviewParamsSchema,
    deleteReviewParamsSchema,
    getBookReviewsParamsSchema,
    updateReviewBodySchema,
    updateReviewParamsSchema,
} from "./review.schema";

export const getBookReviewsController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = getBookReviewsParamsSchema.parse(request.params);
    const data = await getBookReviews(params.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const createReviewController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = createReviewParamsSchema.parse(request.params);
    const body = createReviewBodySchema.parse(request.body);

    const data = await addBookReview(
        request.user.id,
        params.id,
        body.rating,
        body.comment,
    );

    return reply.code(201).send({
        success: true,
        data,
    });
};

export const updateReviewController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = updateReviewParamsSchema.parse(request.params);
    const body = updateReviewBodySchema.parse(request.body);

    const data = await modifyReview(request.user.id, params.id, body);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const deleteReviewController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = deleteReviewParamsSchema.parse(request.params);
    const data = await removeReview(request.user.id, params.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};
