import { db } from "./prisma/db";
import { signAccessToken } from "./utils/token";
import { app } from "./app";

async function runPublicationTests() {
    console.log("=== RUNNING GATE 2B PUBLICATION BACKEND TESTS ===");

    // 1. Create User A and User B
    const userA = await db.orm.public.User.create({
        email: `author_a_${Date.now()}@example.com`,
        passwordHash: "secret_hash_a",
        name: "Author Alice",
        occupation: "Writer",
    });

    const userB = await db.orm.public.User.create({
        email: `author_b_${Date.now()}@example.com`,
        passwordHash: "secret_hash_b",
        name: "Reader Bob",
    });

    const tokenA = signAccessToken({ sub: userA.id, email: userA.email });
    const tokenB = signAccessToken({ sub: userB.id, email: userB.email });

    console.log(`User A (ID: ${userA.id}), User B (ID: ${userB.id}) created.`);

    // 2. Test POST /publications (Validation errors)
    const invalidRes = await app.inject({
        method: "POST",
        url: "/publications",
        headers: { authorization: `Bearer ${tokenA}` },
        payload: { title: "", genre: "" }, // Invalid title & genre
    });
    console.log(`POST /publications invalid input status=${invalidRes.statusCode}`);
    if (invalidRes.statusCode !== 400) {
        throw new Error("Expected 400 for invalid title/genre");
    }
    const invalidBody = JSON.parse(invalidRes.payload);
    if (invalidBody.success !== false) {
        throw new Error("Expected success: false for validation failure");
    }

    // 3. Test POST /publications (Unauthenticated)
    const unauthRes = await app.inject({
        method: "POST",
        url: "/publications",
        payload: { title: "Test", genre: "Fiction" },
    });
    console.log(`POST /publications unauthenticated status=${unauthRes.statusCode}`);
    if (unauthRes.statusCode !== 401) {
        throw new Error("Expected 401 for unauthenticated request");
    }

    // 4. Test POST /publications (Success & Spoof Attempt)
    const createRes = await app.inject({
        method: "POST",
        url: "/publications",
        headers: { authorization: `Bearer ${tokenA}` },
        payload: {
            title: "Journey to the Moon",
            description: "A sci-fi novel",
            genre: "Sci-Fi",
            language: "English",
            publishedYear: 2026,
            pages: 350,
            content: "Chapter 1: The Launch...",
            authorId: userB.id, // Attempting to spoof authorId as User B
        },
    });

    console.log(`POST /publications status=${createRes.statusCode}`);
    if (createRes.statusCode !== 201) {
        throw new Error(`Failed to create publication: ${createRes.payload}`);
    }
    const createData = JSON.parse(createRes.payload);
    if (!createData.success || !createData.data?.id) {
        throw new Error("Invalid response format on publication creation");
    }

    const pub1 = createData.data;
    if (pub1.authorId !== userA.id) {
        throw new Error(`Security breach: authorId spoofing succeeded! Expected ${userA.id}, got ${pub1.authorId}`);
    }
    if (pub1.author?.passwordHash || pub1.author?.googleId) {
        throw new Error("Privacy breach: Sensitive fields exposed in author payload!");
    }
    console.log(`Publication ${pub1.id} created successfully for author ${pub1.authorId}.`);

    // 5. Test GET /publications/me for User A
    const getMeRes = await app.inject({
        method: "GET",
        url: "/publications/me",
        headers: { authorization: `Bearer ${tokenA}` },
    });
    console.log(`GET /publications/me User A status=${getMeRes.statusCode}`);
    const getMeData = JSON.parse(getMeRes.payload);
    if (getMeRes.statusCode !== 200 || !Array.isArray(getMeData.data)) {
        throw new Error("GET /publications/me failed");
    }
    if (getMeData.data.length !== 1 || getMeData.data[0].id !== pub1.id) {
        throw new Error("GET /publications/me did not return expected user publications");
    }

    // Test GET /publications/me for User B (should be empty)
    const getMeResB = await app.inject({
        method: "GET",
        url: "/publications/me",
        headers: { authorization: `Bearer ${tokenB}` },
    });
    const getMeDataB = JSON.parse(getMeResB.payload);
    if (getMeDataB.data.length !== 0) {
        throw new Error("GET /publications/me for User B returned non-empty list");
    }

    // 6. Test GET /publications/:id
    const getByIdRes = await app.inject({
        method: "GET",
        url: `/publications/${pub1.id}`,
        headers: { authorization: `Bearer ${tokenB}` },
    });
    console.log(`GET /publications/${pub1.id} status=${getByIdRes.statusCode}`);
    if (getByIdRes.statusCode !== 200) {
        throw new Error("GET /publications/:id failed");
    }

    // 7. Test PATCH /publications/:id (Non-owner attempt by User B)
    const patchNonOwnerRes = await app.inject({
        method: "PATCH",
        url: `/publications/${pub1.id}`,
        headers: { authorization: `Bearer ${tokenB}` },
        payload: { title: "Hacked Title" },
    });
    console.log(`PATCH /publications/${pub1.id} by Non-owner status=${patchNonOwnerRes.statusCode}`);
    if (patchNonOwnerRes.statusCode !== 403) {
        throw new Error(`Expected 403 for non-owner PATCH, got ${patchNonOwnerRes.statusCode}`);
    }

    // 8. Test DELETE /publications/:id (Non-owner attempt by User B)
    const deleteNonOwnerRes = await app.inject({
        method: "DELETE",
        url: `/publications/${pub1.id}`,
        headers: { authorization: `Bearer ${tokenB}` },
    });
    console.log(`DELETE /publications/${pub1.id} by Non-owner status=${deleteNonOwnerRes.statusCode}`);
    if (deleteNonOwnerRes.statusCode !== 403) {
        throw new Error(`Expected 403 for non-owner DELETE, got ${deleteNonOwnerRes.statusCode}`);
    }

    // 9. Test PATCH /publications/:id (Owner update by User A)
    const patchOwnerRes = await app.inject({
        method: "PATCH",
        url: `/publications/${pub1.id}`,
        headers: { authorization: `Bearer ${tokenA}` },
        payload: { title: "Journey to Mars (Updated)" },
    });
    console.log(`PATCH /publications/${pub1.id} by Owner status=${patchOwnerRes.statusCode}`);
    if (patchOwnerRes.statusCode !== 200) {
        throw new Error("Owner PATCH failed");
    }
    const patchData = JSON.parse(patchOwnerRes.payload);
    if (patchData.data.title !== "Journey to Mars (Updated)") {
        throw new Error("PATCH failed to update publication title");
    }

    // 10. Test Isolation from Book / UserBook / ReadingProgress
    const allUserBooks = await db.orm.public.UserBook.where({ userId: userA.id }).all();
    if (allUserBooks.length > 0) {
        throw new Error("Isolation breach: Publication created a UserBook entry!");
    }
    const allReadingProgress = await db.orm.public.ReadingProgress.where({ userId: userA.id }).all();
    if (allReadingProgress.length > 0) {
        throw new Error("Isolation breach: Publication created a ReadingProgress entry!");
    }
    console.log("Isolation check passed: Publication is strictly separated from Book, UserBook, and ReadingProgress.");

    // 11. Test DELETE /publications/:id (Owner deletion by User A)
    const deleteOwnerRes = await app.inject({
        method: "DELETE",
        url: `/publications/${pub1.id}`,
        headers: { authorization: `Bearer ${tokenA}` },
    });
    console.log(`DELETE /publications/${pub1.id} by Owner status=${deleteOwnerRes.statusCode}`);
    if (deleteOwnerRes.statusCode !== 200) {
        throw new Error("Owner DELETE failed");
    }

    // Verify deletion
    const verifyGetRes = await app.inject({
        method: "GET",
        url: `/publications/${pub1.id}`,
        headers: { authorization: `Bearer ${tokenA}` },
    });
    if (verifyGetRes.statusCode !== 404) {
        throw new Error("Publication still exists after deletion");
    }

    console.log("=== ALL GATE 2B PUBLICATION BACKEND TESTS PASSED SUCCESSFULLY! ===");
}

runPublicationTests().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
