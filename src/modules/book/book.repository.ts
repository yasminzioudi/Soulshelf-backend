import { db } from "../../prisma/db";

export interface BookRecord {
    id: number;
    title: string;
    genre: string | null;
    author: string | null;
    coverColor: string | null;
    coverImage: string | null;
    publishedYear?: number | null;
    language?: string | null;
    pages?: number | null;
    isFeatured?: boolean;
    createdAt?: string;
}

export const findAllBooks = async (): Promise<BookRecord[]> => {
    return db.orm.public.Book.all();
};

export const findFeaturedBooks = async (): Promise<BookRecord[]> => {
    return db.orm.public.Book.where({ isFeatured: true }).all();
};

export const findBookById = async (id: number): Promise<BookRecord | null> => {
    const book = await db.orm.public.Book.where({ id }).first();
    return book ?? null;
};
