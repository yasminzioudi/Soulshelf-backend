import {
    createFriendRequest,
    deleteAcceptedFriendship,
    findAcceptedFriendsForUser,
    findFriendRequestBetweenUsers,
    findFriendRequestById,
    findPendingRequestsForUser,
    findUserById,
    searchUsersByName,
    updateFriendRequestStatus,
} from "./friends.repository";

export const searchUsersService = async (query: string, currentUserId: number) => {
    return searchUsersByName(query, currentUserId);
};

export const getFriendsService = async (userId: number) => {
    return findAcceptedFriendsForUser(userId);
};

export const getFriendRequestsService = async (userId: number) => {
    return findPendingRequestsForUser(userId);
};

export const sendFriendRequestService = async (currentUserId: number, targetUserId: number) => {
    if (currentUserId === targetUserId) {
        throw new Error("CANNOT_FRIEND_SELF");
    }

    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
    }

    const existing = await findFriendRequestBetweenUsers(currentUserId, targetUserId);

    if (existing) {
        if (existing.status === "ACCEPTED") {
            throw new Error("ALREADY_FRIENDS");
        }

        if (existing.status === "PENDING") {
            if (existing.senderId === currentUserId) {
                throw new Error("FRIEND_REQUEST_ALREADY_EXISTS");
            }
            // Reversed pending request: targetUser already requested currentUserId
            // Accept the request cleanly
            const updated = await updateFriendRequestStatus(existing.id, "ACCEPTED");
            return updated;
        }

        if (existing.status === "REJECTED") {
            // Re-open request cleanly
            const updated = await updateFriendRequestStatus(
                existing.id,
                "PENDING",
                currentUserId,
                targetUserId,
            );
            return updated;
        }
    }

    return createFriendRequest(currentUserId, targetUserId);
};

export const acceptFriendRequestService = async (currentUserId: number, requestId: number) => {
    const request = await findFriendRequestById(requestId);
    if (!request) {
        throw new Error("FRIEND_REQUEST_NOT_FOUND");
    }

    if (request.receiverId !== currentUserId) {
        throw new Error("FRIEND_REQUEST_FORBIDDEN");
    }

    if (request.status === "ACCEPTED") {
        return request;
    }

    return updateFriendRequestStatus(requestId, "ACCEPTED");
};

export const rejectFriendRequestService = async (currentUserId: number, requestId: number) => {
    const request = await findFriendRequestById(requestId);
    if (!request) {
        throw new Error("FRIEND_REQUEST_NOT_FOUND");
    }

    if (request.receiverId !== currentUserId) {
        throw new Error("FRIEND_REQUEST_FORBIDDEN");
    }

    return updateFriendRequestStatus(requestId, "REJECTED");
};

export const removeFriendService = async (currentUserId: number, targetUserId: number) => {
    const removed = await deleteAcceptedFriendship(currentUserId, targetUserId);
    if (!removed) {
        throw new Error("FRIEND_NOT_FOUND");
    }
    return { message: "Friend removed successfully." };
};
