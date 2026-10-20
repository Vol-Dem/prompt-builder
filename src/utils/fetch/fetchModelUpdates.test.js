import { beforeEach, expect, it, vi } from "vitest";
import { updateDoc, writeBatch } from "firebase/firestore";

import { updateUserCustomModelData } from "./fetchModel";
import { ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

const { auth } = vi.hoisted(() => ({ auth: { currentUser: { uid: "user-1" } } }));
vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => auth }));
vi.mock("firebase/functions", () => ({ getFunctions: () => ({}), httpsCallable: () => vi.fn() }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  arrayUnion: (...values) => ({ union: values }),
  writeBatch: vi.fn(),
  updateDoc: vi.fn(),
}));

const customVersion = {
  versionId: 7, name: "Custom name", index: 0, downloadStatus: true,
  mainTag: "portrait", fileName: "custom.safetensors",
  tagSetsData: [{ name: "Set", value: "detail", imgUrl: "set.webp" }],
};
const model = { id: 42, modelVersionsCustomData: { 7: customVersion } };
const latest = {
  id: 42, tags: ["portrait", "existing tag"],
  modelVersions: [
    {
      id: 9, name: "New version", baseModel: "SDXL", index: 0,
      files: [
        { name: "Ignore.safetensors", primary: false, hashes: { SHA256: "IGNORE" } },
        { name: "NewModel.safetensors", primary: true, hashes: { SHA256: "ABC123", CRC32: "DEF456" } },
      ],
      images: [{ type: "video", url: "video.mp4" }, { type: "image", url: "preview.webp" }],
    },
    { id: 7, name: "Original version", baseModel: "SD1", index: 1,
      files: [{ name: "Original.ckpt", primary: true, hashes: { SHA256: "OLD123" } }] },
  ],
};
const modelPath = "users/user-1/models/42";
const previewPath = "users/user-1/preview/42";
let batch;
const save = (baseModels = ["SD1"]) => updateUserCustomModelData(
  latest, structuredClone([latest.modelVersions[0]]), model, baseModels,
);

beforeEach(() => {
  vi.resetAllMocks();
  auth.currentUser = { uid: "user-1" };
  batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
  writeBatch.mockReturnValue(batch);
});

it("commits new-version metadata, preview search fields, and base-model registration together", async () => {
  await save();

  const versions = {
    9: { versionId: 9, name: "New version", versionName: "New version", baseModel: "SDXL",
      index: 0, defFileName: "newmodel", versionImageUrl: "preview.webp", downloadStatus: false },
    7: { ...customVersion, index: 1 },
  };
  expect(writeBatch).toHaveBeenCalledOnce();
  expect(batch.update.mock.calls).toEqual([
    ["users/user-1", { baseModels: { union: ["SDXL", "SD1"] } }],
    [modelPath, { modelVersionsCustomData: versions }],
    [previewPath, { modelVersionsCustomData: versions,
      fileNames: ["newmodel", "original"], hashes: ["abc123", "def456", "old123"],
      versionIds: [9, 7], tags: latest.tags, baseModels: { union: ["SDXL", "SD1"] } }],
  ]);
  expect(batch.commit).toHaveBeenCalledOnce();
  expect(updateDoc).not.toHaveBeenCalled();
  expect(model.modelVersionsCustomData[7]).toBe(customVersion);
  expect(customVersion.index).toBe(0);
});

it.each([{ baseModels: ["SD1", "SDXL"] }, { baseModels: [] }])("preserves the existing registry rule for $baseModels", async ({ baseModels }) => {
  await save(baseModels);

  expect(batch.update.mock.calls.map(([path]) => path)).toEqual([modelPath, previewPath]);
  expect(batch.commit).toHaveBeenCalledOnce();
  expect(updateDoc).not.toHaveBeenCalled();
});

it("preserves empty metadata fallbacks and existing custom fields", async () => {
  const version = { id: 10, name: "No files or images", baseModel: "SD1", index: 0 };
  await updateUserCustomModelData({ ...latest, modelVersions: [version] }, [version], model, ["SD1"]);

  expect(batch.update.mock.calls).toEqual([
    [modelPath, { modelVersionsCustomData: {
      10: { versionId: 10, name: version.name, versionName: version.name, baseModel: "SD1",
        index: 0, defFileName: "", versionImageUrl: "", downloadStatus: false },
      7: { ...customVersion, index: 0 },
    } }],
    [previewPath, { modelVersionsCustomData: batch.update.mock.calls[0][1].modelVersionsCustomData,
      fileNames: [], hashes: [], versionIds: [10], tags: latest.tags, baseModels: { union: ["SD1"] } }],
  ]);
  expect(batch.commit).toHaveBeenCalledOnce();
});

it("waits for the shared commit before reporting completion", async () => {
  let finishCommit;
  batch.commit.mockImplementationOnce(() => new Promise((resolve) => { finishCommit = resolve; }));
  let completed = false;
  const saving = save().then(() => { completed = true; });

  expect(batch.update).toHaveBeenCalledTimes(3);
  expect(batch.commit).toHaveBeenCalledOnce();
  await Promise.resolve();
  expect(completed).toBe(false);
  finishCommit();
  await saving;
  expect(completed).toBe(true);
});

it.each([true, false])("propagates a failed commit with registry update %s", async (registerBaseModel) => {
  const original = new Error("Batch commit failed");
  batch.commit.mockRejectedValueOnce(original);

  await expect(save(registerBaseModel ? ["SD1"] : ["SD1", "SDXL"])).rejects.toBe(original);
  expect(batch.commit).toHaveBeenCalledOnce();
  expect(updateDoc).not.toHaveBeenCalled();
});

it("does not commit queued registry or model changes if the preview update is invalid", async () => {
  const original = new Error("Invalid preview data");
  batch.update.mockImplementation((path) => { if (path === previewPath) throw original; });

  await expect(save()).rejects.toBe(original);
  expect(batch.update).toHaveBeenCalledTimes(3);
  expect(batch.commit).not.toHaveBeenCalled();
  expect(updateDoc).not.toHaveBeenCalled();
});

it("rejects a missing user before creating a batch", async () => {
  auth.currentUser = null;

  await expect(save()).rejects.toThrow(ERROR_MESSAGE_DEFAULT);
  expect(writeBatch).not.toHaveBeenCalled();
  expect(updateDoc).not.toHaveBeenCalled();
});
