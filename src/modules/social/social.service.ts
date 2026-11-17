import { db } from "../../prisma/db";
import {
    createFollow,
    deleteFollow,
    findFollow,
    getDiscoverWriters,
    getFollowers,
    getFollowing,
    getUserFollowCounts,
    searchUsersByName,
} from "./social.repository";

export const followUser = async (followerId: number, targetUserId: number) => {
    if (followerId === targetUserId) {
        throw new Error("CANNOT_FOLLOW_SELF");
    }

    const targetUser = await db.orm.public.User.where({ id: targetUserId }).first();
    if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
    }

    const existing = await findFollow(followerId, targetUserId);
    if (existing) {
        throw new Error("FOLLOW_ALREADY_EXISTS");
    }
    await createFollow(followerId, targetUserId);

    const counts = await getUserFollowCounts(targetUserId);
    return {
        isFollowing: true,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
    };
};

export const unfollowUser = async (followerId: number, targetUserId: number) => {
    if (followerId === targetUserId) {
        throw new Error("CANNOT_UNFOLLOW_SELF");
    }

    await deleteFollow(followerId, targetUserId);

    const counts = await getUserFollowCounts(targetUserId);
    return {
        isFollowing: false,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
    };
};

export const getFollowStatus = async (currentUserId: number, targetUserId: number) => {
    const targetUser = await db.orm.public.User.where({ id: targetUserId }).first();
    if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
    }

    const follow = await findFollow(currentUserId, targetUserId);
    const counts = await getUserFollowCounts(targetUserId);

    return {
        isFollowing: !!follow,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
    };
};

export const fetchFollowers = async (targetUserId: number) => {
    return await getFollowers(targetUserId);
};

export const fetchFollowing = async (targetUserId: number) => {
    return await getFollowing(targetUserId);
};

export const searchPeople = async (query: string, currentUserId: number) => {
    return await searchUsersByName(query, currentUserId);
};

export const fetchDiscoverWriters = async (currentUserId: number) => {
    return await getDiscoverWriters(currentUserId);
};
