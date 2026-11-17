import { Resend } from "resend";

const getResendClient = () => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
        console.warn("[email] RESEND_API_KEY is not configured.");
        return null;
    }
    return new Resend(apiKey);
};

export const sendPasswordResetEmail = async (to: string, code: string): Promise<void> => {
    const resend = getResendClient();
    if (!resend) {
        console.warn(`[email] Skipping sending email to ${to} (no API key). Code: ${code}`);
        return;
    }

    try {
        await resend.emails.send({
            from: "SoulShelf <onboarding@resend.dev>",
            to,
            subject: "Your SoulShelf Password Reset Code",
            text: `Your password reset code is: ${code}\n\nThis code will expire in 15 minutes.\nIf you did not request a password reset, please ignore this email.`,
        });
        console.log(`[email] Password reset code sent to ${to}`);
    } catch (err) {
        console.error("[email] Failed sending password reset email via Resend:", err);
    }
};
