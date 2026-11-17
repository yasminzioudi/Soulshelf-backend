import { z } from "zod";

export const addToLibrarySchema = z.object({
    bookId: z.number({
        message: "bookId must be a valid number.",
    }).int().positive("bookId must be a positive integer."),
    status: z.enum(["OWNED", "READING", "WISHLIST", "COMPLETED"]).optional().default("OWNED"),
});

export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;

export const removeFromLibraryParamsSchema = z.object({
    bookId: z.coerce.number({
        message: "bookId must be a valid number.",
    }).int().positive("bookId must be a positive integer."),
});

export type RemoveFromLibraryParamsInput = z.infer<typeof removeFromLibraryParamsSchema>;
