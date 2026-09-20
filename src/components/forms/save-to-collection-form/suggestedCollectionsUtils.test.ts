import { describe, expect, it } from "vitest";
import type { CollectionCategory } from "../../../../shared/types/user";
import { getSuggestedCollections } from "./suggestedCollectionsUtils";

const image = (prompt?: string) => ({ meta: { prompt } });
const ids = (suggestions: ReturnType<typeof getSuggestedCollections>) =>
  suggestions.map((suggestion) => suggestion.collectionId);

describe("getSuggestedCollections", () => {
  it("matches all significant name words across prompts using case-insensitive substrings", () => {
    const categories = [{
      id: "animals", name: "Animals", collectionNames: [
        { id: 1, name: "CAT and (Dog)!" },
        { id: 2, name: "Cat Fox" },
        { id: 3, name: "For Dog" },
      ],
    }];
    expect(ids(getSuggestedCollections(
      [image("a catalog"), image(), image("DOG portrait")], categories, "name",
    ))).toEqual([1, 3]);
  });

  it("returns no suggestions for missing collections or unmatched prompts", () => {
    expect(getSuggestedCollections([image("cat")], [], "name")).toEqual([]);
    expect(getSuggestedCollections([image("cat")], [{ id: "empty", name: "Empty" }], "name")).toEqual([]);
    expect(getSuggestedCollections([image()], [{
      id: "animals", name: "Animals", collectionNames: [{ id: 1, name: "Cat" }],
    }], "name")).toEqual([]);
  });

  it("preserves matching of names containing only ignored words or punctuation", () => {
    const categories = [{
      id: "misc", name: "Misc", collectionNames: [
        { id: 1, name: "in and or for on" },
        { id: 2, name: "!!!" },
        { id: 3, name: "Cat" },
      ],
    }];
    expect(ids(getSuggestedCollections([], categories, "name"))).toEqual([2, 1]);
  });

  it("keeps the last matching occurrence of a duplicate collection ID", () => {
    const categories = [
      { id: "first", name: "First", collectionNames: [{ id: 7, name: "Cat" }] },
      { id: "last", name: "Last", collectionNames: [{ id: 7, name: "Cat" }] },
      { id: "unmatched", name: "Other", collectionNames: [{ id: 7, name: "Dog" }] },
    ];
    expect(getSuggestedCollections([image("cat")], categories, "name")).toEqual([{
      categoryId: "last", categoryName: "Last", collectionId: 7,
      collectionName: "Cat", collectionSubcategories: undefined,
    }]);
  });

  it("retains zero IDs under the existing duplicate-filter rules", () => {
    const categories = [{
      id: "animals", name: "Animals", collectionNames: [
        { id: 0, name: "Cat" }, { id: 0, name: "Dog" },
      ],
    }];
    expect(ids(getSuggestedCollections([image("cat dog")], categories, "name"))).toEqual([0, 0]);
  });

  it("resolves subcategory names in collection order and skips missing or empty names", () => {
    const categories = [{
      id: "animals", name: "Animals",
      subcategories: [{ id: "a", name: "Wild" }, { id: "b", name: "Domestic" }, { id: "empty", name: "" }],
      collectionNames: [{ id: 1, name: "Cat", subcategories: ["b", "missing", "a", "empty", "b"] }],
    }];
    expect(getSuggestedCollections([image("cat")], categories, "name")[0]?.collectionSubcategories)
      .toEqual(["Domestic", "Wild", "Domestic"]);
  });

  const categories: CollectionCategory[] = [
    { id: "z", name: "Zoo", collectionNames: [{ id: 1, name: "alpha" }, { id: 2, name: "Beta" }] },
    { id: "a", name: "Alpha", collectionNames: [{ id: 3, name: "beta" }, { id: 4, name: "gamma" }] },
  ];

  it("sorts by collection name with category order breaking equal-name ties", () => {
    expect(ids(getSuggestedCollections([image("alpha beta gamma")], categories, "name"))).toEqual([1, 3, 2, 4]);
  });

  it("sorts by category while retaining name order within each category", () => {
    expect(ids(getSuggestedCollections([image("alpha beta gamma")], categories, "category"))).toEqual([3, 4, 1, 2]);
  });

  it("leaves the supplied images and category data unchanged", () => {
    const images = [image("alpha beta gamma")];
    const before = structuredClone({ images, categories });
    getSuggestedCollections(images, categories, "category");
    expect({ images, categories }).toEqual(before);
  });
});
