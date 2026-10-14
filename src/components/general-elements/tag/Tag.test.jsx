// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import Tag from "./Tag";
import ActivationTag from "../activation-tag/ActivationTag";
import classes from "./Tag.module.scss";
import promptSlice, { promptActions } from "../../../store/prompt";
import usedModelsSlice from "../../../store/usedModels";

vi.mock("../../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", () => ({ getFirestore: () => ({}) }));

afterEach(cleanup);

const makeStore = (positive = "", negative = "") => {
  const store = configureStore({ reducer: {
    prompt: promptSlice.reducer, used: usedModelsSlice.reducer,
  } });
  store.dispatch(promptActions.setCurrentPrompt(positive));
  store.dispatch(promptActions.setCurrentNegPrompt(negative));
  return store;
};
const mount = (store, props) => render(<Provider store={store}><Tag {...props} /></Provider>);
const isActive = (element) => element.classList.contains(classes.active);

it("matches whole tags in the selected channel, including weighted tags and BREAK", () => {
  const store = makeStore("portrait, (light:1.5), BREAK\nlandscape", "blur");
  render(<Provider store={store}>
    <Tag tag="portrait" promptType="positive" />
    <Tag tag="port" promptType="positive" />
    <Tag tag="(light:1.5)" promptType="positive" />
    <Tag tag="BREAK" promptType="positive" />
    <Tag tag="blur" promptType="negative" />
  </Provider>);
  for (const tag of ["portrait", "(light:1.5)", "BREAK", "blur"]) {
    expect(isActive(screen.getByText(tag))).toBe(true);
  }
  expect(isActive(screen.getByText("port"))).toBe(false);
});

it("follows prompt edits and changes to the tag and channel props", () => {
  const store = makeStore("portrait", "blur");
  const { rerender } = mount(store, { tag: "portrait", promptType: "positive" });
  expect(isActive(screen.getByText("portrait"))).toBe(true);
  rerender(<Provider store={store}><Tag tag="portrait" promptType="negative" /></Provider>);
  expect(isActive(screen.getByText("portrait"))).toBe(false);
  rerender(<Provider store={store}><Tag tag="blur" promptType="negative" /></Provider>);
  expect(isActive(screen.getByText("blur"))).toBe(true);
  act(() => store.dispatch(promptActions.setCurrentNegPrompt("noise")));
  expect(isActive(screen.getByText("blur"))).toBe(false);
});

it.each(["positive", "negative"])("toggles the %s prompt and adds the related model once", (promptType) => {
  const store = makeStore();
  const modelData = { id: 42, name: "Portrait model" };
  mount(store, { tag: "portrait", promptType, modelData });
  const tag = screen.getByText("portrait");
  const key = promptType === "positive" ? "curPromptArr" : "curNegPromptArr";
  fireEvent.click(tag);
  expect(isActive(tag)).toBe(true);
  expect(store.getState().prompt[key]).toMatchObject([{ id: 0, tag: "portrait", weight: 1 }]);
  expect(store.getState().used.models).toEqual([modelData]);
  fireEvent.click(tag);
  expect(isActive(tag)).toBe(false);
  expect(store.getState().prompt[key]).toEqual([]);
  fireEvent.click(tag);
  expect(store.getState().used.models).toEqual([modelData]);
});

it("keeps membership through mode changes and clears it on prompt reset", () => {
  const store = makeStore("portrait");
  mount(store, { tag: "portrait", promptType: "positive" });
  for (const mode of [true, false]) {
    act(() => store.dispatch(promptActions.setTextMode(mode)));
    expect(isActive(screen.getByText("portrait"))).toBe(true);
  }
  act(() => store.dispatch(promptActions.clearPrompt()));
  expect(isActive(screen.getByText("portrait"))).toBe(false);
});

it("retains the activation-tag weight draft before adding the tag", () => {
  const store = makeStore();
  render(<Provider store={store}><ActivationTag tag="<lora:portrait:1>" /></Provider>);
  fireEvent.click(screen.getByTitle("up"));
  const tag = screen.getByText("<lora:portrait:1.1>");
  expect(store.getState().prompt.curPromptArr).toEqual([]);
  fireEvent.click(tag);
  expect(store.getState().prompt.curPromptArr).toMatchObject([
    { tag: "<lora:portrait:1.1>", weight: 1.1 },
  ]);
  expect(isActive(tag)).toBe(true);
});
