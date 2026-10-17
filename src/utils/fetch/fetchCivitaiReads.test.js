import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDoc, writeBatch } from "firebase/firestore";
import {
  fetchModelFromCivitai,
  getModelData,
  saveModelData,
} from "./fetchModel";
import {
  fetchResourceInfo,
  getVersionImagesFromCiv,
  updateImagePostData,
} from "./fetchImages";
import { ERROR_MESSAGE_CIV_CONNECTION, URL_CIV_MODELS } from "../../variables/constants";

const { updateModel } = vi.hoisted(() => ({ updateModel: vi.fn() }));
vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: { uid: "user-1" } }) }));
vi.mock("firebase/functions", () => ({ getFunctions: () => ({}), httpsCallable: () => updateModel }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  getDoc: vi.fn(),
  writeBatch: vi.fn(),
  arrayUnion: (...items) => ({ union: items }),
  arrayRemove: (...items) => ({ remove: items }),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

const fetchMock = vi.fn();
const modelUrl = `${URL_CIV_MODELS}/42`;
const version = { id: 9, name: "v1", baseModel: "SDXL", files: [], images: [] };
const model = { id: 42, name: "Original model", type: "LORA", tags: [], modelVersions: [version] };
const form = {
  modelId: 42, modelVersionId: null, modelType: "lora", modelName: "",
  main: "Portrait", sub: [], hashtags: [], versionsDownloadStatus: [], nsfw: false,
};
const categories = { lora: [{ id: "portrait", name: "Portrait", subcategories: [] }] };
const post = { postId: 7, modelId: 42, versionId: 9, location: "models" };
let batch;

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  getDoc.mockResolvedValue({ exists: () => false, data: () => undefined });
  updateModel.mockReset().mockResolvedValue({ data: { modelId: 42, message: "Saved" } });
  batch = { set: vi.fn(), update: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
  writeBatch.mockReturnValue(batch);
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("model reads", () => {
  it.each([42, "42"])("preserves model %s metadata without applying form rules", async (id) => {
    const data = { ...model, description: "Existing description ".repeat(2000) };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => data });

    expect(await fetchModelFromCivitai(id)).toBe(data);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(modelUrl);
  });

  it.each([{}, { id: 42 }, { id: 42, modelVersions: "versions" }])("rejects a malformed model envelope: %j", async (data) => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => data });

    await expect(fetchModelFromCivitai(42)).rejects.toMatchObject({
      code: "civitai/invalid-response", message: ERROR_MESSAGE_CIV_CONNECTION,
      url: modelUrl, status: 200, original: data,
    });
  });

  it("retains model prefill transformations after a successful request", async () => {
    fetchMock.mockResolvedValue(Response.json(model));

    const result = await getModelData(42);

    expect(result).toMatchObject({ id: 42, name: model.name, modelVersions: [{ id: 9, name: "v1", images: [] }] });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(modelUrl);
  });

  it("keeps the first-save callable followed by the browser model read and persistence", async () => {
    fetchMock.mockResolvedValue(Response.json(model));

    const result = await saveModelData(form, categories, ["SDXL"]);

    expect(updateModel).toHaveBeenCalledExactlyOnceWith({ id: 42 });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(modelUrl);
    expect(result.modelData).toMatchObject({ id: 42, name: model.name, versionIds: [9] });
    expect(batch.set).toHaveBeenCalledWith("users/user-1/models/42", result.modelData);
    expect(batch.commit).toHaveBeenCalledOnce();
  });
});

const reads = [
  { name: "model view", request: () => fetchModelFromCivitai(42), url: modelUrl },
  { name: "model prefill", request: () => getModelData(42), url: modelUrl },
  { name: "new model save", request: () => saveModelData(form, categories, []), url: modelUrl },
  {
    name: "version image enrichment", request: () => getVersionImagesFromCiv(42, "Creator", version),
    url: "https://civitai.com/api/v1/images?modelId=42&modelVersionId=9&username=Creator&nsfw=X&limit=200&sort=Newest&withMeta=true",
  },
  {
    name: "tester post enrichment", request: () => updateImagePostData(post, [{ id: 1 }], true),
    url: "https://civitai.com/api/v1/images?postId=7&modelId=42&nsfw=X&withMeta=true",
  },
];

it.each(reads)("rejects an HTML HTTP error in $name without committing client writes", async ({ request, url }) => {
  fetchMock.mockResolvedValue(new Response("<!DOCTYPE html><html>Blocked</html>", { status: 403 }));

  await expect(request()).rejects.toMatchObject({
    message: ERROR_MESSAGE_CIV_CONNECTION, source: "civitai", url, status: 403, code: "civitai/http",
  });
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(url);
  expect(batch.commit).not.toHaveBeenCalled();
});

it("retains the Newest workaround, image matching, and metadata enrichment", async () => {
  const original = { id: 1, hash: "match", url: "preview.webp", custom: "keep" };
  fetchMock.mockResolvedValue(Response.json({ items: [
    { id: 11, hash: "match", url: "full.webp", meta: { prompt: "portrait" } },
    { id: 12, hash: "other", url: "other.webp" },
  ] }));

  const result = await getVersionImagesFromCiv(42, "Creator", {
    ...version, images: [original, { id: 2, hash: "missing" }],
  });

  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({ id: 11, hash: "match", url: "full.webp", meta: { prompt: "portrait" }, custom: "keep" });
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(reads[3].url);
});

it("keeps failed optional resources unchanged while enriching successful resources", async () => {
  const resources = [{ modelVersionId: 9 }, { hash: "missing", name: "Original resource" }];
  fetchMock.mockResolvedValueOnce(Response.json({ id: 9, modelId: 42, name: "Version", model: { name: "Model" } }))
    .mockResolvedValueOnce(new Response("Not found", { status: 404 }));

  const result = await fetchResourceInfo(resources);

  expect(result).toEqual([
    { modelVersionId: 9, versionId: 9, modelId: 42, versionName: "Version", name: "Model" },
    resources[1],
  ]);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "https://civitai.com/api/v1/model-versions/9",
    "https://civitai.com/api/v1/model-versions/by-hash/missing",
  ]);
});
