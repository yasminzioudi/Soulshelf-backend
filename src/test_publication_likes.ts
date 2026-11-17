export {};

const API_URL = "http://localhost:3000";

async function getOrCreateUser(email: string, name: string) {
    const password = "password123";
    let res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    let data = (await res.json()) as any;

    if (!res.ok || !data.success) {
        await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });
        res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        data = (await res.json()) as any;
    }

    return { token: data.data.accessToken, id: data.data.user.id };
}

async function runTests() {
    console.log("=== STARTING PUBLICATION LIKES TESTS ===");

    try {
        const user1 = await getOrCreateUser("likes_user1@soulshelf.com", "Likes User 1");
        const user2 = await getOrCreateUser("likes_user2@soulshelf.com", "Likes User 2");

        const authHeader1 = { Authorization: `Bearer ${user1.token}`, "Content-Type": "application/json" };
        const authHeader2 = { Authorization: `Bearer ${user2.token}`, "Content-Type": "application/json" };

        // 1. Create a publication by user 1
        const createRes = await fetch(`${API_URL}/publications`, {
            method: "POST",
            headers: authHeader1,
            body: JSON.stringify({
                title: "Test Publication for Likes",
                description: "Testing like functionality",
                genre: "Fiction",
                content: "Content of publication for likes",
            }),
        });
        const createData = (await createRes.json()) as any;
        if (!createData.success) throw new Error("Failed to create test publication");
        const pubId = createData.data.id;
        console.log(`✅ Test publication created with ID: ${pubId}`);

        // 2. Initial like status check
        const initialStatusRes = await fetch(`${API_URL}/publications/${pubId}/likes`, { headers: authHeader2 });
        const initialStatus = (await initialStatusRes.json()) as any;
        if (initialStatus.data.isLiked !== false || initialStatus.data.likesCount !== 0) {
            throw new Error("Initial like status should be false with 0 count");
        }
        console.log("✅ Initial status verified: 0 likes, isLiked: false");

        // 3. User 2 likes publication
        const likeRes = await fetch(`${API_URL}/publications/${pubId}/like`, { method: "POST", headers: authHeader2, body: JSON.stringify({}) });
        const likeData = (await likeRes.json()) as any;
        console.log("Like data output:", likeData);
        if (!likeData.success || !likeData.data.isLiked || likeData.data.likesCount !== 1) {
            throw new Error(`Like operation failed: ${JSON.stringify(likeData)}`);
        }
        console.log("✅ User 2 liked publication: count is 1");

        // 4. User 2 likes publication AGAIN (duplicate prevention check)
        const dupLikeRes = await fetch(`${API_URL}/publications/${pubId}/like`, { method: "POST", headers: authHeader2, body: JSON.stringify({}) });
        const dupLikeData = (await dupLikeRes.json()) as any;
        if (!dupLikeData.success || dupLikeData.data.likesCount !== 1) {
            throw new Error("Duplicate like changed count or failed");
        }
        console.log("✅ Duplicate like handled cleanly: count remains 1");

        // 5. User 1 also likes publication
        await fetch(`${API_URL}/publications/${pubId}/like`, { method: "POST", headers: authHeader1, body: JSON.stringify({}) });
        const statusRes = await fetch(`${API_URL}/publications/${pubId}/likes`, { headers: authHeader2 });
        const statusData = (await statusRes.json()) as any;
        if (statusData.data.likesCount !== 2) {
            throw new Error("Expected 2 likes");
        }
        console.log("✅ User 1 also liked publication: count is 2");

        // 6. User 2 unlikes publication
        const unlikeRes = await fetch(`${API_URL}/publications/${pubId}/like`, { method: "DELETE", headers: { Authorization: `Bearer ${user2.token}` } });
        const unlikeData = (await unlikeRes.json()) as any;
        if (!unlikeData.success || unlikeData.data.isLiked !== false || unlikeData.data.likesCount !== 1) {
            throw new Error(`Unlike operation failed: ${JSON.stringify(unlikeData)}`);
        }
        console.log("✅ User 2 unliked publication: count decreased to 1");

        // 7. User 2 unlikes publication AGAIN (safe when already unliked)
        const dupUnlikeRes = await fetch(`${API_URL}/publications/${pubId}/like`, { method: "DELETE", headers: { Authorization: `Bearer ${user2.token}` } });
        const dupUnlikeData = (await dupUnlikeRes.json()) as any;
        if (!dupUnlikeData.success || dupUnlikeData.data.likesCount !== 1) {
            throw new Error("Repeated unlike failed or altered count incorrectly");
        }
        console.log("✅ Repeated unlike handled safely: count remains 1");

        // 8. Delete publication (verify cascade works and no errors occur)
        const deleteRes = await fetch(`${API_URL}/publications/${pubId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user1.token}` } });
        const deleteData = (await deleteRes.json()) as any;
        if (!deleteData.success) throw new Error(`Failed to delete publication: ${JSON.stringify(deleteData)}`);
        console.log("✅ Publication deleted cleanly with associated likes cascaded");

        console.log("=== ALL PUBLICATION LIKES TESTS PASSED ===");
    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        process.exit(1);
    }
}

runTests();
