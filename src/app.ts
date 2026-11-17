import Fastify from "fastify";
import { ZodError } from "zod";
import { authRoutes } from "./modules/auth/auth.routes";
import { bookRoutes } from "./modules/book/book.routes";
import { favoritesRoutes } from "./modules/favorites/favorites.routes";
import { friendsRoutes } from "./modules/friends/friends.routes";
import { libraryRoutes } from "./modules/library/library.routes";
import { messagingRoutes } from "./modules/messaging/messaging.routes";
import { publicationLikesRoutes } from "./modules/publication-likes/publication-likes.routes";
import { publicationRoutes } from "./modules/publication/publication.routes";
import { readerRoutes } from "./modules/reader/reader.routes";
import { reviewRoutes } from "./modules/reviews/review.routes";
import { socialRoutes } from "./modules/social/social.routes";
import { userRoutes } from "./modules/user/user.routes";
import { aiRoutes } from "./modules/ai/ai.routes";

export const app = Fastify({
    logger: true,
});

// ─── Health check ──────────────────────────────────────────────────────────────
app.get("/health", async () => {
    return { status: "ok" };
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.register(userRoutes);
app.register(authRoutes);
app.register(libraryRoutes);
app.register(bookRoutes);
app.register(favoritesRoutes);
app.register(readerRoutes);
app.register(reviewRoutes);
app.register(friendsRoutes);
app.register(publicationRoutes);
app.register(publicationLikesRoutes);
app.register(socialRoutes);
app.register(messagingRoutes);
app.register(aiRoutes);

// ─── Global error handler ──────────────────────────────────────────────────────
app.setErrorHandler((error, _request, reply) => {
    // Zod validation failure
    if (error instanceof ZodError) {
        return reply.code(400).send({
            success: false,
            error: "Validation failed.",
            details: error.issues,
        });
    }

    // Known business-logic errors
    const knownErrors: Record<string, { status: number; message: string }> = {
        EMAIL_ALREADY_EXISTS: { status: 409, message: "An account with this email already exists." },
        INVALID_CREDENTIALS: { status: 401, message: "Invalid email or password." },
        INVALID_REFRESH_TOKEN: { status: 401, message: "Refresh token is invalid." },
        REFRESH_TOKEN_ALREADY_REVOKED: { status: 401, message: "Refresh token has already been revoked." },
        REFRESH_TOKEN_EXPIRED: { status: 401, message: "Refresh token has expired." },
        INVALID_GOOGLE_TOKEN: { status: 401, message: "Google token is invalid." },
        INVALID_RESET_CODE: { status: 400, message: "Invalid or expired verification code." },
        INVALID_RESET_TOKEN: { status: 400, message: "Invalid or expired reset token." },
        BOOK_NOT_FOUND: { status: 404, message: "Book not found." },
        BOOK_ALREADY_IN_LIBRARY: { status: 409, message: "Book is already in your library." },
        BOOK_NOT_IN_LIBRARY: { status: 404, message: "Book is not in your library." },
        FAVORITE_ALREADY_EXISTS: { status: 409, message: "Book is already in your favorites." },
        FAVORITE_NOT_FOUND: { status: 404, message: "Favorite not found." },
        REVIEW_ALREADY_EXISTS: { status: 409, message: "You have already reviewed this book." },
        REVIEW_NOT_FOUND: { status: 404, message: "Review not found." },
        REVIEW_FORBIDDEN: { status: 403, message: "You are not authorized to modify this review." },
        CANNOT_FRIEND_SELF: { status: 400, message: "Cannot send a friend request to yourself." },
        ALREADY_FRIENDS: { status: 409, message: "You are already friends with this user." },
        FRIEND_REQUEST_ALREADY_EXISTS: { status: 409, message: "A pending friend request already exists." },
        FRIEND_REQUEST_NOT_FOUND: { status: 404, message: "Friend request not found." },
        FRIEND_REQUEST_FORBIDDEN: { status: 403, message: "You are not authorized to perform this action on the request." },
        USER_NOT_FOUND: { status: 404, message: "User not found." },
        FRIEND_NOT_FOUND: { status: 404, message: "Friendship not found." },
        PUBLICATION_NOT_FOUND: { status: 404, message: "Publication not found." },
        PUBLICATION_FORBIDDEN: { status: 403, message: "You are not authorized to modify this publication." },
        CANNOT_FOLLOW_SELF: { status: 400, message: "Cannot follow yourself." },
        CANNOT_UNFOLLOW_SELF: { status: 400, message: "Cannot unfollow yourself." },
        FOLLOW_ALREADY_EXISTS: { status: 409, message: "You are already following this user." },
        CANNOT_MESSAGE_SELF: { status: 400, message: "Cannot start a conversation with yourself." },
        NOT_CONVERSATION_MEMBER: { status: 403, message: "You are not a member of this conversation." },
        CONVERSATION_NOT_FOUND: { status: 404, message: "Conversation not found." },
        EMPTY_MESSAGE: { status: 400, message: "Message content cannot be empty." },
        GEMINI_NOT_CONFIGURED: { status: 503, message: "AI features are temporarily unavailable. Gemini API key is not configured." },
        GEMINI_TIMEOUT: { status: 504, message: "AI service request timed out. Please try again." },
        GEMINI_SERVICE_UNAVAILABLE: { status: 503, message: "AI service is currently unavailable. Please try again later." },
        GEMINI_API_ERROR: { status: 502, message: "AI service encountered an upstream error." },
    };

    const known = knownErrors[(error as Error).message];
    if (known) {
        return reply.code(known.status).send({
            success: false,
            error: known.message,
        });
    }

    // Unhandled errors — log and return generic 500
    app.log.error(error);
    return reply.code(500).send({
        success: false,
        error: "Internal server error.",
    });
});