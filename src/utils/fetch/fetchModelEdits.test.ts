import { beforeEach, describe, expect, it, vi } from "vitest";
import { doc, updateDoc, writeBatch, type WriteBatch } from "firebase/firestore";
import {
  saveModelTagSets,
  saveModelVersionChanges,
  saveModelVersionStatuses,
} from "./fetchModelEdits";

vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  doc: vi.fn((_: unknown, ...path: string[]) => path.join("/")),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(),
}));

const modelPath = "users/user-1/models/42";
const previewPath = "users/user-1/preview/42";
const data = { versionId: 7, mainTag: "<lora:portrait:1>", size: "123", tagSetsData: [] };
let batch: { update: ReturnType<typeof vi.fn>; commit: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateDoc).mockReset().mockResolvedValue(undefined);
  batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
  vi.mocked(writeBatch).mockReturnValue(batch as unknown as WriteBatch);
});

it.each([7, "default"] as const)("saves %s data and search fields to the correct documents", async (version) => {
  const preview = { mainTags: ["portrait"], customFileNames: ["model"] };
  await saveModelVersionChanges("user-1", 42, version, data, preview);
  const field = version === "default" ? "defaultCustomData" : "modelVersionsCustomData.7";
  expect(batch.update.mock.calls).toEqual([
    [modelPath, { [field]: data }],
    [previewPath, { [field]: data, ...preview }],
  ]);
});

it("does not add search fields when saving tags", async () => {
  await saveModelVersionChanges("user-1", 42, 7, data);
  expect(batch.update.mock.calls).toEqual([
    [modelPath, { "modelVersionsCustomData.7": data }],
    [previewPath, { "modelVersionsCustomData.7": data }],
  ]);
});

it("writes tag sets only to the model, preserving the whole version payload", async () => {
  const version = { ...data, tagSetsData: [{ name: "Set", value: "tag", imgUrl: "preview.webp" }] };
  await saveModelTagSets("user-1", 42, 7, version);
  expect(vi.mocked(doc).mock.calls.map((call) => call.slice(1))).toEqual([
    ["users", "user-1", "models", "42"],
  ]);
  expect(vi.mocked(updateDoc).mock.calls).toEqual([
    [modelPath, { "modelVersionsCustomData.7": version }],
  ]);
  expect(writeBatch).not.toHaveBeenCalled();
});

it.each(["preview.webp", ""])("saves statuses with preview image %j", async (imgUrl) => {
  const versions = { 7: { versionId: 7, downloadStatus: false, name: "Version" } };
  await saveModelVersionStatuses("user-1", 42, versions, imgUrl);
  expect(batch.update.mock.calls).toEqual([
    [modelPath, { modelVersionsCustomData: versions }],
    [previewPath, { modelVersionsCustomData: versions, imgUrl }],
  ]);
});

describe.each([
  { name: "version", save: () => saveModelVersionChanges("user-1", 42, 7, data) },
  { name: "statuses", save: () => saveModelVersionStatuses("user-1", 42, {}, "") },
])("$name batch", ({ save }) => {
  it("queues both updates in one batch and waits for its commit", async () => {
    let finishCommit!: () => void;
    batch.commit.mockImplementationOnce(() => new Promise<void>((resolve) => {
      finishCommit = resolve;
    }));
    let completed = false;
    const saving = save().then(() => { completed = true; });
    expect(writeBatch).toHaveBeenCalledOnce();
    expect(batch.update).toHaveBeenCalledTimes(2);
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(updateDoc).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(completed).toBe(false);
    finishCommit();
    await saving;
    expect(completed).toBe(true);
  });

  it("propagates a rejected commit without independent writes", async () => {
    const error = new Error("Write failed");
    batch.commit.mockRejectedValueOnce(error);
    await expect(save()).rejects.toBe(error);
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("does not commit if the preview update cannot be queued", async () => {
    const error = new Error("Invalid preview data");
    batch.update.mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw error; });
    await expect(save()).rejects.toBe(error);
    expect(batch.commit).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });
});

it("propagates a tag-set write failure unchanged", async () => {
  const error = new Error("Write failed");
  vi.mocked(updateDoc).mockRejectedValueOnce(error);
  await expect(saveModelTagSets("user-1", 42, 7, data)).rejects.toBe(error);
});
