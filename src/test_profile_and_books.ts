import { db } from "./prisma/db";
import { meController, updateMeController } from "./modules/user/user.controller";
import { getBookDetails, searchBooks } from "./modules/book/book.service";

async function runTests() {
  console.log("=== RUNNING PROFILE & BOOK METADATA TESTS ===");

  // 1. Create a test user
  const email = `test_profile_${Date.now()}@example.com`;
  const user = await db.orm.public.User.create({
    email,
    passwordHash: "hash123",
    name: "Profile Tester",
  });
  console.log("Test user created, id:", user.id);

  // 2. Test PATCH /users/me with occupation and bio
  const mockReqUpdate = {
    user: { id: user.id },
    body: {
      occupation: "Software Engineer",
      bio: "Avid reader and tech enthusiast.",
    },
  } as any;

  let updateStatus = 0;
  let updateData: any = null;
  const mockReplyUpdate = {
    code: (status: number) => {
      updateStatus = status;
      return {
        send: (payload: any) => {
          updateData = payload;
        },
      };
    },
  } as any;

  await updateMeController(mockReqUpdate, mockReplyUpdate);
  console.log(`PATCH /users/me status=${updateStatus}, occupation=${updateData?.data?.occupation}, bio=${updateData?.data?.bio}`);
  if (updateStatus !== 200 || updateData?.data?.occupation !== "Software Engineer" || updateData?.data?.bio !== "Avid reader and tech enthusiast.") {
    throw new Error("Failed to update occupation and bio via PATCH /users/me");
  }

  // 3. Test GET /users/me
  const mockReqMe = { user: { id: user.id } } as any;
  let meStatus = 0;
  let meData: any = null;
  const mockReplyMe = {
    code: (status: number) => {
      meStatus = status;
      return {
        send: (payload: any) => {
          meData = payload;
        },
      };
    },
  } as any;

  await meController(mockReqMe, mockReplyMe);
  console.log(`GET /users/me status=${meStatus}, occupation=${meData?.data?.occupation}, bio=${meData?.data?.bio}`);
  if (meStatus !== 200 || meData?.data?.occupation !== "Software Engineer" || meData?.data?.bio !== "Avid reader and tech enthusiast.") {
    throw new Error("Failed to fetch occupation and bio via GET /users/me");
  }

  // 4. Test Book Details metadata
  const book1 = await getBookDetails(1);
  console.log(`Book 1 details: year=${book1.publishedYear}, lang=${book1.language}, pages=${book1.pages}`);
  if (book1.publishedYear !== 2023 || book1.language !== "English" || book1.pages !== 280) {
    throw new Error("Book 1 metadata mismatch");
  }

  const allBooks = await searchBooks();
  console.log(`All books count: ${allBooks.length}`);
  if (allBooks.length < 8) {
    throw new Error("Expected at least 8 demo books");
  }

  console.log("=== ALL PROFILE & BOOK METADATA TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
