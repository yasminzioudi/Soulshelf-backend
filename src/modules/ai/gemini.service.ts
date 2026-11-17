
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const TIMEOUT_MS = 12_000;

export const isGeminiConfigured = (): boolean => {
    const key = process.env["GEMINI_API_KEY"];
    return Boolean(key && key.trim().length > 0);
};

export const getGeminiApiKey = (): string => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key || key.trim().length === 0) {
        throw new Error("GEMINI_NOT_CONFIGURED");
    }
    return key.trim();
};

export interface GenerateTextOptions {
    prompt: string;
    systemInstruction?: string;
    jsonOutput?: boolean;
    temperature?: number;
    maxOutputTokens?: number;
}

export const generateGeminiContent = async ({
    prompt,
    systemInstruction,
    jsonOutput = false,
    temperature = 0.2,
    maxOutputTokens = 1000,
}: GenerateTextOptions): Promise<string> => {
    const apiKey = getGeminiApiKey();
    const endpoint = `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

    const requestBody: any = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature,
            maxOutputTokens,
        },
    };

    if (jsonOutput) {
        requestBody.generationConfig.responseMimeType = "application/json";
    }

    if (systemInstruction) {
        requestBody.systemInstruction = {
            parts: [{ text: systemInstruction }],
        };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            console.error(`[Gemini API Error] Status: ${response.status}`, errText);
            throw new Error("GEMINI_API_ERROR");
        }

        const data: any = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (!text || typeof text !== "string") {
            throw new Error("GEMINI_EMPTY_RESPONSE");
        }

        return text.trim();
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
            throw new Error("GEMINI_TIMEOUT");
        }
        if (err.message === "GEMINI_NOT_CONFIGURED" || err.message === "GEMINI_API_ERROR" || err.message === "GEMINI_EMPTY_RESPONSE") {
            throw err;
        }
        console.error("[Gemini Request Error]", err);
        throw new Error("GEMINI_SERVICE_UNAVAILABLE");
    }
};
