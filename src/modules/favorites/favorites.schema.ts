import { z } from "zod";

export const favoriteBookParamsSchema = z.object({
    bookId: z.coerce.number({
        message: "bookId must be a valid number.",
    }).int().positive("bookId must be a positive integer."),
});

export type FavoriteBookParamsInput = z.infer<typeof favoriteBookParamsSchema>;
