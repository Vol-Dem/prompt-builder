import { beforeEach, describe, expect, it, vi } from "vitest";
import { doc, updateDoc } from "firebase/firestore";
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
}));

const modelPath = "users/user-1/models/42";
const previewPath = "users/user-1/preview/42";
const data = { versionId: 7, mainTag: "<lora:portrait:1>", size: "123", tagSetsData: [] };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateDoc).mockReset().mockResolvedValue(undefined);
});

it.each([7, "default"] as const)("saves %s data and search fields to the correct documents", async (version) => {
  const preview = { mainTags: ["portrait"], customFileNames: ["model"] };
  await saveModelVersionChanges("user-1", 42, version, data, preview);
  const field = version === "default" ? "defaultCustomData" : "modelVersionsCustomData.7";
  expect(vi.mocked(updateDoc).mock.calls).toEqual([
    [modelPath, { [field]: data }],
    [previewPath, { [field]: data, ...preview }],
  ]);
});

it("does not add search fields when saving tags", async () => {
  await saveModelVersionChanges("user-1", 42, 7, data);
  expect(vi.mocked(updateDoc).mock.calls).toEqual([
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
});

it.each(["preview.webp", ""])("saves statuses with preview image %j", async (imgUrl) => {
  const versions = { 7: { versionId: 7, downloadStatus: false, name: "Version" } };
  await saveModelVersionStatuses("user-1", 42, versions, imgUrl);
  expect(vi.mocked(updateDoc).mock.calls).toEqual([
    [modelPath, { modelVersionsCustomData: versions }],
    [previewPath, { modelVersionsCustomData: versions, imgUrl }],
  ]);
});

describe.each([
  { name: "version", save: () => saveModelVersionChanges("user-1", 42, 7, data) },
  { name: "statuses", save: () => saveModelVersionStatuses("user-1", 42, {}, "") },
])("$name write sequence", ({ save }) => {
  it("waits for the model write before starting the preview write", async () => {
    let finishModel!: () => void;
    vi.mocked(updateDoc).mockImplementationOnce(() => new Promise<void>((resolve) => {
      finishModel = resolve;
    }));
    const saving = save();
    expect(updateDoc).toHaveBeenCalledTimes(1);
    finishModel();
    await saving;
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it.each([1, 2])("propagates failure of write %i without further writes", async (failedWrite) => {
    const error = new Error("Write failed");
    if (failedWrite === 2) vi.mocked(updateDoc).mockResolvedValueOnce(undefined);
    vi.mocked(updateDoc).mockRejectedValueOnce(error);
    await expect(save()).rejects.toBe(error);
    expect(updateDoc).toHaveBeenCalledTimes(failedWrite);
  });
});

it("propagates a tag-set write failure unchanged", async () => {
  const error = new Error("Write failed");
  vi.mocked(updateDoc).mockRejectedValueOnce(error);
  await expect(saveModelTagSets("user-1", 42, 7, data)).rejects.toBe(error);
});
