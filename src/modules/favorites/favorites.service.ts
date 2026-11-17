import {
    createFavorite,
    deleteFavorite,
    findBookById,
    findFavorite,
    findUserFavoritesByUserId,
} from "./favorites.repository";

export const getUserFavorites = async (userId: number) => {
    const favorites = await findUserFavoritesByUserId(userId);

    return favorites.map((item) => {
        const book = item.book;
        return {
            id: item.id,
            createdAt: item.createdAt,
            bookId: item.bookId,
            title: book?.title ?? null,
            author: book?.author ?? null,
            genre: book?.genre ?? null,
            coverColor: book?.coverColor ?? null,
            coverImage: book?.coverImage ?? null,
            book: book
                ? {
                      id: book.id,
                      title: book.title,
                      genre: book.genre,
                      author: book.author,
                      coverColor: book.coverColor,
                      coverImage: book.coverImage,
                  }
                : null,
        };
    });
};

export const addBookToFavorites = async (userId: number, bookId: number) => {
    const book = await findBookById(bookId);
    if (!book) {
        throw new Error("BOOK_NOT_FOUND");
    }

    const existingFavorite = await findFavorite(userId, bookId);
    if (existingFavorite) {
        throw new Error("FAVORITE_ALREADY_EXISTS");
    }

    const favorite = await createFavorite({
        userId,
        bookId,
    });

    return {
        id: favorite.id,
        createdAt: favorite.createdAt,
        bookId: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        coverColor: book.coverColor,
        coverImage: book.coverImage,
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

export const removeBookFromFavorites = async (userId: number, bookId: number) => {
    const existingFavorite = await findFavorite(userId, bookId);
    if (!existingFavorite) {
        throw new Error("FAVORITE_NOT_FOUND");
    }

    await deleteFavorite(userId, bookId);

    return {
        message: "Favorite removed successfully.",
    };
};
