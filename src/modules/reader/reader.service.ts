import {
    findBookById,
    findChaptersByBookId,
    findLatestReadingProgressByUserId,
    findReadingProgress,
    saveReadingProgress,
} from "./reader.repository";

export const getBookChapters = async (bookId: number) => {
    const book = await findBookById(bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const chapters = await findChaptersByBookId(bookId);

    return chapters.map((ch) => ({
        id: ch.id,
        bookId: ch.bookId,
        chapterNum: ch.chapterNum,
        title: ch.title,
        content: ch.content,
        createdAt: ch.createdAt,
    }));
};

export const getUserReadingProgress = async (userId: number, bookId: number) => {
    const book = await findBookById(bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const progress = await findReadingProgress(userId, bookId);

    if (!progress) {
        return {
            bookId,
            currentChapter: 1,
            updatedAt: null,
        };
    }

    return {
        id: progress.id,
        bookId: progress.bookId,
        currentChapter: progress.currentChapter,
        updatedAt: progress.updatedAt,
    };
};

export const getLatestUserReadingProgress = async (userId: number) => {
    const progress = await findLatestReadingProgressByUserId(userId);
    if (!progress) {
        return null;
    }

    const book = progress.book;
    return {
        id: progress.id,
        bookId: progress.bookId,
        currentChapter: progress.currentChapter,
        updatedAt: progress.updatedAt,
        book: book
            ? {
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  genre: book.genre,
                  coverColor: book.coverColor,
                  coverImage: book.coverImage,
              }
            : null,
    };
};

export const updateUserReadingProgress = async (
    userId: number,
    bookId: number,
    currentChapter: number,
) => {
    const book = await findBookById(bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const progress = await saveReadingProgress(userId, bookId, currentChapter);

    return {
        id: progress.id,
        bookId: progress.bookId,
        currentChapter: progress.currentChapter,
        updatedAt: progress.updatedAt,
    };
};
