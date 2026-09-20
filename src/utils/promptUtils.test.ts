import { describe, expect, it } from "vitest";
import { buildTagSets } from "./promptUtils";

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
