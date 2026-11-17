import { z } from "zod";

export const getBookChaptersParamsSchema = z.object({
  id: z.coerce.number({
    message: "bookId must be a valid number.",
  }).int().positive("bookId must be a positive integer."),
});

export const getReadingProgressParamsSchema = z.object({
  bookId: z.coerce.number({
    message: "bookId must be a valid number.",
  }).int().positive("bookId must be a positive integer."),
});

export const updateReadingProgressParamsSchema = z.object({
  bookId: z.coerce.number({
    message: "bookId must be a valid number.",
  }).int().positive("bookId must be a positive integer."),
});

export const updateReadingProgressBodySchema = z.object({
  currentChapter: z.number({
    message: "currentChapter must be a valid number.",
  }).int().positive("currentChapter must be a positive integer."),
});

export type GetBookChaptersParamsInput = z.infer<typeof getBookChaptersParamsSchema>;
export type GetReadingProgressParamsInput = z.infer<typeof getReadingProgressParamsSchema>;
export type UpdateReadingProgressParamsInput = z.infer<typeof updateReadingProgressParamsSchema>;
export type UpdateReadingProgressBodyInput = z.infer<typeof updateReadingProgressBodySchema>;
