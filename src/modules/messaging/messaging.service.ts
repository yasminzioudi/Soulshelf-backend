import { db } from "../../prisma/db";
import {
    createDirectConversation,
    createMessage,
    findDirectConversationBetween,
    getConversationsForUser,
    getMessagesForConversation,
    isConversationMember,
} from "./messaging.repository";

export const getOrCreateDirectConversation = async (currentUserId: number, targetUserId: number) => {
    if (currentUserId === targetUserId) {
        throw new Error("CANNOT_MESSAGE_SELF");
    }

    const targetUser = await db.orm.public.User.where({ id: targetUserId }).first();
    if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
    }

    let conv = await findDirectConversationBetween(currentUserId, targetUserId);
    if (!conv) {
        conv = await createDirectConversation(currentUserId, targetUserId);
    }

    return {
        conversationId: conv.id,
        otherUser: {
            id: targetUser.id,
            name: targetUser.name || "User",
            avatarUrl: targetUser.avatarUrl,
        },
    };
};

export const listConversationsForUser = async (currentUserId: number) => {
    return await getConversationsForUser(currentUserId);
};

export const getConversationMessages = async (currentUserId: number, conversationId: number) => {
    const isMember = await isConversationMember(conversationId, currentUserId);
    if (!isMember) {
        throw new Error("NOT_CONVERSATION_MEMBER");
    }

    return await getMessagesForConversation(conversationId);
};

export const sendMessage = async (currentUserId: number, conversationId: number, content: string) => {
    if (!content.trim()) {
        throw new Error("EMPTY_MESSAGE");
    }

    const isMember = await isConversationMember(conversationId, currentUserId);
    if (!isMember) {
        throw new Error("NOT_CONVERSATION_MEMBER");
    }

    return await createMessage(conversationId, currentUserId, content.trim());
};
