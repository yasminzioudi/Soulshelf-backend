import { z } from "zod";

// ─── 1. Smart Discovery ─────────────────────────────────────────────────────────

export const smartDiscoveryRequestSchema = z.object({
    prompt: z.string().trim().min(2, "Prompt must be at least 2 characters.").max(300, "Prompt cannot exceed 300 characters."),
});

export type SmartDiscoveryRequestInput = z.infer<typeof smartDiscoveryRequestSchema>;

// Strict internal schema parsed from Gemini's JSON output
export const geminiDiscoveryFilterSchema = z.object({
    genres: z.array(z.string().trim()).max(5).default([]),
    keywords: z.array(z.string().trim()).max(5).default([]),
    authors: z.array(z.string().trim()).max(3).default([]),
    summary: z.string().trim().max(150).optional(),
});

export type GeminiDiscoveryFilter = z.infer<typeof geminiDiscoveryFilterSchema>;

// ─── 2. Reader Assistant / Summary ──────────────────────────────────────────────

export const aiActionEnum = z.enum(["summarize", "explain", "simplify", "ask"]);

export const aiAssistantRequestSchema = z.object({
    action: aiActionEnum,
    bookId: z.number().int().positive().optional(),
    chapterId: z.number().int().positive().optional(),
    selectedText: z.string().trim().max(4000).optional(),
    question: z.string().trim().max(300).optional(),
}).refine(
    (data) => Boolean(data.selectedText || data.chapterId || data.bookId),
    { message: "Either selectedText, chapterId, or bookId must be provided." },
);

export type AIAssistantRequestInput = z.infer<typeof aiAssistantRequestSchema>;

// ─── 3. Recommendations ────────────────────────────────────────────────────────

// Strict internal schema parsed from Gemini's JSON output for candidate ranking
export const geminiRecommendationOutputSchema = z.object({
    recommendations: z.array(
        z.object({
            bookId: z.number().int().positive(),
            reason: z.string().trim().max(200),
        }),
    ).max(6).default([]),
});

export type GeminiRecommendationOutput = z.infer<typeof geminiRecommendationOutputSchema>;
