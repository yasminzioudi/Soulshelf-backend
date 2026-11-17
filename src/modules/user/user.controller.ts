import type { FastifyReply, FastifyRequest } from "fastify";
import { signup } from "./user.service";
import { signupSchema } from "./user.schema";
import { updateMeSchema } from "./user-patch.schema";
import { findUserById, updateUser } from "./user.repository";
import { findFollow, getUserFollowCounts } from "../social/social.repository";
import { findPublicationsByAuthorInDb } from "../publication/publication.repository";

// ─── Existing: POST /auth/signup ───────────────────────────────────────────────

export const signupController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = signupSchema.parse(request.body);

    const user = await signup(input);

    return reply.code(201).send({
        success: true,
        data: user,
    });
};

// ─── GET /users/me ─────────────────────────────────────────────────────────────

export const meController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const user = await findUserById(request.user.id);

    if (!user) {
        return reply.code(404).send({
            success: false,
            error: "User not found.",
        });
    }

    return reply.code(200).send({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            occupation: user.occupation ?? null,
            bio: user.bio ?? null,
        },
    });
};

// ─── GET /users/:userId (Public User Profile) ──────────────────────────────────

export const getUserProfileController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const currentUserId = request.user.id;
    const { userId: targetUserIdStr } = request.params as { userId: string };
    const targetUserId = parseInt(targetUserIdStr, 10);

    if (isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Invalid user ID." });
    }

    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
        return reply.code(404).send({ success: false, error: "User not found." });
    }

    const followCounts = await getUserFollowCounts(targetUserId);
    const follow = await findFollow(currentUserId, targetUserId);
    const publications = await findPublicationsByAuthorInDb(targetUserId);

    return reply.code(200).send({
        success: true,
        data: {
            id: targetUser.id,
            name: targetUser.name ?? "User",
            avatarUrl: targetUser.avatarUrl,
            occupation: targetUser.occupation ?? null,
            bio: targetUser.bio ?? null,
            followersCount: followCounts.followersCount,
            followingCount: followCounts.followingCount,
            isFollowing: !!follow,
            isSelf: currentUserId === targetUserId,
            publications,
        },
    });
};

// ─── A3: PATCH /users/me ──────────────────────────────────────────────────────

export const updateMeController = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const input = updateMeSchema.parse(request.body);

    const patch: { name?: string; avatarUrl?: string; occupation?: string; bio?: string } = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.avatarUrl !== undefined) patch.avatarUrl = input.avatarUrl;
    if (input.occupation !== undefined) patch.occupation = input.occupation;
    if (input.bio !== undefined) patch.bio = input.bio;

    if (Object.keys(patch).length === 0) {
        return reply.code(400).send({
            success: false,
            error: "No updatable fields provided.",
        });
    }

    const updated = await updateUser(request.user.id, patch);

    if (!updated) {
        return reply.code(404).send({
            success: false,
            error: "User not found.",
        });
    }

    return reply.code(200).send({
        success: true,
        data: {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            avatarUrl: updated.avatarUrl,
            occupation: updated.occupation ?? null,
            bio: updated.bio ?? null,
        },
    });
};