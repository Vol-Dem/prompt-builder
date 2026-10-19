import { beforeEach, expect, it, vi } from "vitest";
import { deleteDoc, writeBatch } from "firebase/firestore";

import { deleteModelDoc } from "./fetchModel";
import { addDelayPromise } from "../generalUtils";

vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: { uid: "user-1" } }) }));
vi.mock("firebase/functions", () => ({ getFunctions: () => ({}), httpsCallable: () => vi.fn() }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  writeBatch: vi.fn(),
  deleteDoc: vi.fn(),
}));
// Keep the actual batching and deletion helpers; bypass only the inter-batch delay.
vi.mock("../generalUtils", async (importOriginal) => ({
  ...await importOriginal(), addDelayPromise: vi.fn(),
}));

const post = { postId: 7, imagesId: [1] };
const model = { id: 42, savedImages: { 9: [post], 10: [{ postId: 8, imagesId: [2] }] } };
const modelPath = "users/user-1/models/42";
const previewPath = "users/user-1/preview/42";
const deferred = () => {
  let resolve;
  const promise = new Promise((finish) => { resolve = finish; });
  return { promise, resolve };
};
const batch = (commit = vi.fn().mockResolvedValue(undefined)) => ({ delete: vi.fn(), commit });

beforeEach(() => {
  vi.resetAllMocks();
  addDelayPromise.mockResolvedValue(undefined);
  writeBatch.mockImplementation(() => batch());
  deleteDoc.mockResolvedValue(undefined);
});

it("awaits the actual cleanup commits for every version, then the model and preview deletions", async () => {
  const commits = [deferred(), deferred()];
  const batches = commits.map((commit) => batch(vi.fn(() => commit.promise)));
  batches.forEach((value) => writeBatch.mockReturnValueOnce(value));
  const parents = [deferred(), deferred()];
  parents.forEach((parent) => deleteDoc.mockReturnValueOnce(parent.promise));
  let completed = false;
  const deleting = deleteModelDoc("user-1", model).then(() => { completed = true; });

  await vi.waitFor(() => expect(batches[0].commit).toHaveBeenCalledOnce());
  expect(batches[0].delete).toHaveBeenCalledExactlyOnceWith(`${modelPath}/images/7`);
  expect(writeBatch).toHaveBeenCalledOnce();
  expect(deleteDoc).not.toHaveBeenCalled();
  commits[0].resolve();
  await vi.waitFor(() => expect(batches[1].commit).toHaveBeenCalledOnce());
  expect(batches[1].delete).toHaveBeenCalledExactlyOnceWith(`${modelPath}/images/8`);
  expect(deleteDoc).not.toHaveBeenCalled();
  commits[1].resolve();
  await vi.waitFor(() => expect(deleteDoc).toHaveBeenCalledExactlyOnceWith(modelPath));
  expect(completed).toBe(false);
  parents[0].resolve();
  await vi.waitFor(() => expect(deleteDoc).toHaveBeenCalledTimes(2));
  expect(deleteDoc).toHaveBeenLastCalledWith(previewPath);
  expect(completed).toBe(false);
  parents[1].resolve();
  await deleting;
  expect(completed).toBe(true);
  expect(model.savedImages).toEqual({ 9: [post], 10: [{ postId: 8, imagesId: [2] }] });
});

it("keeps the existing 50-post batch size and waits for the final batch in a version", async () => {
  const posts = Array.from({ length: 51 }, (_, id) => ({ postId: id + 1, imagesId: [] }));
  const pending = deferred();
  const batches = [batch(), batch(vi.fn(() => pending.promise))];
  batches.forEach((value) => writeBatch.mockReturnValueOnce(value));
  const deleting = deleteModelDoc("user-1", { id: 42, savedImages: { 9: posts } });
  await vi.waitFor(() => expect(batches[1].commit).toHaveBeenCalledOnce());
  expect(batches[0].delete).toHaveBeenCalledTimes(50);
  expect(batches[0].delete).toHaveBeenLastCalledWith(`${modelPath}/images/50`);
  expect(batches[1].delete).toHaveBeenCalledExactlyOnceWith(`${modelPath}/images/51`);
  expect(addDelayPromise.mock.calls).toEqual([[500], [500]]);
  expect(deleteDoc).not.toHaveBeenCalled();
  pending.resolve();
  await deleting;
  expect(deleteDoc.mock.calls).toEqual([[modelPath], [previewPath]]);
});

it.each([1, 2])("propagates a failed cleanup commit for version %s and leaves parent documents intact", async (failedVersion) => {
  const original = new Error("Image batch failed");
  if (failedVersion === 2) writeBatch.mockReturnValueOnce(batch());
  writeBatch.mockReturnValueOnce(batch(vi.fn().mockRejectedValue(original)));
  await expect(deleteModelDoc("user-1", model))
    .rejects.toMatchObject({ name: "AppError", original, cause: original });
  expect(writeBatch).toHaveBeenCalledTimes(failedVersion);
  expect(deleteDoc).not.toHaveBeenCalled();
});

it.each([1, 2])("propagates failure of parent deletion %s and stops subsequent deletions", async (failedParent) => {
  const original = new Error("Parent deletion failed");
  if (failedParent === 2) deleteDoc.mockResolvedValueOnce(undefined);
  deleteDoc.mockRejectedValueOnce(original);
  await expect(deleteModelDoc("user-1", { id: 42 })).rejects.toBe(original);
  expect(deleteDoc).toHaveBeenCalledTimes(failedParent);
  expect(deleteDoc).toHaveBeenNthCalledWith(1, modelPath);
});

it.each([undefined, {}, { 9: [] }])("deletes the model and preview when saved-image metadata is empty: %j", async (savedImages) => {
  await deleteModelDoc("user-1", { id: 42, savedImages });
  expect(writeBatch).not.toHaveBeenCalled();
  expect(deleteDoc.mock.calls).toEqual([[modelPath], [previewPath]]);
});
