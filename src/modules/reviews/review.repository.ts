import { db } from "../../prisma/db";

export const findBookById = async (id: number) => {
    return db.orm.public.Book.where({ id }).first();
};

export const findReviewById = async (id: number) => {
    return db.orm.public.Review.where({ id }).first();
};

export const findUserReviewForBook = async (userId: number, bookId: number) => {
    return db.orm.public.Review.where({ userId, bookId }).first();
};

export const findReviewsByBookId = async (bookId: number) => {
    const reviews = await db.orm.public.Review.where({ bookId }).include("user").all();
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createReview = async (data: {
    userId: number;
    bookId: number;
    rating: number;
    comment?: string | null;
}) => {
    return db.orm.public.Review.create({
        userId: data.userId,
        bookId: data.bookId,
        rating: data.rating,
        comment: data.comment ?? null,
    });
};

export const updateReview = async (
    id: number,
    data: { rating?: number; comment?: string | null },
) => {
    await db.orm.public.Review.where({ id }).update({
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
        ...(data.comment !== undefined ? { comment: data.comment } : {}),
    });
    return db.orm.public.Review.where({ id }).first();
};

export const deleteReview = async (id: number) => {
    return db.orm.public.Review.where({ id }).delete();
};
