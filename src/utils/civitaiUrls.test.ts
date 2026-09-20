import { describe, expect, it } from "vitest";
import {
  buildCivitaiImageFeedUrl,
  buildCivitaiPostImagesUrl,
} from "./civitaiUrls";

const endpoint = "https://civitai.com/api/v1/images";

describe("buildCivitaiImageFeedUrl", () => {
  it("builds a model-version feed with its limit, sort, and NSFW level", () => {
    expect(buildCivitaiImageFeedUrl({
      modelId: 12,
      versionId: 34,
      limit: 20,
      sortBy: "Newest",
      nsfwLevel: "2",
    })).toBe(`${endpoint}?modelId=12&modelVersionId=34&limit=20&sort=Newest&nsfw=2&withMeta=true`);
  });

  it("uses the author feed when a username is provided, even with model IDs", () => {
    expect(buildCivitaiImageFeedUrl({
      modelId: 12,
      versionId: 34,
      username: "artist",
      limit: 20,
      sortBy: "Most Reactions",
      nsfwLevel: "X",
    })).toBe(`${endpoint}?username=artist&limit=20&sort=Most Reactions&nsfw=X&withMeta=true`);
  });

  it("keeps raw query values without introducing encoding changes", () => {
    expect(buildCivitaiImageFeedUrl({
      username: "artist+name&suffix",
      sortBy: "Most Comments",
      nsfwLevel: "1,2",
    })).toBe(`${endpoint}?username=artist+name&suffix&sort=Most Comments&nsfw=1,2&withMeta=true`);
  });

  it("omits a zero limit and empty sort while retaining a zero NSFW level", () => {
    expect(buildCivitaiImageFeedUrl({
      modelId: 12,
      versionId: 34,
      username: "",
      limit: 0,
      sortBy: "",
      nsfwLevel: 0,
    })).toBe(`${endpoint}?modelId=12&modelVersionId=34&nsfw=0&withMeta=true`);
  });

  it("preserves missing model IDs as currently serialized by the model feed", () => {
    expect(buildCivitaiImageFeedUrl({ nsfwLevel: "X" })).toBe(
      `${endpoint}?modelId=undefined&modelVersionId=undefined&nsfw=X&withMeta=true`,
    );
  });
});

describe("buildCivitaiPostImagesUrl", () => {
  it("restricts a post request to the selected model", () => {
    expect(buildCivitaiPostImagesUrl({ postId: 56, modelId: 12, nsfwLevel: "1" })).toBe(
      `${endpoint}?postId=56&modelId=12&nsfw=1&withMeta=true`,
    );
  });

  it.each([undefined, null, 0])("omits model filtering for %s", (modelId) => {
    expect(buildCivitaiPostImagesUrl({ postId: 56, modelId, nsfwLevel: "X" })).toBe(
      `${endpoint}?postId=56&nsfw=X&withMeta=true`,
    );
  });

  it("preserves a numeric zero NSFW value", () => {
    expect(buildCivitaiPostImagesUrl({ postId: 56, nsfwLevel: 0 })).toBe(
      `${endpoint}?postId=56&nsfw=0&withMeta=true`,
    );
  });
});
