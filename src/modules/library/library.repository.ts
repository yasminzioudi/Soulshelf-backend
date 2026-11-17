import { db } from "../../prisma/db";

export const findBookById = async (id: number) => {
    return db.orm.public.Book.where({ id }).first();
};

export const findUserBook = async (userId: number, bookId: number) => {
    return db.orm.public.UserBook.where({ userId, bookId }).first();
};

export const createUserBook = async (data: {
    userId: number;
    bookId: number;
    status?: string;
}) => {
    return db.orm.public.UserBook.create({
        userId: data.userId,
        bookId: data.bookId,
        status: data.status ?? "OWNED",
    });
};

export const deleteUserBook = async (userId: number, bookId: number) => {
    return db.orm.public.UserBook.where({ userId, bookId }).delete();
};

export const findUserBooksByUserId = async (userId: number) => {
    return db.orm.public.UserBook.where({ userId }).include('book').all();
};
