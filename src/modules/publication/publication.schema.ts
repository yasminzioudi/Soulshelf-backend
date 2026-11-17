import { z } from "zod";

export const createPublicationSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
    description: z.string().trim().optional(),
    genre: z.string().trim().min(1, "Genre is required").max(100, "Genre cannot exceed 100 characters"),
    language: z.string().trim().optional().default("English"),
    publishedYear: z.number().int().optional(),
    pages: z.number().int().positive().optional(),
    coverUrl: z.string().trim().optional(),
    content: z.string().optional(),
});

export const updatePublicationSchema = z.object({
    title: z.string().trim().min(1, "Title cannot be empty").max(200, "Title cannot exceed 200 characters").optional(),
    description: z.string().trim().optional().nullable(),
    genre: z.string().trim().min(1, "Genre cannot be empty").max(100, "Genre cannot exceed 100 characters").optional(),
    language: z.string().trim().optional(),
    publishedYear: z.number().int().optional().nullable(),
    pages: z.number().int().positive().optional().nullable(),
    coverUrl: z.string().trim().optional().nullable(),
    content: z.string().optional().nullable(),
});

export const publicationIdParamsSchema = z.object({
    id: z.string().transform((val, ctx) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid publication ID",
            });
            return z.NEVER;
        }
        return parsed;
    }),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
