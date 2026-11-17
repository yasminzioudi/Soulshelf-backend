import { db } from "../../prisma/db";

export interface PublicUserDto {
    id: number;
    name: string;
    avatarUrl: string | null;
}

export const findUserById = async (id: number) => {
    return db.orm.public.User.where({ id }).first();
};

export const searchUsersByName = async (query: string, currentUserId: number): Promise<PublicUserDto[]> => {
    const users = await db.orm.public.User.all();
    const qLower = query.toLowerCase();

    return users
        .filter((u) => u.id !== currentUserId && u.name && u.name.toLowerCase().includes(qLower))
        .slice(0, 20)
        .map((u) => ({
            id: u.id,
            name: u.name ?? "User",
            avatarUrl: u.avatarUrl,
        }));
};

export const findFriendRequestBetweenUsers = async (userAId: number, userBId: number) => {
    const requests = await db.orm.public.FriendRequest.all();
    return (
        requests.find(
            (r) =>
                (r.senderId === userAId && r.receiverId === userBId) ||
                (r.senderId === userBId && r.receiverId === userAId),
        ) || null
    );
};

export const findFriendRequestById = async (id: number) => {
    return db.orm.public.FriendRequest.where({ id }).first();
};

export const createFriendRequest = async (senderId: number, receiverId: number) => {
    return db.orm.public.FriendRequest.create({
        senderId,
        receiverId,
        status: "PENDING",
    });
};

export const updateFriendRequestStatus = async (
    id: number,
    status: string,
    senderId?: number,
    receiverId?: number,
) => {
    await db.orm.public.FriendRequest.where({ id }).update({
        status,
        ...(senderId ? { senderId } : {}),
        ...(receiverId ? { receiverId } : {}),
    });
    return db.orm.public.FriendRequest.where({ id }).first();
};

export const findAcceptedFriendsForUser = async (userId: number): Promise<PublicUserDto[]> => {
    const allAccepted = await db.orm.public.FriendRequest.where({ status: "ACCEPTED" }).all();
    const userAccepted = allAccepted.filter(
        (r) => r.senderId === userId || r.receiverId === userId,
    );

    const friendIds = userAccepted.map((r) => (r.senderId === userId ? r.receiverId : r.senderId));
    if (friendIds.length === 0) return [];

    const users = await db.orm.public.User.all();
    return users
        .filter((u) => friendIds.includes(u.id))
        .map((u) => ({
            id: u.id,
            name: u.name ?? "User",
            avatarUrl: u.avatarUrl,
        }));
};

export const findPendingRequestsForUser = async (userId: number) => {
    const allPending = await db.orm.public.FriendRequest.where({ status: "PENDING" }).all();
    const incomingRequests = allPending.filter((r) => r.receiverId === userId);
    const outgoingRequests = allPending.filter((r) => r.senderId === userId);

    const users = await db.orm.public.User.all();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const incoming = incomingRequests
        .map((req) => {
            const sender = userMap.get(req.senderId);
            return {
                id: req.id,
                createdAt: req.createdAt,
                sender: sender
                    ? {
                          id: sender.id,
                          name: sender.name ?? "User",
                          avatarUrl: sender.avatarUrl,
                      }
                    : null,
            };
        })
        .filter((req): req is { id: number; createdAt: string; sender: PublicUserDto } => req.sender !== null);

    const outgoing = outgoingRequests
        .map((req) => {
            const receiver = userMap.get(req.receiverId);
            return {
                id: req.id,
                createdAt: req.createdAt,
                receiver: receiver
                    ? {
                          id: receiver.id,
                          name: receiver.name ?? "User",
                          avatarUrl: receiver.avatarUrl,
                      }
                    : null,
            };
        })
        .filter((req): req is { id: number; createdAt: string; receiver: PublicUserDto } => req.receiver !== null);

    return { incoming, outgoing };
};

export const deleteAcceptedFriendship = async (userAId: number, userBId: number): Promise<boolean> => {
    const allAccepted = await db.orm.public.FriendRequest.where({ status: "ACCEPTED" }).all();
    const match = allAccepted.find(
        (r) =>
            (r.senderId === userAId && r.receiverId === userBId) ||
            (r.senderId === userBId && r.receiverId === userAId),
    );
    if (!match) return false;
    await db.orm.public.FriendRequest.where({ id: match.id }).delete();
    return true;
};
