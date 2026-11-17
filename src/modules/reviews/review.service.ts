import {
    createReview,
    deleteReview,
    findBookById,
    findReviewById,
    findReviewsByBookId,
    findUserReviewForBook,
    updateReview,
} from "./review.repository";

const toIsoString = (val: string | Date | null | undefined): string => {
    if (!val) return new Date().toISOString();
    if (val instanceof Date) return val.toISOString();
    const str = String(val).trim();
    let normalized = str.replace(" ", "T");
    normalized = normalized.replace(/([+-]\d{2})$/, "$1:00");
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? str : d.toISOString();
};

export const getBookReviews = async (bookId: number) => {
    const book = await findBookById(bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const reviews = await findReviewsByBookId(bookId);
    const count = reviews.length;
    const averageRating =
        count > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
            : 0;

    const formattedReviews = reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        bookId: r.bookId,
        rating: r.rating,
        comment: r.comment,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
        user: r.user
            ? {
                  id: r.user.id,
                  name: r.user.name,
                  avatarUrl: r.user.avatarUrl,
              }
            : null,
    }));

    return {
        count,
        averageRating,
        reviews: formattedReviews,
    };
};

export const addBookReview = async (
    userId: number,
    bookId: number,
    rating: number,
    comment?: string | null,
) => {
    const book = await findBookById(bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const existing = await findUserReviewForBook(userId, bookId);
    if (existing) {
        throw new Error("REVIEW_ALREADY_EXISTS");
    }

    const review = await createReview({
        userId,
        bookId,
        rating,
        comment,
    });

    return {
        id: review.id,
        userId: review.userId,
        bookId: review.bookId,
        rating: review.rating,
        comment: review.comment,
        createdAt: toIsoString(review.createdAt),
        updatedAt: toIsoString(review.updatedAt),
    };
};

export const modifyReview = async (
    userId: number,
    reviewId: number,
    data: { rating?: number; comment?: string | null },
) => {
    const review = await findReviewById(reviewId);
    if (!review) {
        throw new Error("REVIEW_NOT_FOUND");
    }

    if (review.userId !== userId) {
        throw new Error("REVIEW_FORBIDDEN");
    }

    const updated = await updateReview(reviewId, data);

    return {
        id: updated!.id,
        userId: updated!.userId,
        bookId: updated!.bookId,
        rating: updated!.rating,
        comment: updated!.comment,
        createdAt: toIsoString(updated!.createdAt),
        updatedAt: toIsoString(updated!.updatedAt),
    };
};

export const removeReview = async (userId: number, reviewId: number) => {
    const review = await findReviewById(reviewId);
    if (!review) {
        throw new Error("REVIEW_NOT_FOUND");
    }

    if (review.userId !== userId) {
        throw new Error("REVIEW_FORBIDDEN");
    }

    await deleteReview(reviewId);

    return {
        message: "Review deleted successfully.",
    };
};
