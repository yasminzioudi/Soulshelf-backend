import { db } from "../../prisma/db";

export interface ConversationSummaryDto {
    id: number;
    otherUser: {
        id: number;
        name: string;
        avatarUrl: string | null;
    };
    latestMessage: string | null;
    latestMessageCreatedAt: string | null;
    unreadCount: number;
}

export interface MessageDto {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: string;
}

export const findDirectConversationBetween = async (userId1: number, userId2: number) => {
    const allMembers = await db.orm.public.ConversationMember.all();
    const user1ConvIds = allMembers.filter((m) => m.userId === userId1).map((m) => m.conversationId);
    const commonConvId = user1ConvIds.find((cId) =>
        allMembers.some((m) => m.conversationId === cId && m.userId === userId2),
    );

    if (!commonConvId) return null;

    const conv = await db.orm.public.Conversation.where({ id: commonConvId }).first();
    return conv || null;
};

export const createDirectConversation = async (userId1: number, userId2: number) => {
    const conv = await db.orm.public.Conversation.create({});
    await db.orm.public.ConversationMember.create({ conversationId: conv.id, userId: userId1 });
    await db.orm.public.ConversationMember.create({ conversationId: conv.id, userId: userId2 });
    return conv;
};

const toIsoString = (val: string | Date | null | undefined): string | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toISOString();
};

export const getConversationsForUser = async (userId: number): Promise<ConversationSummaryDto[]> => {
    const allMembers = await db.orm.public.ConversationMember.all();
    const myMemberships = allMembers.filter((m) => m.userId === userId);
    if (myMemberships.length === 0) return [];

    const myConvIds = myMemberships.map((m) => m.conversationId);

    const allConvs = await db.orm.public.Conversation.all();
    const myConvs = allConvs.filter((c) => myConvIds.includes(c.id));

    const users = await db.orm.public.User.all();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const allMessages = await db.orm.public.Message.all();

    const summaries: ConversationSummaryDto[] = myConvs.map((conv) => {
        const convMembers = allMembers.filter((m) => m.conversationId === conv.id);
        const otherMember = convMembers.find((m) => m.userId !== userId);
        const otherUserObj = otherMember ? userMap.get(otherMember.userId) : null;

        const convMessages = allMessages
            .filter((m) => m.conversationId === conv.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const latestMsg = convMessages[0];

        return {
            id: conv.id,
            otherUser: {
                id: otherUserObj?.id ?? 0,
                name: otherUserObj?.name ?? "User",
                avatarUrl: otherUserObj?.avatarUrl ?? null,
            },
            latestMessage: latestMsg ? latestMsg.content : null,
            latestMessageCreatedAt: latestMsg ? toIsoString(latestMsg.createdAt) : null,
            unreadCount: 0,
        };
    });

    return summaries.sort((a, b) => {
        const timeA = a.latestMessageCreatedAt ? new Date(a.latestMessageCreatedAt).getTime() : 0;
        const timeB = b.latestMessageCreatedAt ? new Date(b.latestMessageCreatedAt).getTime() : 0;
        return timeB - timeA;
    });
};

export const getConversationById = async (conversationId: number) => {
    return await db.orm.public.Conversation.where({ id: conversationId }).first();
};

export const isConversationMember = async (conversationId: number, userId: number) => {
    const members = await db.orm.public.ConversationMember.where({ conversationId, userId }).all();
    return members.length > 0;
};

export const getMessagesForConversation = async (conversationId: number): Promise<MessageDto[]> => {
    const messages = await db.orm.public.Message.where({ conversationId }).all();
    return messages
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((m) => ({
            id: m.id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            content: m.content,
            createdAt: toIsoString(m.createdAt) || new Date().toISOString(),
        }));
};

export const createMessage = async (conversationId: number, senderId: number, content: string): Promise<MessageDto> => {
    const message = await db.orm.public.Message.create({
        conversationId,
        senderId,
        content,
    });

    await db.orm.public.Conversation.where({ id: conversationId }).update({
        updatedAt: message.createdAt,
    });

    return {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: toIsoString(message.createdAt) || new Date().toISOString(),
    };
};

