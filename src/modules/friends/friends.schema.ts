import { z } from "zod";

export const searchUsersQuerySchema = z.object({
    q: z.string().trim().min(1, "Search query must not be empty.").max(100),
});

export const sendFriendRequestParamsSchema = z.object({
    userId: z.coerce.number({
        message: "userId must be a valid number.",
    }).int().positive("userId must be a positive integer."),
});

export const friendRequestActionParamsSchema = z.object({
    requestId: z.coerce.number({
        message: "requestId must be a valid number.",
    }).int().positive("requestId must be a positive integer."),
});

export const removeFriendParamsSchema = z.object({
    userId: z.coerce.number({
        message: "userId must be a valid number.",
    }).int().positive("userId must be a positive integer."),
});

export type SearchUsersQueryInput = z.infer<typeof searchUsersQuerySchema>;
export type SendFriendRequestParamsInput = z.infer<typeof sendFriendRequestParamsSchema>;
export type FriendRequestActionParamsInput = z.infer<typeof friendRequestActionParamsSchema>;
export type RemoveFriendParamsInput = z.infer<typeof removeFriendParamsSchema>;
