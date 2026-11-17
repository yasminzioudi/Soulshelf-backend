import { findAllBooks, type BookRecord } from "../book/book.repository";
import { db } from "../../prisma/db";
import {
    geminiDiscoveryFilterSchema,
    geminiRecommendationOutputSchema,
    type AIAssistantRequestInput,
    type GeminiDiscoveryFilter,
    type GeminiRecommendationOutput,
} from "./ai.schema";
import { generateGeminiContent, isGeminiConfigured } from "./gemini.service";

// ─── 1. Smart Discovery Service ───────────────────────────────────────────────

export interface SmartDiscoveryResult {
    prompt: string;
    interpretation: string;
    extractedFilters: {
        genres: string[];
        keywords: string[];
        authors: string[];
    };
    books: BookRecord[];
}

export const smartDiscovery = async (prompt: string): Promise<SmartDiscoveryResult> => {
    let extracted: GeminiDiscoveryFilter = {
        genres: [],
        keywords: [],
        authors: [],
        summary: "",
    };

    if (isGeminiConfigured()) {
        try {
            const systemInstruction =
                "You are an intelligent book discovery search analyzer. " +
                "Analyze the user's natural language search request for books. " +
                "Extract any mentioned or implied genres, thematic keywords, and author names. " +
                "Also write a brief 1-sentence interpretation of what kind of books they are looking for. " +
                "Return strictly valid JSON conforming to this structure: " +
                '{"genres": string[], "keywords": string[], "authors": string[], "summary": string}';

            const rawJson = await generateGeminiContent({
                systemInstruction,
                prompt: `Search request: "${prompt}"`,
                jsonOutput: true,
                temperature: 0.2,
                maxOutputTokens: 300,
            });

            const parsed = JSON.parse(rawJson);
            const validated = geminiDiscoveryFilterSchema.safeParse(parsed);
            if (validated.success) {
                extracted = validated.data;
            }
        } catch (err) {
            console.warn("[Smart Discovery] Gemini extraction fallback:", (err as Error).message);
        }
    }

    // Fallback extraction if Gemini was offline or extracted nothing
    if (
        extracted.genres.length === 0 &&
        extracted.keywords.length === 0 &&
        extracted.authors.length === 0
    ) {
        const words = prompt
            .split(/[\s,]+/)
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 2);
        extracted.keywords = words.slice(0, 5);
        extracted.summary = `Books related to "${prompt}"`;
    }

    const interpretation = extracted.summary || `Books matching "${prompt}"`;

    // Fetch catalog from PostgreSQL
    const allBooks = await findAllBooks();

    const normalizedGenres = extracted.genres.map((g) => g.toLowerCase());
    const normalizedAuthors = extracted.authors.map((a) => a.toLowerCase());
    const normalizedKeywords = extracted.keywords.map((k) => k.toLowerCase());
    const rawPromptWords = prompt
        .toLowerCase()
        .split(/[\s,]+/)
        .filter((w) => w.length > 2);

    // Score and filter real books
    const scoredBooks: { book: BookRecord; score: number }[] = [];

    for (const book of allBooks) {
        let score = 0;
        const titleLower = book.title.toLowerCase();
        const genreLower = (book.genre ?? "").toLowerCase();
        const authorLower = (book.author ?? "").toLowerCase();

        // Author match
        for (const author of normalizedAuthors) {
            if (authorLower.includes(author) || author.includes(authorLower)) {
                score += 10;
            }
        }

        // Genre match
        for (const genre of normalizedGenres) {
            if (genreLower.includes(genre) || genre.includes(genreLower)) {
                score += 8;
            }
        }

        // Keyword matches against title, genre, and author
        for (const kw of normalizedKeywords) {
            if (titleLower.includes(kw)) score += 5;
            if (genreLower.includes(kw)) score += 4;
            if (authorLower.includes(kw)) score += 4;
        }

        // Raw prompt words match
        for (const word of rawPromptWords) {
            if (titleLower.includes(word)) score += 3;
            if (genreLower.includes(word)) score += 3;
            if (authorLower.includes(word)) score += 3;
        }

        if (score > 0) {
            scoredBooks.push({ book, score });
        }
    }

    // Sort by relevance score descending
    scoredBooks.sort((a, b) => b.score - a.score);

    // If matches found, return them. Otherwise, return all books or empty if very strict.
    const resultBooks = scoredBooks.length > 0
        ? scoredBooks.map((sb) => sb.book)
        : allBooks.filter((book) => {
            const str = `${book.title} ${book.genre || ""} ${book.author || ""}`.toLowerCase();
            return rawPromptWords.some((word) => str.includes(word));
        });

    return {
        prompt,
        interpretation,
        extractedFilters: {
            genres: extracted.genres,
            keywords: extracted.keywords,
            authors: extracted.authors,
        },
        books: resultBooks.length > 0 ? resultBooks : allBooks.slice(0, 10),
    };
};

// ─── 2. Reader Assistant Service ─────────────────────────────────────────────

export interface ReaderAssistantResult {
    action: "summarize" | "explain" | "simplify" | "ask";
    response: string;
    contextSnippet: string;
}

export const readerAssistant = async (
    input: AIAssistantRequestInput,
): Promise<ReaderAssistantResult> => {
    let textToAnalyze = input.selectedText?.trim() || "";
    let contextTitle = "Selected passage";

    // If no selected text, fetch chapter content
    if (!textToAnalyze && input.chapterId) {
        const chapter = await db.orm.public.Chapter.where({ id: input.chapterId }).first();
        if (chapter && chapter.content) {
            textToAnalyze = chapter.content;
            contextTitle = chapter.title || `Chapter ${chapter.chapterNum}`;
        }
    }

    // If still no text, fetch first chapter of book
    if (!textToAnalyze && input.bookId) {
        const chapters = await db.orm.public.Chapter.where({ bookId: input.bookId }).all();
        if (chapters.length > 0) {
            chapters.sort((a, b) => a.chapterNum - b.chapterNum);
            textToAnalyze = chapters[0].content || "";
            contextTitle = chapters[0].title || `Chapter 1`;
        } else {
            const book = await db.orm.public.Book.where({ id: input.bookId }).first();
            if (book) {
                textToAnalyze = `Book: "${book.title}" by ${book.author || "Unknown"}. Genre: ${book.genre || "General"}.`;
                contextTitle = book.title;
            }
        }
    }

    if (!textToAnalyze) {
        throw new Error("BOOK_NOT_FOUND");
    }

    // Limit text to 3,500 chars to fit fast token budget
    const truncatedText = textToAnalyze.slice(0, 3500);

    const systemInstruction =
        "You are SoulShelf AI, an insightful, concise, and articulate reading assistant. " +
        "You assist readers in understanding literary works, themes, context, and narrative structure. " +
        "Keep your response grounded strictly in the provided passage or context. " +
        "Avoid rambling. Provide structured, polished formatting (e.g. clean bullet points or short paragraphs).";

    let taskPrompt = "";
    switch (input.action) {
        case "summarize":
            taskPrompt =
                `Please provide a concise 3-4 bullet point summary capturing the key events and ideas in the following passage from "${contextTitle}":\n\n` +
                truncatedText;
            break;
        case "explain":
            taskPrompt =
                `Please explain the deeper meaning, literary devices, and narrative context of the following passage from "${contextTitle}":\n\n` +
                truncatedText;
            break;
        case "simplify":
            taskPrompt =
                `Please explain the following passage from "${contextTitle}" in clear, simple everyday English:\n\n` +
                truncatedText;
            break;
        case "ask":
            taskPrompt =
                `The reader has the following question about "${contextTitle}":\n` +
                `Question: "${input.question || "Can you explain what happens here?"}"\n\n` +
                `Based on this passage, provide a clear, helpful answer:\n\n` +
                truncatedText;
            break;
    }

    const aiResponse = await generateGeminiContent({
        systemInstruction,
        prompt: taskPrompt,
        temperature: 0.3,
        maxOutputTokens: 600,
    });

    const snippet = truncatedText.slice(0, 100).replace(/\s+/g, " ") + (truncatedText.length > 100 ? "..." : "");

    return {
        action: input.action,
        response: aiResponse,
        contextSnippet: snippet,
    };
};

// ─── 3. Recommendations Service ──────────────────────────────────────────────

export interface RecommendedBook {
    book: BookRecord;
    reason: string;
}

export const getRecommendations = async (userId: number): Promise<RecommendedBook[]> => {
    // 1. Gather user reading signals
    const [favorites, userBooks, readingProgresses, allBooks] = await Promise.all([
        db.orm.public.Favorite.where({ userId }).include("book").all(),
        db.orm.public.UserBook.where({ userId }).include("book").all(),
        db.orm.public.ReadingProgress.where({ userId }).include("book").all(),
        findAllBooks(),
    ]);

    if (allBooks.length === 0) {
        return [];
    }

    // Compile set of already interacted book IDs
    const interactedBookIds = new Set<number>();
    const preferredGenres = new Set<string>();
    const preferredAuthors = new Set<string>();
    const recentTitles: string[] = [];

    for (const fav of favorites) {
        if (fav.book) {
            interactedBookIds.add(fav.book.id);
            if (fav.book.genre) preferredGenres.add(fav.book.genre);
            if (fav.book.author) preferredAuthors.add(fav.book.author);
        }
    }

    for (const ub of userBooks) {
        if (ub.book) {
            interactedBookIds.add(ub.book.id);
            if (ub.book.genre) preferredGenres.add(ub.book.genre);
            if (ub.book.author) preferredAuthors.add(ub.book.author);
        }
    }

    for (const rp of readingProgresses) {
        if (rp.book) {
            interactedBookIds.add(rp.book.id);
            recentTitles.push(rp.book.title);
            if (rp.book.genre) preferredGenres.add(rp.book.genre);
            if (rp.book.author) preferredAuthors.add(rp.book.author);
        }
    }

    // Candidates: prioritize unread books; if user has touched all, use all books
    let candidates = allBooks.filter((b) => !interactedBookIds.has(b.id));
    if (candidates.length === 0) {
        candidates = allBooks;
    }

    // If Gemini is available, use it for candidate ranking and personalized explanations
    if (isGeminiConfigured() && candidates.length > 0) {
        try {
            const systemInstruction =
                "You are an AI book recommendation engine for SoulShelf. " +
                "You recommend books to readers based on their reading history and taste. " +
                "You will receive a list of candidate books and the user's reading preferences. " +
                "Select up to 5 best recommendations from the candidates list. " +
                "For each recommendation, provide the candidate's exact bookId and a 1-sentence personalized explanation grounded in why they would like it. " +
                "CRITICAL: You MUST only return bookIds that exist in the candidate list. Never invent or hallucinate book IDs. " +
                'Return strictly valid JSON: {"recommendations": [{"bookId": number, "reason": string}]}';

            const userTaste = {
                favoriteGenres: Array.from(preferredGenres),
                favoriteAuthors: Array.from(preferredAuthors),
                recentlyRead: recentTitles.slice(0, 3),
            };

            const candidateList = candidates.map((b) => ({
                bookId: b.id,
                title: b.title,
                author: b.author,
                genre: b.genre,
            }));

            const prompt =
                `User Reading Profile:\n${JSON.stringify(userTaste, null, 2)}\n\n` +
                `Candidate Books:\n${JSON.stringify(candidateList, null, 2)}`;

            const rawJson = await generateGeminiContent({
                systemInstruction,
                prompt,
                jsonOutput: true,
                temperature: 0.3,
                maxOutputTokens: 500,
            });

            const parsed = JSON.parse(rawJson);
            const validated = geminiRecommendationOutputSchema.safeParse(parsed);

            if (validated.success && validated.data.recommendations.length > 0) {
                const bookMap = new Map<number, BookRecord>(candidates.map((b) => [b.id, b]));
                const result: RecommendedBook[] = [];

                for (const rec of validated.data.recommendations) {
                    const matchedBook = bookMap.get(rec.bookId);
                    if (matchedBook) {
                        result.push({
                            book: matchedBook,
                            reason: rec.reason,
                        });
                    }
                }

                if (result.length > 0) {
                    return result;
                }
            }
        } catch (err) {
            console.warn("[Recommendations] Gemini ranking fallback:", (err as Error).message);
        }
    }

    // Grounded Fallback: Rule-based matching with genuine explanations
    const genreList = Array.from(preferredGenres);
    const authorList = Array.from(preferredAuthors);

    const scored = candidates.map((book) => {
        let score = 0;
        let reason = "Recommended based on trending titles on SoulShelf.";

        const matchGenre = book.genre && genreList.some((g) => g.toLowerCase() === book.genre?.toLowerCase());
        const matchAuthor = book.author && authorList.some((a) => a.toLowerCase() === book.author?.toLowerCase());

        if (matchAuthor && matchGenre) {
            score = 10;
            reason = `Because you enjoy ${book.author}'s work and ${book.genre} stories.`;
        } else if (matchAuthor) {
            score = 8;
            reason = `From ${book.author}, an author whose works you have explored.`;
        } else if (matchGenre) {
            score = 6;
            reason = `Because you love stories in the ${book.genre} genre.`;
        } else if (book.isFeatured) {
            score = 4;
            reason = "A handpicked featured discovery chosen for your shelf.";
        }

        return { book, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 5).map(({ book, reason }) => ({ book, reason }));
};
