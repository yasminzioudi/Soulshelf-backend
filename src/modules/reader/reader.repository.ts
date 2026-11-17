import { db } from "../../prisma/db";

export const findBookById = async (id: number) => {
    return db.orm.public.Book.where({ id }).first();
};

export const findChaptersByBookId = async (bookId: number) => {
    const chapters = await db.orm.public.Chapter.where({ bookId }).all();
    return chapters.sort((a, b) => a.chapterNum - b.chapterNum);
};

export const findReadingProgress = async (userId: number, bookId: number) => {
    return db.orm.public.ReadingProgress.where({ userId, bookId }).first();
};

export const findLatestReadingProgressByUserId = async (userId: number) => {
    const items = await db.orm.public.ReadingProgress.where({ userId }).include("book").all();
    if (items.length === 0) return null;
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return items[0];
};

export const saveReadingProgress = async (
    userId: number,
    bookId: number,
    currentChapter: number,
) => {
    const existing = await db.orm.public.ReadingProgress.where({ userId, bookId }).first();
    if (existing) {
        await db.orm.public.ReadingProgress.where({ id: existing.id }).update({
            currentChapter,
        });
    } else {
        await db.orm.public.ReadingProgress.create({
            userId,
            bookId,
            currentChapter,
        });
    }
    const updated = await db.orm.public.ReadingProgress.where({ userId, bookId }).first();
    return updated!;
};
