import { z } from "zod";

export const getBooksQuerySchema = z.object({
    q: z.string().optional(),
});

export type GetBooksQueryInput = z.infer<typeof getBooksQuerySchema>;

export const getBookByIdParamsSchema = z.object({
    id: z.coerce.number().int().positive("Book ID must be a positive integer."),
});

export type GetBookByIdParamsInput = z.infer<typeof getBookByIdParamsSchema>;
