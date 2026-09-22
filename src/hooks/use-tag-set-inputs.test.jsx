// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import useTagSetInputs from "./use-tag-set-inputs";
import { createTagSetsInputData } from "../utils/promptUtils";
import { FORMS_DEF_TAGS_INPUT } from "../variables/structures";

afterEach(cleanup);

const savedFields = () => createTagSetsInputData(
  [{ name: "Portrait", value: "soft light" }],
  FORMS_DEF_TAGS_INPUT,
);

it("updates names, tags and validity without mutating hydrated data", () => {
  const { result } = renderHook(useTagSetInputs);
  const initial = savedFields();
  act(() => result.current.reset(initial));

  act(() => {
    result.current.change({ target: { id: initial[0][0].id, value: "Landscape" } }, false);
    result.current.change({ target: { id: initial[0][1].id, value: "sunset" } }, null);
  });

  expect(result.current.fields[0][0]).toMatchObject({ value: "Landscape", isValid: false });
  expect(result.current.fields[0][1]).toMatchObject({ value: "sunset", isValid: null });
  expect(initial).toEqual(savedFields());
});

it("can remove every row and add a fresh editable row afterwards", () => {
  const { result } = renderHook(useTagSetInputs);
  act(() => result.current.reset(savedFields()));
  act(() => result.current.add());
  const addedRow = result.current.fields[1];
  expect(addedRow.map(({ value, isValid }) => ({ value, isValid }))).toEqual([
    { value: "", isValid: true }, { value: "", isValid: true },
  ]);
  act(() => result.current.remove(0));
  expect(result.current.fields).toEqual([addedRow]);
  act(() => result.current.remove(0));
  expect(result.current.fields).toEqual([]);
  act(() => result.current.add());
  const id = result.current.fields[0][0].id;
  act(() => result.current.change({ target: { id, value: "New set" } }, true));
  expect(result.current.fields[0][0].value).toBe("New set");
});

it("replaces dirty fields and validation when the owner resets for another version", () => {
  const { result } = renderHook(useTagSetInputs);
  act(() => result.current.reset(savedFields()));
  act(() => result.current.change({ target: { id: result.current.fields[0][0].id, value: "Dirty" } }, false));
  act(() => result.current.add());
  const replacement = createTagSetsInputData(undefined, FORMS_DEF_TAGS_INPUT);
  act(() => result.current.reset(replacement));
  expect(result.current.fields).toEqual(replacement);
  expect(result.current.fields).toHaveLength(1);
});
