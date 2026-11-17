import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    acceptFriendRequestController,
    getFriendRequestsController,
    getFriendsController,
    rejectFriendRequestController,
    removeFriendController,
    searchUsersController,
    sendFriendRequestController,
} from "./friends.controller";

export const friendsRoutes = async (app: FastifyInstance) => {
    // GET /users/search — search users by name (protected)
    app.get(
        "/users/search",
        { preHandler: authenticate },
        searchUsersController,
    );

    // GET /friends/me — get accepted friends for authenticated user (protected)
    app.get(
        "/friends/me",
        { preHandler: authenticate },
        getFriendsController,
    );

    // GET /friends/me/requests — get pending incoming & outgoing friend requests (protected)
    // NOTE: Must be registered before /friends/me/:userId parameterized route!
    app.get(
        "/friends/me/requests",
        { preHandler: authenticate },
        getFriendRequestsController,
    );

    // POST /friends/me/requests/:userId — send friend request (protected)
    app.post(
        "/friends/me/requests/:userId",
        { preHandler: authenticate },
        sendFriendRequestController,
    );

    // POST /friends/me/requests/:requestId/accept — accept friend request (protected)
    app.post(
        "/friends/me/requests/:requestId/accept",
        { preHandler: authenticate },
        acceptFriendRequestController,
    );

    // POST /friends/me/requests/:requestId/reject — reject friend request (protected)
    app.post(
        "/friends/me/requests/:requestId/reject",
        { preHandler: authenticate },
        rejectFriendRequestController,
    );

    // DELETE /friends/me/:userId — remove friend (protected)
    app.delete(
        "/friends/me/:userId",
        { preHandler: authenticate },
        removeFriendController,
    );
};
