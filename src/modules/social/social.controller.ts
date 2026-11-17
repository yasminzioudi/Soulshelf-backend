import type { FastifyReply, FastifyRequest } from "fastify";
import {
    fetchDiscoverWriters,
    fetchFollowers,
    fetchFollowing,
    followUser,
    getFollowStatus,
    searchPeople,
    unfollowUser,
} from "./social.service";

export const followUserController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { userId } = request.params as { userId: string };
    const targetUserId = parseInt(userId, 10);
    if (isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Invalid user ID" });
    }

    const result = await followUser(currentUserId, targetUserId);
    return reply.send({ success: true, data: result });
};

export const unfollowUserController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { userId } = request.params as { userId: string };
    const targetUserId = parseInt(userId, 10);
    if (isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Invalid user ID" });
    }

    const result = await unfollowUser(currentUserId, targetUserId);
    return reply.send({ success: true, data: result });
};

export const getFollowStatusController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { userId } = request.params as { userId: string };
    const targetUserId = parseInt(userId, 10);
    if (isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Invalid user ID" });
    }

    const result = await getFollowStatus(currentUserId, targetUserId);
    return reply.send({ success: true, data: result });
};

export const getFollowersController = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const targetUserId = parseInt(userId, 10);
    if (isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Invalid user ID" });
    }

    const followers = await fetchFollowers(targetUserId);
    return reply.send({ success: true, data: followers });
};

export const getFollowingController = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const targetUserId = parseInt(userId, 10);
    if (isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Invalid user ID" });
    }

    const following = await fetchFollowing(targetUserId);
    return reply.send({ success: true, data: following });
};

export const searchPeopleController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { q } = (request.query as { q?: string }) || {};
    const query = q || "";
    const users = await searchPeople(query, currentUserId);
    return reply.send({ success: true, data: users });
};

export const discoverWritersController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const writers = await fetchDiscoverWriters(currentUserId);
    return reply.send({ success: true, data: writers });
};
