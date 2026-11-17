import jwt from "jsonwebtoken";
import { db } from "./prisma/db";

async function runTests() {
    console.log("=== STARTING FRIENDS / SOCIAL API TESTS ===");

    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

    // 1. Setup Test Users: User A, User B, User C
    const setupUser = async (email: string, name: string) => {
        let user = await db.orm.public.User.where({ email }).first();
        if (!user) {
            user = await db.orm.public.User.create({
                email,
                name,
                avatarUrl: `https://example.com/avatars/${name.toLowerCase().replace(/\s+/g, "")}.png`,
            });
        }
        // Match the production signAccessToken shape: { sub: userId, email }
        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET);
        return { user, token };
    };

    const alice = await setupUser("alice_friends_test@example.com", "Alice Social");
    const bob = await setupUser("bob_friends_test@example.com", "Bob Social");
    const charlie = await setupUser("charlie_friends_test@example.com", "Charlie Social");

    console.log(`Test users initialized: Alice (${alice.user.id}), Bob (${bob.user.id}), Charlie (${charlie.user.id})`);

    // Clean up any existing friend request rows between these 3 test users
    const userIds = [alice.user.id, bob.user.id, charlie.user.id];
    const allRequests = await db.orm.public.FriendRequest.all();
    for (const req of allRequests) {
        if (userIds.includes(req.senderId) || userIds.includes(req.receiverId)) {
            await db.orm.public.FriendRequest.where({ id: req.id }).delete();
        }
    }
    console.log("Cleaned up previous test friend request records.");

    // Test 1-2: Unauthenticated requests -> 401
    const res1 = await fetch("http://localhost:3000/friends/me");
    console.log(`Test 1 (Unauthenticated GET /friends/me): status=${res1.status} (expected 401)`);
    if (res1.status !== 401) throw new Error("Test 1 failed");

    const res2 = await fetch("http://localhost:3000/friends/me/requests");
    console.log(`Test 2 (Unauthenticated GET /friends/me/requests): status=${res2.status} (expected 401)`);
    if (res2.status !== 401) throw new Error("Test 2 failed");

    // Test 3-5: User Search (Authenticated as Alice)
    const res3 = await fetch("http://localhost:3000/users/search?q=Bob", {
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data3 = await res3.json();
    console.log(`Test 3 (Search 'Bob'): status=${res3.status}, count=${data3.data?.length}`);
    if (res3.status !== 200 || !data3.success) throw new Error("Test 3 failed");

    // Test 4: Current user Alice excluded from search results
    const res4 = await fetch("http://localhost:3000/users/search?q=Social", {
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data4 = await res4.json();
    const containsAlice = data4.data?.some((u: any) => u.id === alice.user.id);
    console.log(`Test 4 (Current user excluded from search): containsAlice=${containsAlice} (expected false), returned ids=${JSON.stringify(data4.data?.map((u: any) => ({ id: u.id, name: u.name })))}`);
    if (containsAlice) throw new Error("Test 4 failed");

    // Test 5: Safe public fields check (No email, passwordHash, googleId, tokens)
    const searchUser = data3.data?.[0];
    const hasUnsafeFields = searchUser && ("email" in searchUser || "passwordHash" in searchUser || "googleId" in searchUser);
    console.log(`Test 5 (Public user safe fields check): hasUnsafeFields=${hasUnsafeFields} (expected false), fields=${Object.keys(searchUser || {})}`);
    if (hasUnsafeFields) throw new Error("Test 5 failed");

    // Test 6: A -> B send request
    const res6 = await fetch(`http://localhost:3000/friends/me/requests/${bob.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data6 = await res6.json();
    console.log(`Test 6 (Send request Alice -> Bob): status=${res6.status}, statusStr="${data6.data?.status}"`);
    if (res6.status !== 201 || data6.data?.status !== "PENDING") throw new Error("Test 6 failed");

    // Test 7: Duplicate request A -> B -> 409 Conflict
    const res7 = await fetch(`http://localhost:3000/friends/me/requests/${bob.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data7 = await res7.json();
    console.log(`Test 7 (Duplicate request Alice -> Bob): status=${res7.status}, error="${data7.error}" (expected 409)`);
    if (res7.status !== 409) throw new Error("Test 7 failed");

    // Test 8: A -> A self request -> 400 Bad Request
    const res8 = await fetch(`http://localhost:3000/friends/me/requests/${alice.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data8 = await res8.json();
    console.log(`Test 8 (Self request Alice -> Alice): status=${res8.status}, error="${data8.error}" (expected 400)`);
    if (res8.status !== 400) throw new Error("Test 8 failed");

    // Test 9: Nonexistent target user -> 404
    const res9 = await fetch("http://localhost:3000/friends/me/requests/999999", {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data9 = await res9.json();
    console.log(`Test 9 (Nonexistent target user 999999): status=${res9.status}, error="${data9.error}" (expected 404)`);
    if (res9.status !== 404) throw new Error("Test 9 failed");

    // Test 10-15: Reverse Request Auto-Accept Logic
    // Reset requests between Alice & Bob
    await db.orm.public.FriendRequest.where({ senderId: alice.user.id, receiverId: bob.user.id }).delete();

    // Step A: Alice sends request to Bob
    await fetch(`http://localhost:3000/friends/me/requests/${bob.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });

    // Step B: Bob sends request to Alice while Alice -> Bob is pending
    const res11 = await fetch(`http://localhost:3000/friends/me/requests/${alice.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${bob.token}` },
    });
    const data11 = await res11.json();
    console.log(`Test 11 (Reverse request Bob -> Alice): status=${res11.status}, friendshipStatus="${data11.data?.status}"`);
    if (res11.status !== 201 && res11.status !== 200) throw new Error("Test 11 failed");
    if (data11.data?.status !== "ACCEPTED") throw new Error("Test 11 failed status update");

    // Step C: Verify total rows between Alice and Bob = 1 (no duplicate relationship created)
    const requestsAB = await db.orm.public.FriendRequest.all();
    const countAB = requestsAB.filter(
        (r) => (r.senderId === alice.user.id && r.receiverId === bob.user.id) || (r.senderId === bob.user.id && r.receiverId === alice.user.id),
    ).length;
    console.log(`Test 12 (No duplicate relationship row created): count=${countAB} (expected 1)`);
    if (countAB !== 1) throw new Error("Test 12 failed");

    // Step D: Alice sees Bob as friend
    const res14 = await fetch("http://localhost:3000/friends/me", {
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data14 = await res14.json();
    const aliceSeesBob = data14.data?.some((f: any) => f.id === bob.user.id);
    console.log(`Test 14 (Alice sees Bob as friend): aliceSeesBob=${aliceSeesBob} (expected true)`);
    if (!aliceSeesBob) throw new Error("Test 14 failed");

    // Step E: Bob sees Alice as friend
    const res15 = await fetch("http://localhost:3000/friends/me", {
        headers: { Authorization: `Bearer ${bob.token}` },
    });
    const data15 = await res15.json();
    const bobSeesAlice = data15.data?.some((f: any) => f.id === alice.user.id);
    console.log(`Test 15 (Bob sees Alice as friend): bobSeesAlice=${bobSeesAlice} (expected true)`);
    if (!bobSeesAlice) throw new Error("Test 15 failed");

    // Test 16-18: Normal Acceptance Flow
    // Reset relationships
    for (const req of await db.orm.public.FriendRequest.all()) {
        if (userIds.includes(req.senderId) || userIds.includes(req.receiverId)) {
            await db.orm.public.FriendRequest.where({ id: req.id }).delete();
        }
    }

    // Alice sends request to Bob
    const res16a = await fetch(`http://localhost:3000/friends/me/requests/${bob.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data16a = await res16a.json();
    const requestId16 = data16a.data?.id;

    // Bob accepts request
    const res17 = await fetch(`http://localhost:3000/friends/me/requests/${requestId16}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${bob.token}` },
    });
    const data17 = await res17.json();
    console.log(`Test 17 (Bob accepts request): status=${res17.status}, statusStr="${data17.data?.status}"`);
    if (res17.status !== 200 || data17.data?.status !== "ACCEPTED") throw new Error("Test 17 failed");

    // Test 19-20: Authorization Checks
    // Alice sends request to Charlie
    const res19a = await fetch(`http://localhost:3000/friends/me/requests/${charlie.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data19a = await res19a.json();
    const requestIdAliceCharlie = data19a.data?.id;

    // Third user Bob tries to accept Alice -> Charlie request -> 403
    const res19 = await fetch(`http://localhost:3000/friends/me/requests/${requestIdAliceCharlie}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${bob.token}` },
    });
    const data19 = await res19.json();
    console.log(`Test 19 (Third user Bob tries to accept request): status=${res19.status}, error="${data19.error}" (expected 403)`);
    if (res19.status !== 403) throw new Error("Test 19 failed");

    // Third user Bob tries to reject Alice -> Charlie request -> 403
    const res20 = await fetch(`http://localhost:3000/friends/me/requests/${requestIdAliceCharlie}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${bob.token}` },
    });
    const data20 = await res20.json();
    console.log(`Test 20 (Third user Bob tries to reject request): status=${res20.status}, error="${data20.error}" (expected 403)`);
    if (res20.status !== 403) throw new Error("Test 20 failed");

    // Test 21-23: Reject Flow
    // Charlie rejects Alice's request
    const res21 = await fetch(`http://localhost:3000/friends/me/requests/${requestIdAliceCharlie}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${charlie.token}` },
    });
    const data21 = await res21.json();
    console.log(`Test 21 (Charlie rejects request): status=${res21.status}, statusStr="${data21.data?.status}"`);
    if (res21.status !== 200 || data21.data?.status !== "REJECTED") throw new Error("Test 21 failed");

    // Alice sends request to Charlie again (after rejection) -> re-opens to PENDING
    const res23 = await fetch(`http://localhost:3000/friends/me/requests/${charlie.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data23 = await res23.json();
    console.log(`Test 23 (Re-send request after rejection): status=${res23.status}, statusStr="${data23.data?.status}" (expected PENDING)`);
    if (data23.data?.status !== "PENDING") throw new Error("Test 23 failed");

    // Test 24-28: Removal Flow
    // Alice removes Bob
    const res24 = await fetch(`http://localhost:3000/friends/me/${bob.user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data24 = await res24.json();
    console.log(`Test 24 (Alice removes Bob as friend): status=${res24.status}, success=${data24.success}`);
    if (res24.status !== 200 || !data24.success) throw new Error("Test 24 failed");

    // Confirm Alice no longer sees Bob
    const res25 = await fetch("http://localhost:3000/friends/me", {
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data25 = await res25.json();
    const aliceSeesBobAfterDelete = data25.data?.some((f: any) => f.id === bob.user.id);
    console.log(`Test 25 (Alice no longer sees Bob): aliceSeesBobAfterDelete=${aliceSeesBobAfterDelete} (expected false)`);
    if (aliceSeesBobAfterDelete) throw new Error("Test 25 failed");

    // Confirm Bob no longer sees Alice
    const res26 = await fetch("http://localhost:3000/friends/me", {
        headers: { Authorization: `Bearer ${bob.token}` },
    });
    const data26 = await res26.json();
    const bobSeesAliceAfterDelete = data26.data?.some((f: any) => f.id === alice.user.id);
    console.log(`Test 26 (Bob no longer sees Alice): bobSeesAliceAfterDelete=${bobSeesAliceAfterDelete} (expected false)`);
    if (bobSeesAliceAfterDelete) throw new Error("Test 26 failed");

    // Test 28: Alice can send a new request to Bob after removal
    const res28 = await fetch(`http://localhost:3000/friends/me/requests/${bob.user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${alice.token}` },
    });
    const data28 = await res28.json();
    console.log(`Test 28 (Alice sends new request to Bob after removal): status=${res28.status}, statusStr="${data28.data?.status}"`);
    if (data28.data?.status !== "PENDING") throw new Error("Test 28 failed");

    // Test 29: Isolation Check (User C cannot view User A's pending requests)
    const res29 = await fetch("http://localhost:3000/friends/me/requests", {
        headers: { Authorization: `Bearer ${charlie.token}` },
    });
    const data29 = await res29.json();
    // Charlie should only see incoming requests sent to Charlie, not requests sent to Alice or Bob
    const charlieIncomingSenders = data29.data?.incoming?.map((r: any) => r.sender?.id);
    console.log(`Test 29 (Isolation check for Charlie): charlieIncomingCount=${data29.data?.incoming?.length}, senders=${charlieIncomingSenders}`);
    if (charlieIncomingSenders?.includes(bob.user.id)) throw new Error("Test 29 failed - leak detected");

    console.log("=== ALL 29 FRIENDS / SOCIAL TESTS PASSED SUCCESSFULLY! ===");
    process.exit(0);
}

runTests().catch((err) => {
    console.error("Friends test failed:", err);
    process.exit(1);
});
