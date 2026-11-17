import { db } from "../../prisma/db";

export const findUserByEmail = async (email: string) => {
    return db.orm.public.User.where({
        email,
    }).first();
};

export const createUser = async (data: {
    email: string;
    passwordHash: string;
    name?: string;
}) => {
    return db.orm.public.User.create(data);
};

// ─── Added for A3: PATCH /users/me ────────────────────────────────────────────

export const findUserById = async (id: number) => {
    return db.orm.public.User.where({ id }).first();
};

export const updateUser = async (
    id: number,
    data: {
        name?: string;
        avatarUrl?: string;
        occupation?: string;
        bio?: string;
    },
) => {
    return db.orm.public.User.where({ id }).update(data);
};