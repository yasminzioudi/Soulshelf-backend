import { z } from "zod";


export const updateMeSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z
        .string()
        .refine(
            (v) => v.startsWith("data:image/") || /^https?:\/\//i.test(v),
            { message: "avatarUrl must be an HTTP URL or an image data URI." },
        )
        .optional(),
    occupation: z.string().max(100, "Occupation must be at most 100 characters.").optional(),
    bio: z.string().max(500, "Bio must be at most 500 characters.").optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
