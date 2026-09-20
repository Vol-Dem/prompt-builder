import { describe, expect, it, vi } from "vitest";
import promptSlice, { promptActions } from "./prompt";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", () => ({ getFirestore: () => ({}) }));

describe.each([
  { type: "positive", target: "curPromptArr", other: "curNegPromptArr", text: "curPrompt" },
  { type: "negative", target: "curNegPromptArr", other: "curPromptArr", text: "curNegPrompt" },
] as const)("$type prompt insertion", ({ type, target, other, text }) => {
  const initialState = () => {
    let state = promptSlice.getInitialState();
    state = promptSlice.reducer(state, promptActions.setCurPromptArr([
      { id: 3, tag: "portrait", weight: 1, position: 0 },
    ]));
    return promptSlice.reducer(state, promptActions.setCurNegPromptArr([
      { id: 8, tag: "blur", weight: 1, position: 0 },
    ]));
  };

  it("adds a single duplicate with a shared ID and updates the text", () => {
    const before = initialState();
    const value = before[target][0].tag;
    const after = promptSlice.reducer(before, promptActions.addTagToPrompt({ type, value }));

    expect(after[target]).toEqual([
      { ...before[target][0], duplicateId: 1 },
      { id: 9, tag: value, weight: 1, position: 1, duplicateId: 1 },
    ]);
    expect(after[text]).toBe(`${value}, ${value}`);
    expect(after[other]).toBe(before[other]);
  });

  it("honors an explicit zero ID and parses the inserted weight", () => {
    const after = promptSlice.reducer(initialState(), promptActions.addTagToPrompt({
      type, value: "(light:1.5)", id: 0,
    }));
    expect(after[target][1]).toEqual({
      id: 0, tag: "(light:1.5)", weight: 1.5, position: 1, duplicateId: null,
    });
  });

  it("filters existing target tags but keeps new repeats and tags from the other prompt", () => {
    const before = initialState();
    const existing = before[target][0].tag;
    const opposite = before[other][0].tag;
    const after = promptSlice.reducer(before, promptActions.addAllTagsToPrompt({
      type, value: [existing, opposite, "(light:1.5)", "(light:1.5)"],
    }));

    expect(after[target]).toEqual([
      before[target][0],
      { id: 9, tag: opposite, weight: 1, position: 1, duplicateId: null },
      { id: 10, tag: "(light:1.5)", weight: 1.5, position: 2, duplicateId: 1 },
      { id: 11, tag: "(light:1.5)", weight: 1.5, position: 3, duplicateId: 1 },
    ]);
    expect(after[text]).toBe(`${existing}, ${opposite}, (light:1.5), (light:1.5)`);
    expect(after[other]).toBe(before[other]);
  });

  it("leaves state unchanged when the bulk insertion has no new tags", () => {
    const before = initialState();
    for (const value of [[], [before[target][0].tag]]) {
      expect(promptSlice.reducer(before, promptActions.addAllTagsToPrompt({ type, value })))
        .toBe(before);
    }
  });
});
