import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    discoverWritersController,
    followUserController,
    getFollowersController,
    getFollowingController,
    getFollowStatusController,
    searchPeopleController,
    unfollowUserController,
} from "./social.controller";

export const socialRoutes = async (app: FastifyInstance) => {
    app.post("/social/follow/:userId", { preHandler: [authenticate] }, followUserController);
    app.delete("/social/follow/:userId", { preHandler: [authenticate] }, unfollowUserController);
    app.post("/social/unfollow/:userId", { preHandler: [authenticate] }, unfollowUserController);
    app.get("/social/status/:userId", { preHandler: [authenticate] }, getFollowStatusController);
    app.get("/social/followers/:userId", { preHandler: [authenticate] }, getFollowersController);
    app.get("/social/following/:userId", { preHandler: [authenticate] }, getFollowingController);
    app.get("/social/search", { preHandler: [authenticate] }, searchPeopleController);
    app.get("/social/discover/writers", { preHandler: [authenticate] }, discoverWritersController);
};
