export {};

const API_URL = "http://localhost:3000";

async function getOrCreateUser(email: string, name: string) {
    const password = "password123";
    let res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    let data = await res.json() as any;

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
        data = await res.json() as any;
    }

    return { token: data.data.accessToken, id: data.data.user.id };
}

async function runTests() {
    console.log("=== STARTING SOCIAL & PUBLIC PROFILE TESTS ===");

    try {
        const user1 = await getOrCreateUser("social_user1@soulshelf.com", "Social User 1");
        console.log(`✅ User 1 logged in: ID ${user1.id}`);

        const user2 = await getOrCreateUser("social_user2@soulshelf.com", "Social User 2");
        console.log(`✅ User 2 logged in: ID ${user2.id}`);

        const authHeader1 = { Authorization: `Bearer ${user1.token}`, "Content-Type": "application/json" };
        const authHeader2 = { Authorization: `Bearer ${user2.token}`, "Content-Type": "application/json" };

        // Ensure clean state before starting
        await fetch(`${API_URL}/social/follow/${user2.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user1.token}` },
        });

        // 3. Test GET /users/:user2Id (Public Profile)
        const profileRes = await fetch(`${API_URL}/users/${user2.id}`, { headers: authHeader1 });
        const profileData = await profileRes.json() as any;
        console.log("Profile response:", profileData);

        // Security assertion: no sensitive fields exposed
        const rawBody = JSON.stringify(profileData);
        if (rawBody.includes("passwordHash") || rawBody.includes("googleId") || rawBody.includes("refreshTokens")) {
            throw new Error("🚨 SECURITY LEAK DETECTED: Sensitive fields exposed in public profile!");
        }
        console.log("✅ Security audit passed: No passwordHash/googleId/refreshTokens in profile response!");

        // 4. Follow user 2
        const followRes = await fetch(`${API_URL}/social/follow/${user2.id}`, {
            method: "POST",
            headers: authHeader1,
            body: JSON.stringify({}),
        });
        const followData = await followRes.json() as any;
        console.log("Follow response:", followData);
        if (followData.data.followersCount < 1 || !followData.data.isFollowing) {
            throw new Error("Follow action failed to update counts correctly!");
        }
        console.log("✅ User 1 successfully followed User 2");

        // 5. Verify User 2 profile shows isFollowing = true
        const updatedProfileRes = await fetch(`${API_URL}/users/${user2.id}`, { headers: authHeader1 });
        const updatedProfile = await updatedProfileRes.json() as any;
        if (!updatedProfile.data.isFollowing || updatedProfile.data.followersCount < 1) {
            throw new Error("Profile did not reflect follow status!");
        }
        console.log("✅ User 2 profile accurately shows isFollowing=true & updated followers count");

        // 6. Check followers & following endpoints
        const followersRes = await fetch(`${API_URL}/social/followers/${user2.id}`, { headers: authHeader1 });
        const followersData = await followersRes.json() as any;
        console.log("Followers list:", followersData);
        const hasUser1InFollowers = followersData.data.some((u: any) => u.id === user1.id);
        if (!hasUser1InFollowers) {
            throw new Error("Followers list does not contain follower!");
        }
        console.log("✅ Followers list endpoint verified!");

        const followingRes = await fetch(`${API_URL}/social/following/${user1.id}`, { headers: authHeader1 });
        const followingData = await followingRes.json() as any;
        console.log("Following list:", followingData);
        const hasUser2InFollowing = followingData.data.some((u: any) => u.id === user2.id);
        if (!hasUser2InFollowing) {
            throw new Error("Following list does not contain target user!");
        }
        console.log("✅ Following list endpoint verified!");

        // 7. Duplicate follow error check (409)
        const dupFollowRes = await fetch(`${API_URL}/social/follow/${user2.id}`, {
            method: "POST",
            headers: authHeader1,
            body: JSON.stringify({}),
        });
        if (dupFollowRes.status === 409) {
            console.log("✅ Duplicate follow correctly rejected with 409 ALREADY_FOLLOWING");
        } else {
            throw new Error(`Expected 409 for duplicate follow, got ${dupFollowRes.status}`);
        }

        // 8. Self-follow error check (400)
        const selfFollowRes = await fetch(`${API_URL}/social/follow/${user1.id}`, {
            method: "POST",
            headers: authHeader1,
            body: JSON.stringify({}),
        });
        if (selfFollowRes.status === 400) {
            console.log("✅ Self-follow correctly rejected with 400 CANNOT_FOLLOW_SELF");
        } else {
            throw new Error(`Expected 400 for self-follow, got ${selfFollowRes.status}`);
        }

        // 9. Unfollow user 2 via DELETE
        const unfollowRes = await fetch(`${API_URL}/social/follow/${user2.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user1.token}` },
        });
        const unfollowData = await unfollowRes.json() as any;
        console.log("Unfollow response:", unfollowData);
        if (unfollowData.data.isFollowing) {
            throw new Error("Unfollow action failed!");
        }
        console.log("✅ User 1 successfully unfollowed User 2");

        // 10. Verify User 2 profile shows isFollowing = false
        const finalProfileRes = await fetch(`${API_URL}/users/${user2.id}`, { headers: authHeader1 });
        const finalProfile = await finalProfileRes.json() as any;
        if (finalProfile.data.isFollowing) {
            throw new Error("Profile still shows isFollowing=true after unfollow!");
        }
        console.log("✅ User 2 profile accurately shows isFollowing=false after unfollow");

        console.log("🎉 ALL SOCIAL & PUBLIC PROFILE TESTS PASSED!");
    } catch (err: any) {
        console.error("❌ TEST FAILED:", err.message);
        process.exit(1);
    }
}

runTests();
