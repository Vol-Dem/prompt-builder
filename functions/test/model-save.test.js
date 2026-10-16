import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { updateModelHandler } from "../src/models/model.handler";
import { fetchImages } from "../src/integrations/civitai";

const { documents, now } = vi.hoisted(() => ({
  documents: new Map(),
  now: 1_000_000,
}));

vi.mock("firebase-admin/firestore", () => {
  const reference = (path) => ({
    get: async () => ({
      exists: documents.has(path),
      data: () => documents.get(path),
    }),
    set: async (data) => { documents.set(path, data); },
    update: async (data) => {
      documents.set(path, { ...documents.get(path), ...data });
    },
    collection: (name) => ({ doc: (id) => reference(`${path}/${name}/${id}`) }),
  });
  return {
    getFirestore: () => ({
      collection: (name) => ({ doc: (id) => reference(`${name}/${id}`) }),
    }),
    Timestamp: { now: () => ({ toMillis: () => now }) },
  };
});

const image = {
  id: 10, postId: 20, hash: "preview-hash", url: "https://images.example/preview.jpg",
  type: "image", createdAt: "2026-10-16T00:00:00Z", nsfw: false, nsfwLevel: 1,
  height: 512, width: 512, meta: { prompt: "portrait" },
};
const model = {
  id: 42, name: "New model", description: "Description", creator: { username: "Creator" },
  modelVersions: [{ id: 7, name: "Version", index: 0, images: [image] }],
};
const request = { data: { id: 42 }, auth: { uid: "user-1" } };
const fetchMock = vi.fn();

beforeEach(() => {
  documents.clear();
  fetchMock.mockReset().mockImplementation(async (url) => {
    const endpoint = new URL(url);
    if (endpoint.pathname === "/api/v1/models/42") {
      return Response.json(model);
    }
    if (endpoint.pathname === "/api/v1/images") {
      // Reproduce the Civitai failure addressed by the frontend's Newest workaround.
      if (endpoint.searchParams.get("sort") === "Oldest") {
        return new Response("<!DOCTYPE html><html>Forbidden</html>", {
          status: 403, headers: { "Content-Type": "text/html" },
        });
      }
      return Response.json({ items: [image] });
    }
    throw new Error(`Unexpected URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

it("saves a new model and its images on the first attempt when Oldest requests return HTML", async () => {
  const result = await updateModelHandler(request);

  expect(result).toMatchObject({ modelId: 42, modelData: model, message: "Upload complete" });
  expect(documents.get("models/42")).toMatchObject({ ...model, updatedAt: now });
  expect(documents.get("models/42/defaultImages/7")).toMatchObject({ items: [image] });
  expect(fetchMock).toHaveBeenCalledTimes(2);

  const imageUrl = new URL(fetchMock.mock.calls[1][0]);
  expect(Object.fromEntries(imageUrl.searchParams)).toEqual({
    modelId: "42", modelVersionId: "7", username: "Creator",
    nsfw: "X", limit: "200", sort: "Newest",
  });
});

it("uses the same image-request workaround when an existing model gains a version", async () => {
  documents.set("models/42", { ...model, modelVersions: [], updatedAt: 0 });

  const result = await updateModelHandler(request);

  expect(result).toMatchObject({ modelId: 42, updated: true, message: "Update complete" });
  expect(documents.get("models/42").modelVersions).toEqual(model.modelVersions);
  expect(documents.get("models/42/defaultImages/7")).toMatchObject({ items: [image] });
});

it("keeps the cached-model path free of Civitai requests", async () => {
  documents.set("models/42", { ...model, updatedAt: now });

  const result = await updateModelHandler(request);

  expect(result).toMatchObject({ modelId: 42, updated: false, message: "Already up to date" });
  expect(fetchMock).not.toHaveBeenCalled();
});

it("identifies rejected image requests without parsing their HTML error body", async () => {
  const json = vi.fn().mockRejectedValue(new SyntaxError("Unexpected token '<'"));
  fetchMock.mockResolvedValue({ ok: false, status: 403, json });

  await expect(fetchImages(42, 7, "Creator")).rejects.toMatchObject({
    code: "unavailable", message: "Civitai image request failed (HTTP 403)",
  });
  expect(json).not.toHaveBeenCalled();
});
