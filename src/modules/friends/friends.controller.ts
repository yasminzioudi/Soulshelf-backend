import type { FastifyReply, FastifyRequest } from "fastify";
import {
    friendRequestActionParamsSchema,
    removeFriendParamsSchema,
    searchUsersQuerySchema,
    sendFriendRequestParamsSchema,
} from "./friends.schema";
import {
    acceptFriendRequestService,
    getFriendRequestsService,
    getFriendsService,
    rejectFriendRequestService,
    removeFriendService,
    searchUsersService,
    sendFriendRequestService,
} from "./friends.service";

export const searchUsersController = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = searchUsersQuerySchema.parse(request.query);
    const data = await searchUsersService(query.q, request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getFriendsController = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await getFriendsService(request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const getFriendRequestsController = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await getFriendRequestsService(request.user.id);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const sendFriendRequestController = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = sendFriendRequestParamsSchema.parse(request.params);
    const data = await sendFriendRequestService(request.user.id, params.userId);

    return reply.code(201).send({
        success: true,
        data,
    });
};

export const acceptFriendRequestController = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = friendRequestActionParamsSchema.parse(request.params);
    const data = await acceptFriendRequestService(request.user.id, params.requestId);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const rejectFriendRequestController = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = friendRequestActionParamsSchema.parse(request.params);
    const data = await rejectFriendRequestService(request.user.id, params.requestId);

    return reply.code(200).send({
        success: true,
        data,
    });
};

export const removeFriendController = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = removeFriendParamsSchema.parse(request.params);
    const data = await removeFriendService(request.user.id, params.userId);

    return reply.code(200).send({
        success: true,
        data,
    });
};
