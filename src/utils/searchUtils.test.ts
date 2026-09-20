import { describe, expect, it } from "vitest";
import { parseSearchFilterParams } from "./searchUtils";

describe("parseSearchFilterParams", () => {
  it("uses empty selections, false flags, and null sorting for missing parameters", () => {
    expect(parseSearchFilterParams(new URLSearchParams())).toEqual({
      modelType: [],
      baseModel: [],
      hashtag: false,
      creator: false,
      sort: null,
    });
  });

  it("drops empty list entries while preserving whitespace, duplicates, and order", () => {
    const params = new URLSearchParams({
      modelType: ",lora,,checkpoint,lora,",
      baseModel: "SD 1.5, SDXL,,SD 1.5",
      sort: "Highest Rated",
    });
    expect(parseSearchFilterParams(params)).toEqual({
      modelType: ["lora", "checkpoint", "lora"],
      baseModel: ["SD 1.5", " SDXL", "SD 1.5"],
      hashtag: false,
      creator: false,
      sort: "Highest Rated",
    });
  });

  it.each([
    ["true", true],
    ["false", false],
    ["TRUE", false],
    ["1", false],
    ["", false],
  ])("interprets flag value %j as %j", (value, expected) => {
    const params = new URLSearchParams({ hashtag: value, creator: value });
    expect(parseSearchFilterParams(params)).toMatchObject({
      hashtag: expected,
      creator: expected,
    });
  });

  it("preserves explicit empty values and uses the first repeated parameter", () => {
    const params = new URLSearchParams(
      "modelType=&modelType=lora&baseModel=&sort=&sort=Newest&hashtag=false&hashtag=true",
    );
    expect(parseSearchFilterParams(params)).toEqual({
      modelType: [],
      baseModel: [],
      hashtag: false,
      creator: false,
      sort: "",
    });
  });

  it("leaves the URL unchanged and search-source selection to the caller", () => {
    const params = new URLSearchParams(
      "searchSrc=civitai&src=aitools&searchQuery=landscape&modelType=lora",
    );
    const original = params.toString();
    expect(parseSearchFilterParams(params)).toEqual({
      modelType: ["lora"],
      baseModel: [],
      hashtag: false,
      creator: false,
      sort: null,
    });
    expect(params.toString()).toBe(original);
  });
});
