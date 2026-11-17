import crypto from "crypto";
import jwt from "jsonwebtoken";

// ─── Access Token ──────────────────────────────────────────────────────────────
// Short-lived (15 min). JWT_SECRET is read at call time (not at module load)
// to ensure dotenv has already been initialised regardless of import order.

const getJwtSecret = (): string => {
    const secret = process.env["JWT_SECRET"];
    if (!secret) throw new Error("JWT_SECRET is not set in environment variables.");
    return secret;
};

export interface AccessTokenPayload {
    sub: number;   // user id (int)
    email: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    return jwt.verify(token, getJwtSecret()) as unknown as AccessTokenPayload;
};

// ─── Refresh Token ─────────────────────────────────────────────────────────────
// Long-lived (30 days). Generated as random bytes (384 bits of entropy).
//
// Storage strategy: tokenHash = SHA-256(raw token hex).
// Rationale: the raw token is 384 random bits — it is not a password derived
// from user input, so bcrypt's slow KDF adds no security benefit. SHA-256
// allows a fast, exact-match DB lookup. Only the hash is stored; the raw token
// is returned once to the client and never persisted in plaintext.

const REFRESH_TOKEN_BYTES = 48; // 384 bits of entropy
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const hashRefreshToken = (raw: string): string => {
    return crypto.createHash("sha256").update(raw).digest("hex");
};

export const generateRefreshToken = (): {
    raw: string;
    hash: string;
    expiresAt: Date;
} => {
    const raw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const hash = hashRefreshToken(raw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    return { raw, hash, expiresAt };
};

// ─── Temporary Password Reset Token ───────────────────────────────────────────
// Short-lived (10 min) JWT issued after verifying OTP code.

export interface PasswordResetTokenPayload {
    sub: number;
    purpose: "password_reset";
}

export const signPasswordResetToken = (userId: number): string => {
    return jwt.sign({ sub: userId, purpose: "password_reset" }, getJwtSecret(), { expiresIn: "10m" });
};

export const verifyPasswordResetToken = (token: string): PasswordResetTokenPayload => {
    const payload = jwt.verify(token, getJwtSecret()) as unknown as PasswordResetTokenPayload;
    if (!payload || payload.purpose !== "password_reset") {
        throw new Error("INVALID_RESET_TOKEN");
    }
    return payload;
};
