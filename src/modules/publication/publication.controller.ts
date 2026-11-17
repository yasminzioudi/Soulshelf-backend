import type { FastifyReply, FastifyRequest } from "fastify";
import {
    createPublicationSchema,
    publicationIdParamsSchema,
    updatePublicationSchema,
} from "./publication.schema";
import {
    createPublicationService,
    deletePublicationService,
    getAllPublicationsService,
    getMyPublicationsService,
    getPublicationByIdService,
    updatePublicationService,
} from "./publication.service";

export const getAllPublicationsController = async (
    _request: FastifyRequest,
    reply: FastifyReply,
) => {
    const data = await getAllPublicationsService();

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const createPublicationController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const body = createPublicationSchema.parse(request.body);
    const data = await createPublicationService(request.user.id, body);

    return reply.code(201).send({
        success: true,
        data,
    });
};

export const getMyPublicationsController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const data = await getMyPublicationsService(request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getPublicationByIdController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = publicationIdParamsSchema.parse(request.params);
    const data = await getPublicationByIdService(params.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const updatePublicationController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = publicationIdParamsSchema.parse(request.params);
    const body = updatePublicationSchema.parse(request.body);
    const data = await updatePublicationService(request.user.id, params.id, body);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const deletePublicationController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const params = publicationIdParamsSchema.parse(request.params);
    await deletePublicationService(request.user.id, params.id);

    return reply.code(200).send({
        success: true,
        data: { id: params.id },
    });
};
