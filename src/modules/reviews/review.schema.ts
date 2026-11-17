import { z } from "zod";

export const getBookReviewsParamsSchema = z.object({
  id: z.coerce.number({
    message: "bookId must be a valid number.",
  }).int().positive("bookId must be a positive integer."),
});

export const createReviewParamsSchema = z.object({
  id: z.coerce.number({
    message: "bookId must be a valid number.",
  }).int().positive("bookId must be a positive integer."),
});

export const createReviewBodySchema = z.object({
  rating: z.number({
    message: "rating must be an integer between 1 and 5.",
  }).int().min(1).max(5),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters.").optional().nullable(),
});

export const updateReviewParamsSchema = z.object({
  id: z.coerce.number({
    message: "reviewId must be a valid number.",
  }).int().positive("reviewId must be a positive integer."),
});

export const updateReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters.").optional().nullable(),
});

export const deleteReviewParamsSchema = z.object({
  id: z.coerce.number({
    message: "reviewId must be a valid number.",
  }).int().positive("reviewId must be a positive integer."),
});

export type GetBookReviewsParamsInput = z.infer<typeof getBookReviewsParamsSchema>;
export type CreateReviewParamsInput = z.infer<typeof createReviewParamsSchema>;
export type CreateReviewBodyInput = z.infer<typeof createReviewBodySchema>;
export type UpdateReviewParamsInput = z.infer<typeof updateReviewParamsSchema>;
export type UpdateReviewBodyInput = z.infer<typeof updateReviewBodySchema>;
export type DeleteReviewParamsInput = z.infer<typeof deleteReviewParamsSchema>;
