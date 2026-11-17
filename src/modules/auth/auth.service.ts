import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { sendPasswordResetEmail } from "../../utils/email";
import { comparePassword, hashPassword } from "../../utils/hash";
import {
    generateRefreshToken,
    hashRefreshToken,
    signAccessToken,
    signPasswordResetToken,
    verifyPasswordResetToken,
} from "../../utils/token";
import {
    createGoogleUser,
    createPasswordResetCode,
    createRefreshToken,
    findPasswordResetCodeByHash,
    findRefreshTokenByHash,
    findUserByEmail,
    markPasswordResetCodeAsUsed,
    revokeAllUserRefreshTokens,
    revokeRefreshToken,
    updateUserGoogleId,
    updateUserPassword,
} from "./auth.repository";
import type {
    ForgotPasswordInput,
    GoogleAuthInput,
    LoginInput,
    LogoutInput,
    ResetPasswordInput,
    VerifyResetCodeInput,
} from "./auth.schema";

// ─── Shared helper: issue an access token + refresh token pair ─────────────────

const issueTokenPair = async (userId: number, email: string) => {
    const accessToken = signAccessToken({ sub: userId, email });
    const { raw: refreshToken, hash, expiresAt } = generateRefreshToken();

    await createRefreshToken({ tokenHash: hash, userId, expiresAt });

    return { accessToken, refreshToken };
};

// ─── A1: POST /auth/login ──────────────────────────────────────────────────────

export const login = async (input: LoginInput) => {
    const user = await findUserByEmail(input.email);

    // Generic error: do NOT reveal whether email or password is wrong.
    if (!user || !user.passwordHash) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatch = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatch) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const tokens = await issueTokenPair(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        ...tokens,
    };
};

// ─── A2: POST /auth/logout ─────────────────────────────────────────────────────
// The client sends back the raw refresh token it received at login.
// We hash it (SHA-256) to find the matching DB record, then revoke it.

export const logout = async (input: LogoutInput) => {
    const tokenHash = hashRefreshToken(input.refreshToken);
    const record = await findRefreshTokenByHash(tokenHash);

    if (!record) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (record.revokedAt !== null) {
        throw new Error("REFRESH_TOKEN_ALREADY_REVOKED");
    }

    if (new Date(record.expiresAt) < new Date()) {
        throw new Error("REFRESH_TOKEN_EXPIRED");
    }

    await revokeRefreshToken(record.id);
};

// ─── A4: POST /auth/google ─────────────────────────────────────────────────────
// Receives a Google idToken, verifies it with Google's servers,
// then finds or creates the user and issues a token pair.
// GOOGLE_CLIENT_ID is read at call time (not at module load) to ensure
// dotenv is initialised regardless of import order.

export const googleAuth = async (input: GoogleAuthInput) => {
    const googleClientId = process.env["GOOGLE_CLIENT_ID"];
    const googleIosClientId = process.env["GOOGLE_IOS_CLIENT_ID"];

    if (!googleClientId) {
        throw new Error("GOOGLE_CLIENT_ID is not set in environment variables.");
    }

    const audiences: string[] = [googleClientId];
    if (googleIosClientId) {
        audiences.push(googleIosClientId);
    }

    const googleClient = new OAuth2Client();

    const ticket = await googleClient.verifyIdToken({
        idToken: input.idToken,
        audience: audiences.length === 1 ? audiences[0] : audiences,
    });

    const googlePayload = ticket.getPayload();
    if (!googlePayload || !googlePayload.email) {
        throw new Error("INVALID_GOOGLE_TOKEN");
    }

    const { sub: googleId, email, name, picture: avatarUrl } = googlePayload;

    let user = await findUserByEmail(email);

    if (user) {
        // Existing account: link Google if not already linked
        if (!user.googleId) {
            await updateUserGoogleId(user.id, googleId);
        }
    } else {
        // New user via Google — no password
        user = await createGoogleUser({
            email,
            name: name ?? undefined,
            avatarUrl: avatarUrl ?? undefined,
            googleId,
        });
    }

    const tokens = await issueTokenPair(user.id, user.email);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        ...tokens,
    };
};

// ─── Forgot Password Flow ───────────────────────────────────────────────────────

export const forgotPassword = async (input: ForgotPasswordInput) => {
    const genericResponse = {
        success: true,
        message: "If an account exists, a code has been sent.",
    };

    const user = await findUserByEmail(input.email);
    if (!user) {
        return genericResponse;
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashRefreshToken(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await createPasswordResetCode({
        userId: user.id,
        codeHash,
        expiresAt,
    });

    await sendPasswordResetEmail(user.email, code);

    return genericResponse;
};

export const verifyResetCode = async (input: VerifyResetCodeInput) => {
    const user = await findUserByEmail(input.email);
    if (!user) {
        throw new Error("INVALID_RESET_CODE");
    }

    const codeHash = hashRefreshToken(input.code);
    const record = await findPasswordResetCodeByHash({
        userId: user.id,
        codeHash,
    });

    if (!record || record.usedAt !== null || new Date(record.expiresAt) < new Date()) {
        throw new Error("INVALID_RESET_CODE");
    }

    await markPasswordResetCodeAsUsed(record.id);

    const resetToken = signPasswordResetToken(user.id);
    return { resetToken };
};

export const resetPassword = async (input: ResetPasswordInput) => {
    let payload;
    try {
        payload = verifyPasswordResetToken(input.resetToken);
    } catch {
        throw new Error("INVALID_RESET_TOKEN");
    }

    const userId = payload.sub;
    const newPasswordHash = await hashPassword(input.newPassword);

    await updateUserPassword(userId, newPasswordHash);
    await revokeAllUserRefreshTokens(userId);

    return { success: true };
};
