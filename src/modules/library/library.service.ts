import {
    createUserBook,
    deleteUserBook,
    findBookById,
    findUserBook,
    findUserBooksByUserId,
} from "./library.repository";
import type { AddToLibraryInput } from "./library.schema";

export const getUserLibrary = async (userId: number) => {
    const userBooks = await findUserBooksByUserId(userId);

    return userBooks.map((item) => ({
        id: item.id,
        status: item.status,
        addedAt: item.addedAt,
        book: item.book
            ? {
                  id: item.book.id,
                  title: item.book.title,
                  genre: item.book.genre,
                  author: item.book.author,
                  coverColor: item.book.coverColor,
                  coverImage: item.book.coverImage,
              }
            : null,
    }));
};

export const addToUserLibrary = async (
    userId: number,
    input: AddToLibraryInput,
) => {
    const book = await findBookById(input.bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const existingUserBook = await findUserBook(userId, input.bookId);
    if (existingUserBook) {
        throw new Error("BOOK_ALREADY_IN_LIBRARY");
    }

    const userBook = await createUserBook({
        userId,
        bookId: input.bookId,
        status: input.status,
    });

    return {
        id: userBook.id,
        status: userBook.status,
        addedAt: userBook.addedAt,
        book: {
            id: book.id,
            title: book.title,
            genre: book.genre,
            author: book.author,
            coverColor: book.coverColor,
            coverImage: book.coverImage,
        },
    };
};

export const removeFromUserLibrary = async (
    userId: number,
    bookId: number,
) => {
    const existingUserBook = await findUserBook(userId, bookId);
    if (!existingUserBook) {
        throw new Error("BOOK_NOT_IN_LIBRARY");
    }

    await deleteUserBook(userId, bookId);

    return {
        message: "Book removed from library.",
    };
};
