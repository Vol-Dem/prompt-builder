import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  fetchCivitaiImagePage,
  fetchCivitaiPostImagesForSelection,
  fetchCivitaiPostImagesForUpload,
} from "./fetchCivitaiImages";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../../variables/constants";

const fetchMock = vi.fn();
const signal = new AbortController().signal;
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it("passes the exact feed URL and AbortSignal and retains response metadata", async () => {
  const data = { items: [{ id: 1 }], metadata: { nextCursor: "next/value" } };
  fetchMock.mockResolvedValue({ json: async () => data });
  expect(await fetchCivitaiImagePage("https://civitai.com/api/v1/images?limit=10&cursor=a/b", signal)).toBe(data);
  expect(fetchMock).toHaveBeenCalledWith("https://civitai.com/api/v1/images?limit=10&cursor=a/b", { signal });
});

it.each([null, {}, { items: null }])("rejects missing feed items: %j", async (data) => {
  fetchMock.mockResolvedValue({ json: async () => data });
  await expect(fetchCivitaiImagePage("feed", signal)).rejects.toMatchObject({ message: ERROR_MESSAGE_CIV_CONNECTION, isCustom: true });
});

it("retains feed acceptance of empty items regardless of HTTP status", async () => {
  fetchMock.mockResolvedValue({ status: 500, ok: false, json: async () => ({ items: [] }) });
  expect(await fetchCivitaiImagePage("feed", signal)).toEqual({ items: [] });
});

it.each([undefined, 42])("preserves selection URLs with model %s", async (modelId) => {
  fetchMock.mockResolvedValue({ status: 200, json: async () => ({ items: [] }) });
  await fetchCivitaiPostImagesForSelection({ postId: 7, modelId, nsfwLevel: "X" });
  expect(fetchMock).toHaveBeenCalledWith(`https://civitai.com/api/v1/images?postId=7${modelId ? "&modelId=42" : ""}&nsfw=X&withMeta=true`);
});

it("rejects selection status 500 before reading even a malformed JSON body", async () => {
  const json = vi.fn().mockRejectedValue(new SyntaxError("Not JSON"));
  fetchMock.mockResolvedValue({ status: 500, json });
  await expect(fetchCivitaiPostImagesForSelection({ postId: 7, nsfwLevel: "None" }))
    .rejects.toMatchObject({ message: ERROR_MESSAGE_CIV_CONNECTION });
  expect(json).not.toHaveBeenCalled();
});

it("leaves non-500 selection responses for the caller to interpret", async () => {
  const data = { message: "Not found" };
  fetchMock.mockResolvedValue({ status: 404, ok: false, json: async () => data });
  expect(await fetchCivitaiPostImagesForSelection({ postId: 7, nsfwLevel: "None" })).toBe(data);
});

it.each([false, true])("preserves upload URL parameters with NSFW mode %s", async (nsfwMode) => {
  fetchMock.mockResolvedValue({ json: async () => ({ items: [] }) });
  await fetchCivitaiPostImagesForUpload({ postId: 7, modelId: 42, versionId: 9, nsfwMode });
  expect(fetchMock).toHaveBeenCalledWith(`https://civitai.com/api/v1/images?postId=7&modelId=42&modelVersionId=9&nsfw=${nsfwMode ? "X" : "None"}`);
});

it.each([undefined, null])("preserves raw missing upload IDs: %s", async (id) => {
  fetchMock.mockResolvedValue({ status: 500, json: async () => ({ items: [] }) });
  expect(await fetchCivitaiPostImagesForUpload({ postId: 7, modelId: id, versionId: id, nsfwMode: false })).toEqual({ items: [] });
  expect(fetchMock).toHaveBeenCalledWith(`https://civitai.com/api/v1/images?postId=7&modelId=${id}&modelVersionId=${id}&nsfw=None`);
});

const requests = [
  { name: "feed", request: () => fetchCivitaiImagePage("feed", signal) },
  { name: "selection", request: () => fetchCivitaiPostImagesForSelection({ postId: 7, nsfwLevel: "None" }) },
  { name: "upload", request: () => fetchCivitaiPostImagesForUpload({ postId: 7, nsfwMode: false }) },
];
it.each(requests)("passes through $name network/cancellation errors", async ({ request }) => {
  const error = new DOMException("Cancelled", "AbortError");
  fetchMock.mockRejectedValue(error);
  await expect(request()).rejects.toBe(error);
});
it.each(requests)("passes through $name JSON errors", async ({ request }) => {
  const error = new SyntaxError("Invalid JSON");
  fetchMock.mockResolvedValue({ status: 200, json: async () => { throw error; } });
  await expect(request()).rejects.toBe(error);
});
