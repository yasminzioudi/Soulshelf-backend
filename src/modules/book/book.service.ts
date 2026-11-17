import { findAllBooks, findBookById, findFeaturedBooks } from "./book.repository";

export const searchBooks = async (query?: string, limit: number = 20) => {
    const allBooks = await findAllBooks();

    // Sort deterministically by ID ascending
    const sorted = [...allBooks].sort((a, b) => a.id - b.id);

    const q = query?.trim().toLowerCase();
    if (!q) {
        return sorted.slice(0, limit).map(mapBookResponse);
    }

    const filtered = sorted.filter((book) => {
        const titleMatches = book.title.toLowerCase().includes(q);
        const authorMatches = book.author ? book.author.toLowerCase().includes(q) : false;
        const genreMatches = book.genre ? book.genre.toLowerCase().includes(q) : false;
        return titleMatches || authorMatches || genreMatches;
    });

    return filtered.slice(0, limit).map(mapBookResponse);
};

export const getFeaturedBooks = async (limit: number = 20) => {
    const books = await findFeaturedBooks();
    const sorted = [...books].sort((a, b) => b.id - a.id);
    return sorted.slice(0, limit).map(mapBookResponse);
};

export const getBookDetails = async (id: number) => {
    const book = await findBookById(id);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    return mapBookResponse(book);
};

const mapBookResponse = (book: {
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
}) => ({
    id: book.id,
    title: book.title,
    genre: book.genre,
    author: book.author,
    coverColor: book.coverColor,
    coverImage: book.coverImage,
    publishedYear: book.publishedYear ?? null,
    language: book.language ?? null,
    pages: book.pages ?? null,
    isFeatured: book.isFeatured ?? false,
});
