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
    console.log("=== STARTING DIRECT MESSAGING TESTS ===");

    try {
        const userA = await getOrCreateUser("msg_usera@soulshelf.com", "User A");
        const userB = await getOrCreateUser("msg_userb@soulshelf.com", "User B");
        const userC = await getOrCreateUser("msg_userc@soulshelf.com", "User C");

        const authHeaderA = { Authorization: `Bearer ${userA.token}`, "Content-Type": "application/json" };
        const authHeaderB = { Authorization: `Bearer ${userB.token}`, "Content-Type": "application/json" };
        const authHeaderC = { Authorization: `Bearer ${userC.token}`, "Content-Type": "application/json" };

        // 1. Cannot message self
        const selfMsgRes = await fetch(`${API_URL}/conversations`, {
            method: "POST",
            headers: authHeaderA,
            body: JSON.stringify({ targetUserId: userA.id }),
        });
        const selfMsgData = (await selfMsgRes.json()) as any;
        if (selfMsgRes.status !== 400 || selfMsgData.success) {
            throw new Error("Self-messaging should be blocked with HTTP 400");
        }
        console.log("✅ Self messaging correctly blocked");

        // 2. User A creates conversation with User B
        const convRes1 = await fetch(`${API_URL}/conversations`, {
            method: "POST",
            headers: authHeaderA,
            body: JSON.stringify({ targetUserId: userB.id }),
        });
        const convData1 = (await convRes1.json()) as any;
        if (!convData1.success || !convData1.data.conversationId) {
            throw new Error("Failed to create conversation");
        }
        const convId = convData1.data.conversationId;
        console.log(`✅ Conversation created between User A and User B: ID ${convId}`);

        // 3. User B requests conversation with User A (should reuse existing conversation)
        const convRes2 = await fetch(`${API_URL}/conversations`, {
            method: "POST",
            headers: authHeaderB,
            body: JSON.stringify({ targetUserId: userA.id }),
        });
        const convData2 = (await convRes2.json()) as any;
        if (!convData2.success || convData2.data.conversationId !== convId) {
            throw new Error("Duplicate direct conversation was created!");
        }
        console.log("✅ Duplicate conversation check passed: existing conversation reused");

        // 4. User A sends message to User B
        const msg1Res = await fetch(`${API_URL}/conversations/${convId}/messages`, {
            method: "POST",
            headers: authHeaderA,
            body: JSON.stringify({ content: "Hello User B! Welcome to SoulShelf." }),
        });
        const msg1Data = (await msg1Res.json()) as any;
        if (!msg1Data.success || msg1Data.data.senderId !== userA.id) {
            throw new Error("Failed to send message from User A");
        }
        console.log("✅ User A sent message to User B");

        // 5. User B gets messages in conversation
        const msgsListRes = await fetch(`${API_URL}/conversations/${convId}/messages`, {
            headers: authHeaderB,
        });
        const msgsListData = (await msgsListRes.json()) as any;
        if (!msgsListData.success || msgsListData.data.length === 0 || !msgsListData.data.some((m: any) => m.content === "Hello User B! Welcome to SoulShelf.")) {
            throw new Error("User B failed to read User A's message");
        }
        console.log("✅ User B read message correctly");

        // 6. User B replies
        const msg2Res = await fetch(`${API_URL}/conversations/${convId}/messages`, {
            method: "POST",
            headers: authHeaderB,
            body: JSON.stringify({ content: "Hey User A! Thanks for reaching out." }),
        });
        const msg2Data = (await msg2Res.json()) as any;
        if (!msg2Data.success || msg2Data.data.senderId !== userB.id) {
            throw new Error("Failed to send reply from User B");
        }
        console.log("✅ User B sent reply to User A");

        // 7. User A lists conversations and sees updated latestMessage
        const listConvsRes = await fetch(`${API_URL}/conversations`, { headers: authHeaderA });
        const listConvsData = (await listConvsRes.json()) as any;
        if (!listConvsData.success || listConvsData.data.length === 0 || listConvsData.data[0].latestMessage !== "Hey User A! Thanks for reaching out.") {
            throw new Error("Latest message not updated in conversation list");
        }
        console.log("✅ Conversation list updated with latest message snippet");

        // 8. Security Check: Non-member User C cannot read conversation
        const cReadRes = await fetch(`${API_URL}/conversations/${convId}/messages`, { headers: authHeaderC });
        if (cReadRes.status !== 403) {
            throw new Error("Non-member User C was able to read conversation!");
        }
        console.log("✅ Security check passed: Non-member User C blocked from reading messages");

        // 9. Security Check: Non-member User C cannot send message to conversation
        const cSendRes = await fetch(`${API_URL}/conversations/${convId}/messages`, {
            method: "POST",
            headers: authHeaderC,
            body: JSON.stringify({ content: "Unauthorized message" }),
        });
        if (cSendRes.status !== 403) {
            throw new Error("Non-member User C was able to send message!");
        }
        console.log("✅ Security check passed: Non-member User C blocked from sending messages");

        console.log("=== ALL DIRECT MESSAGING TESTS PASSED ===");
    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        process.exit(1);
    }
}

runTests();
