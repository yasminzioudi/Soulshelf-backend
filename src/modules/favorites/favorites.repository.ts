import { db } from "../../prisma/db";

export const findBookById = async (id: number) => {
    return db.orm.public.Book.where({ id }).first();
};

export const findFavorite = async (userId: number, bookId: number) => {
    return db.orm.public.Favorite.where({ userId, bookId }).first();
};

export const createFavorite = async (data: { userId: number; bookId: number }) => {
    return db.orm.public.Favorite.create({
        userId: data.userId,
        bookId: data.bookId,
    });
};

export const deleteFavorite = async (userId: number, bookId: number) => {
    return db.orm.public.Favorite.where({ userId, bookId }).delete();
};

export const findUserFavoritesByUserId = async (userId: number) => {
    return db.orm.public.Favorite.where({ userId }).include("book").all();
};
