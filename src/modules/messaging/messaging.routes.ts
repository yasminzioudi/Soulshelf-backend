import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";
import {
    createConversationController,
    getMessagesController,
    listConversationsController,
    sendMessageController,
} from "./messaging.controller";

export const messagingRoutes = async (app: FastifyInstance) => {
    app.post("/conversations", { preHandler: [authenticate] }, createConversationController);
    app.get("/conversations", { preHandler: [authenticate] }, listConversationsController);
    app.get("/conversations/:conversationId/messages", { preHandler: [authenticate] }, getMessagesController);
    app.post("/conversations/:conversationId/messages", { preHandler: [authenticate] }, sendMessageController);
};
