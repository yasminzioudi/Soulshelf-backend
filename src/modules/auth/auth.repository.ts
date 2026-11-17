import { db } from "../../prisma/db";

// ─── RefreshToken CRUD ─────────────────────────────────────────────────────────


export const createRefreshToken = async (data: {
    tokenHash: string;
    userId: number;
    expiresAt: Date;
}) => {
    return db.orm.public.RefreshToken.create({
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt.toISOString(),
    });
};


export const findRefreshTokenByHash = async (tokenHash: string) => {
    return db.orm.public.RefreshToken.where({ tokenHash }).first();
};


export const revokeRefreshToken = async (id: number) => {
    return db.orm.public.RefreshToken.where({ id }).update({
        revokedAt: new Date().toISOString(),
    });
};

// ─── User look-ups needed by auth ─────────────────────────────────────────────

export const findUserById = async (id: number) => {
    return db.orm.public.User.where({ id }).first();
};

export const findUserByEmail = async (email: string) => {
    return db.orm.public.User.where({ email }).first();
};


export const createGoogleUser = async (data: {
    email: string;
    name?: string;
    avatarUrl?: string;
    googleId: string;
}) => {
    return db.orm.public.User.create({
        email: data.email,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
        googleId: data.googleId,
        passwordHash: null,
    });
};


export const updateUserGoogleId = async (id: number, googleId: string) => {
    return db.orm.public.User.where({ id }).update({ googleId });
};

// ─── Password Reset Code CRUD ──────────────────────────────────────────────────

export const createPasswordResetCode = async (data: {
    userId: number;
    codeHash: string;
    expiresAt: Date;
}) => {
    return db.orm.public.PasswordResetCode.create({
        userId: data.userId,
        codeHash: data.codeHash,
        expiresAt: data.expiresAt.toISOString(),
    });
};

export const findPasswordResetCodeByHash = async (data: {
    userId: number;
    codeHash: string;
}) => {
    return db.orm.public.PasswordResetCode.where({
        userId: data.userId,
        codeHash: data.codeHash,
    }).first();
};

export const markPasswordResetCodeAsUsed = async (id: number) => {
    return db.orm.public.PasswordResetCode.where({ id }).update({
        usedAt: new Date().toISOString(),
    });
};

export const updateUserPassword = async (userId: number, passwordHash: string) => {
    return db.orm.public.User.where({ id: userId }).update({ passwordHash });
};

export const revokeAllUserRefreshTokens = async (userId: number) => {
    return db.orm.public.RefreshToken.where({ userId }).update({
        revokedAt: new Date().toISOString(),
    });
};
