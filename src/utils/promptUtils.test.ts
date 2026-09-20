import { describe, expect, it } from "vitest";
import { appendPromptTag, appendPromptTags, buildTagSets } from "./promptUtils";
import type { PromptItem } from "../types/prompt.types";

describe("appendPromptTag", () => {
  it("starts an empty prompt at ID and position zero", () => {
    expect(appendPromptTag([], [], { value: "portrait" })).toEqual([
      { id: 0, tag: "portrait", weight: 1, position: 0, duplicateId: null },
    ]);
  });

  it("uses the highest ID across both prompts and the highest target position", () => {
    const current = [
      { id: 4, tag: "first", weight: 1, position: 7 },
      { id: 2, tag: "second", weight: 1, position: 2 },
    ];
    const other = [
      { id: 20, tag: "other", weight: 1, position: 30 },
      { id: 1, tag: "last", weight: 1, position: 0 },
    ];
    expect(appendPromptTag(current, other, { value: "((light))" })).toEqual([
      { ...current[0], duplicateId: null },
      { ...current[1], duplicateId: null },
      { id: 21, tag: "((light))", weight: 1.2, position: 8, duplicateId: null },
    ]);
  });

  it("retains explicit IDs including zero and generates one for null", () => {
    const other = [{ id: 5, tag: "other", weight: 1, position: 0 }];
    for (const id of [0, 10]) {
      expect(appendPromptTag([], other, { value: "new", id })[0].id).toBe(id);
    }
    expect(appendPromptTag([], other, { value: "new", id: null })[0].id).toBe(6);
  });

  it("marks duplicates without mutating frozen inputs or dropping existing metadata", () => {
    const original = Object.freeze({
      id: 0, tag: "portrait", weight: 1, position: 0, duplicateId: null, edit: true,
    });
    const current = Object.freeze([original]);
    const result = appendPromptTag(current, Object.freeze([]), Object.freeze({ value: "portrait" }));
    expect(result).toEqual([
      { ...original, duplicateId: 1 },
      { id: 1, tag: "portrait", weight: 1, position: 1, duplicateId: 1 },
    ]);
    expect(original.duplicateId).toBeNull();
  });
});

describe("appendPromptTags", () => {
  it("starts empty prompts with sequential IDs and positions and parses weights", () => {
    expect(appendPromptTags([], [], {
      type: "positive", value: ["plain", "(light:1.5)", "((detail))"],
    })).toEqual([
      { id: 0, tag: "plain", weight: 1, position: 0, duplicateId: null },
      { id: 1, tag: "(light:1.5)", weight: 1.5, position: 1, duplicateId: null },
      { id: 2, tag: "((detail))", weight: 1.2, position: 2, duplicateId: null },
    ]);
  });

  it("uses exact target matches and retains repeated new values", () => {
    const current = [{ id: 2, tag: "portrait", weight: 1, position: 0 }];
    const other = [{ id: 8, tag: "blur", weight: 1, position: 0 }];
    expect(appendPromptTags(current, other, {
      type: "negative", value: ["portrait", "Portrait", "blur", "new", "new"],
    })).toEqual([
      { ...current[0], duplicateId: null },
      { id: 9, tag: "Portrait", weight: 1, position: 1, duplicateId: null },
      { id: 10, tag: "blur", weight: 1, position: 2, duplicateId: null },
      { id: 11, tag: "new", weight: 1, position: 3, duplicateId: 1 },
      { id: 12, tag: "new", weight: 1, position: 4, duplicateId: 1 },
    ]);
  });

  it("preserves gaps in positions and leaves frozen inputs unchanged", () => {
    const current = [
      Object.freeze({ id: 4, tag: "first", weight: 1, position: 7 }),
      Object.freeze({ id: 2, tag: "second", weight: 1, position: 2 }),
    ];
    Object.freeze(current);
    const other = Object.freeze([Object.freeze({ id: 20, tag: "other", weight: 1, position: 30 })]);
    const value = Object.freeze(["new", "last"]);
    expect(appendPromptTags(current, other, { type: "positive", value })).toEqual([
      { ...current[0], duplicateId: null },
      { ...current[1], duplicateId: null },
      { id: 21, tag: "new", weight: 1, position: 8, duplicateId: null },
      { id: 22, tag: "last", weight: 1, position: 9, duplicateId: null },
    ]);
  });

  it("returns the original array without recalculating markers for a no-op", () => {
    const current: PromptItem[] = [{ id: 0, tag: "portrait", weight: 1, position: 0 }];
    expect(appendPromptTags(current, [], { type: "positive", value: [] })).toBe(current);
    expect(appendPromptTags(current, [], { type: "positive", value: ["portrait"] })).toBe(current);
  });
});

it.each(["BREAK", "<BREAK>"])("keeps %s exempt from duplicate markers in both insertion paths", (tag) => {
  const current = [{ id: 0, tag, weight: 1, position: 0 }];
  expect(appendPromptTag(current, [], { value: tag }).map((item) => item.duplicateId))
    .toEqual([null, null]);
  expect(appendPromptTags([], [], { type: "positive", value: [tag, tag] }).map((item) => item.duplicateId))
    .toEqual([null, null]);
});

describe("buildTagSets", () => {
  it("keeps row order and omits only rows with both fields empty", () => {
    expect(buildTagSets(
      ["", "Portrait", "", "Name only", " "],
      ["", "face, eyes", "value only", "", " "],
    )).toEqual([
      { name: "Portrait", value: "face, eyes" },
      { name: "", value: "value only" },
      { name: "Name only", value: "" },
      { name: " ", value: " " },
    ]);
  });

  it("accepts the repeated text fields collected by TagSetsForm", () => {
    const form = new FormData();
    form.append("set-name", "Portrait");
    form.append("set-value", "face, eyes");
    form.append("set-name", "Lighting");
    form.append("set-value", "soft light");

    expect(buildTagSets(form.getAll("set-name"), form.getAll("set-value"))).toEqual([
      { name: "Portrait", value: "face, eyes" },
      { name: "Lighting", value: "soft light" },
    ]);
  });

  it("replaces submitted fields while retaining existing preview and default metadata", () => {
    const existing = [{
      name: "Old name",
      value: "old tags",
      imgUrl: "preview.webp",
      nsfwImgUrl: "alternate.webp",
      default: false,
    }];
    expect(buildTagSets(["New name"], ["new tags"], existing)).toEqual([{
      ...existing[0], name: "New name", value: "new tags",
    }]);
  });

  it("merges metadata by retained-row position after removing empty rows", () => {
    const existing = [
      { name: "First", value: "first", imgUrl: "first.webp" },
      { name: "Second", value: "second", imgUrl: "second.webp" },
    ];
    expect(buildTagSets(["", "Kept"], ["", "tags"], existing)).toEqual([
      { name: "Kept", value: "tags", imgUrl: "first.webp" },
    ]);
  });

  it("adds new rows without copying another row's metadata", () => {
    const existing = [{ name: "Old", value: "old", imgUrl: "preview.webp" }];
    expect(buildTagSets(["Updated", "New"], ["updated", "new"], existing)).toEqual([
      { name: "Updated", value: "updated", imgUrl: "preview.webp" },
      { name: "New", value: "new" },
    ]);
  });

  it("removes existing tag sets when all submitted rows are empty", () => {
    const existing = [{ name: "Old", value: "old", imgUrl: "preview.webp" }];
    expect(buildTagSets([""], [""], existing)).toEqual([]);
    expect(buildTagSets([], [], existing)).toEqual([]);
  });

  it("creates tag sets when the existing list is empty", () => {
    expect(buildTagSets(["New"], ["tags"], [])).toEqual([
      { name: "New", value: "tags" },
    ]);
  });

  it("does not mutate input arrays or existing metadata objects", () => {
    const names = Object.freeze(["Updated"]);
    const values = Object.freeze(["new tags"]);
    const original = Object.freeze({ name: "Old", value: "old tags", imgUrl: "preview.webp" });
    const existing = Object.freeze([original]);

    const result = buildTagSets(names, values, existing);
    expect(result).toEqual([{ name: "Updated", value: "new tags", imgUrl: "preview.webp" }]);
    expect(result[0]).not.toBe(original);
    expect(existing).toEqual([{ name: "Old", value: "old tags", imgUrl: "preview.webp" }]);
  });
});
