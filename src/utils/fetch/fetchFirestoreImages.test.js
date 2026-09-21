import { beforeEach, expect, it, vi } from "vitest";
import { getDoc, getDocs } from "firebase/firestore";
import { fetchDefaultModelImages, fetchImagePostsByIds, fetchSavedImagePosts } from "./fetchFirestoreImages";

vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  collection: (_, ...path) => path.join("/"),
  doc: (_, ...path) => path.join("/"),
  query: (path, ...constraints) => ({ path, constraints }),
  where: (...args) => ({ where: args }),
  orderBy: (...args) => ({ orderBy: args }),
  startAfter: (cursor) => ({ startAfter: cursor }),
  limit: (amount) => ({ limit: amount }),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
}));
const snapshot = (length) => ({ docs: Array.from({ length }, (_, id) => ({ data: () => ({ id, items: [] }) })) });
beforeEach(() => {
  vi.mocked(getDocs).mockReset().mockResolvedValue(snapshot(0));
  vi.mocked(getDoc).mockReset();
});

it.each([false, true])("preserves saved-version query constraints with NSFW mode %s", async (nsfwMode) => {
  const cursor = {};
  await fetchSavedImagePosts({ uid: "user", versionId: 7, nsfwMode, cursor });
  expect(getDocs).toHaveBeenCalledWith({
    path: "users/user/images",
    constraints: [
      { where: ["versionsId", "array-contains", 7] },
      ...(!nsfwMode ? [{ where: ["hasSfw", "==", true] }] : []),
      { orderBy: ["createdAt", "desc"] }, { startAfter: cursor }, { limit: 16 },
    ],
  });
});

it.each([0, 1, 15, 16])("maps %i saved posts and advances the cursor only for a full page", async (length) => {
  const response = snapshot(length);
  const cursor = { previous: true };
  vi.mocked(getDocs).mockResolvedValueOnce(response);
  const page = await fetchSavedImagePosts({ uid: "user", versionId: 7, nsfwMode: false, cursor });
  expect(page.posts).toEqual(response.docs.map((doc) => doc.data()));
  expect(page.isLastPage).toBe(length < 16);
  expect(page.cursor).toBe(length < 16 ? cursor : response.docs.at(-1));
});

it.each([false, true])("preserves collection post filtering and the 13-post lookahead with NSFW mode %s", async (nsfwMode) => {
  const response = snapshot(2);
  vi.mocked(getDocs).mockResolvedValueOnce(response);
  expect(await fetchImagePostsByIds("user", [4, 9], nsfwMode)).toEqual(response.docs.map((doc) => doc.data()));
  expect(getDocs).toHaveBeenCalledWith({
    path: "users/user/images",
    constraints: [
      { where: ["id", "in", [4, 9]] },
      { where: ["hasSfw", "in", nsfwMode ? [true, false] : [true]] },
      { orderBy: ["createdAt", "desc"] }, { limit: 13 },
    ],
  });
});

it.each([
  { exists: false, data: undefined, expected: null },
  { exists: true, data: {}, expected: { items: undefined } },
  { exists: true, data: { items: [] }, expected: { items: [] } },
  { exists: true, data: { items: [{ id: 3 }] }, expected: { items: [{ id: 3 }] } },
])("preserves default-image document presence: %j", async ({ exists, data, expected }) => {
  vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => exists, data: () => data });
  expect(await fetchDefaultModelImages(42, 7)).toEqual(expected);
  expect(getDoc).toHaveBeenCalledWith("models/42/defaultImages/7");
});

it.each([
  () => fetchSavedImagePosts({ uid: "user", versionId: 7, nsfwMode: false, cursor: {} }),
  () => fetchImagePostsByIds("user", [4], false),
  () => fetchDefaultModelImages(42, 7),
])("propagates read failures without changing the error", async (read) => {
  const error = new Error("Read failed");
  vi.mocked(getDoc).mockRejectedValueOnce(error);
  vi.mocked(getDocs).mockRejectedValueOnce(error);
  await expect(read()).rejects.toBe(error);
});
