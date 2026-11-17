import type { FastifyReply, FastifyRequest } from "fastify";
import {
    getConversationMessages,
    getOrCreateDirectConversation,
    listConversationsForUser,
    sendMessage,
} from "./messaging.service";

export const createConversationController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { targetUserId } = (request.body as { targetUserId?: number }) || {};
    if (!targetUserId || isNaN(targetUserId)) {
        return reply.code(400).send({ success: false, error: "Target user ID is required" });
    }

    const result = await getOrCreateDirectConversation(currentUserId, targetUserId);
    return reply.status(201).send({ success: true, data: result });
};

export const listConversationsController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const conversations = await listConversationsForUser(currentUserId);
    return reply.send({ success: true, data: conversations });
};

export const getMessagesController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { conversationId: convIdStr } = request.params as { conversationId: string };
    const conversationId = parseInt(convIdStr, 10);
    if (isNaN(conversationId)) {
        return reply.code(400).send({ success: false, error: "Invalid conversation ID" });
    }

    const messages = await getConversationMessages(currentUserId, conversationId);
    return reply.send({ success: true, data: messages });
};

export const sendMessageController = async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
    const { conversationId: convIdStr } = request.params as { conversationId: string };
    const conversationId = parseInt(convIdStr, 10);
    const { content } = (request.body as { content?: string }) || {};

    if (isNaN(conversationId)) {
        return reply.code(400).send({ success: false, error: "Invalid conversation ID" });
    }

    if (!content || !content.trim()) {
        return reply.code(400).send({ success: false, error: "Message content cannot be empty" });
    }

    const message = await sendMessage(currentUserId, conversationId, content);
    return reply.status(201).send({ success: true, data: message });
};
