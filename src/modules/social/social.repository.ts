import { db } from "../../prisma/db";

export interface PublicUserDto {
    id: number;
    name: string;
    avatarUrl: string | null;
    occupation?: string | null;
    bio?: string | null;
}

export interface DiscoverWriterDto {
    id: number;
    name: string;
    avatarUrl: string | null;
    occupation: string | null;
    followersCount: number;
    publicationsCount: number;
}

export const findFollow = async (followerId: number, followingId: number) => {
    const follows = await db.orm.public.Follow.where({ followerId, followingId }).all();
    return follows[0] || null;
};

export const createFollow = async (followerId: number, followingId: number) => {
    return await db.orm.public.Follow.create({
        followerId,
        followingId,
    });
};

export const deleteFollow = async (followerId: number, followingId: number) => {
    await db.orm.public.Follow.where({ followerId, followingId }).delete();
};

export const getUserFollowCounts = async (userId: number) => {
    const allFollows = await db.orm.public.Follow.all();
    const followersCount = allFollows.filter((f) => f.followingId === userId).length;
    const followingCount = allFollows.filter((f) => f.followerId === userId).length;
    return { followersCount, followingCount };
};

export const getFollowers = async (userId: number) => {
    const follows = await db.orm.public.Follow.where({ followingId: userId }).all();
    const followerIds = follows.map((f) => f.followerId);
    if (followerIds.length === 0) return [];

    const users = await db.orm.public.User.all();
    return users
        .filter((u) => followerIds.includes(u.id))
        .map((u) => ({
            id: u.id,
            name: u.name ?? "User",
            avatarUrl: u.avatarUrl,
            occupation: u.occupation,
        }));
};

export const getFollowing = async (userId: number) => {
    const follows = await db.orm.public.Follow.where({ followerId: userId }).all();
    const followingIds = follows.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const users = await db.orm.public.User.all();
    return users
        .filter((u) => followingIds.includes(u.id))
        .map((u) => ({
            id: u.id,
            name: u.name ?? "User",
            avatarUrl: u.avatarUrl,
            occupation: u.occupation,
        }));
};

export const searchUsersByName = async (query: string, currentUserId: number) => {
    if (!query.trim()) return [];
    const qLower = query.trim().toLowerCase();
    const users = await db.orm.public.User.all();
    return users
        .filter((u) => u.id !== currentUserId && u.name && u.name.toLowerCase().includes(qLower))
        .slice(0, 20)
        .map((u) => ({
            id: u.id,
            name: u.name ?? "User",
            avatarUrl: u.avatarUrl,
            occupation: u.occupation,
            bio: u.bio,
        }));
};

export const getDiscoverWriters = async (currentUserId: number): Promise<DiscoverWriterDto[]> => {
    const users = await db.orm.public.User.all();
    const publications = await db.orm.public.Publication.all();
    const follows = await db.orm.public.Follow.all();

    const writers = users.filter((u) => u.id !== currentUserId && publications.some((p) => p.authorId === u.id));

    return writers.slice(0, 20).map((u) => {
        const pubCount = publications.filter((p) => p.authorId === u.id).length;
        const folCount = follows.filter((f) => f.followingId === u.id).length;
        return {
            id: u.id,
            name: u.name || "Anonymous",
            avatarUrl: u.avatarUrl,
            occupation: u.occupation,
            followersCount: folCount,
            publicationsCount: pubCount,
        };
    });
};
