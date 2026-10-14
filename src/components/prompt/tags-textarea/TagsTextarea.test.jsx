// @vitest-environment jsdom
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, createEvent, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import TagsTextarea from "./TagsTextarea";
import PromptField from "../prompt-field/PromptField";
import PromptModeSwitch from "../prompt-mode-switch/PromptModeSwitch";
import itemClasses from "./tags-textarea-item/TagsTextareaItem.module.scss";
import promptSlice, { promptActions } from "../../../store/prompt";
import usedModelsSlice from "../../../store/usedModels";
import { sessionPersistenceMiddleware } from "../../../store/sessionPersistence";

vi.mock("../../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: { uid: "prompt-user" } }) }));
vi.mock("firebase/firestore", () => ({ getFirestore: () => ({}) }));
// Keep controls and state real; jsdom cannot complete shared-layout exit animations.
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(),
  AnimatePresence: ({ children }) => children,
}));

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
beforeEach(() => {
  sessionStorage.clear();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  if (originalScrollIntoView) HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  else delete HTMLElement.prototype.scrollIntoView;
});

const makeStore = (positive = "", negative = "") => {
  const store = configureStore({
    reducer: { prompt: promptSlice.reducer, used: usedModelsSlice.reducer },
    middleware: (getDefault) => getDefault().concat(sessionPersistenceMiddleware),
  });
  store.dispatch(promptActions.setCurrentPrompt(positive));
  store.dispatch(promptActions.setCurrentNegPrompt(negative));
  return store;
};
const mount = (store) => {
  const view = render(<Provider store={store}>
    <TagsTextarea promptType="positive" placeholder="Positive tags" aditionalPlacegholder="Add tags" />
    <TagsTextarea promptType="negative" placeholder="Negative tags" />
  </Provider>);
  const field = (type = "positive") => view.container.querySelector(`ul[data-type="${type}"]`);
  const rows = (type) => [...field(type).querySelectorAll("[data-item]")];
  const row = (id, type) => rows(type).find((element) => JSON.parse(element.dataset.item).id === id);
  return { ...view, field, rows, row };
};
const rowData = (element) => JSON.parse(element.dataset.item);
const transfer = () => {
  const data = new Map();
  return { setData: (type, value) => data.set(type, value), getData: (type) => data.get(type) || "" };
};
const dragOver = (element, dataTransfer, side = "right") => {
  const event = createEvent.dragOver(element, { dataTransfer });
  Object.defineProperty(event, "clientX", { value: side === "left" ? -1 : 1 });
  fireEvent(element, event);
};

it("renders canonical IDs, weights, duplicate marks, and BREAK tags", () => {
  const store = makeStore("portrait, portrait, (light:1.5), BREAK", "blur");
  const { rows, row } = mount(store);
  expect(rows().map(rowData)).toEqual(store.getState().prompt.curPromptArr.map((item) => ({
    ...item, dropLeft: null, type: "positive",
  })));
  expect(row(0).querySelector(`.${itemClasses["tag--duplicate-1"]}`)).toBeTruthy();
  expect(row(1).querySelector(`.${itemClasses["tag--duplicate-1"]}`)).toBeTruthy();
  expect(row(2).textContent).toBe("(light:1.5)");
  expect(row(3).querySelector(`.${itemClasses["tag--break"]}`)).toBeTruthy();
  expect(rows("negative").map(rowData)).toMatchObject([{ id: 4, tag: "blur", weight: 1 }]);
});

it("edits one tag at a time, including ID zero, and submits its weight", () => {
  const store = makeStore("portrait, portrait");
  const { row } = mount(store);
  fireEvent.click(within(row(0)).getByText("portrait"));
  expect(within(row(0)).getAllByRole("textbox").map((input) => input.value)).toEqual(["portrait", "1"]);
  expect(store.getState().prompt.curPromptArr[0].edit).toBeUndefined();
  fireEvent.click(within(row(1)).getByText("portrait"));
  expect(within(row(0)).queryByRole("textbox")).toBeNull();
  fireEvent.change(row(1).querySelector('input[name="tag"]'), { target: { value: "light" } });
  fireEvent.click(within(row(1)).getByTitle("up"));
  fireEvent.click(within(row(1)).getByTitle("Submit"));
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(store.getState().prompt.curPromptArr).toMatchObject([
    { id: 0, tag: "portrait", position: 0, weight: 1, duplicateId: null },
    { id: 1, tag: "(light:1.1)", position: 1, weight: 1.1, duplicateId: null },
  ]);
  expect(rowData(row(1)).tag).toBe("(light:1.1)");
  expect(JSON.parse(sessionStorage.getItem("prompt-user-prompt"))).toBe("portrait, (light:1.1)");
});

it("closes inline editing when the other prompt array changes", () => {
  const store = makeStore("portrait", "blur");
  const { row } = mount(store);
  fireEvent.click(within(row(0)).getByText("portrait"));
  fireEvent.change(row(0).querySelector('input[name="tag"]'), { target: { value: "unsaved" } });
  act(() => store.dispatch(promptActions.addTagToPrompt({ type: "negative", value: "noise" })));
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(rowData(row(0)).tag).toBe("portrait");
  expect(store.getState().prompt.curPromptArr[0].tag).toBe("portrait");
});

it("keeps drop markers local and clears them on leave, drag end, and prompt changes", () => {
  const store = makeStore("portrait, light");
  const { row } = mount(store);
  const dataTransfer = transfer();
  dragOver(row(1), dataTransfer, "left");
  expect(row(1).classList.contains(itemClasses["drop-left"])).toBe(true);
  expect(store.getState().prompt.curPromptArr[1].dropLeft).toBeUndefined();
  fireEvent.dragLeave(row(1));
  expect(rowData(row(1)).dropLeft).toBeNull();
  dragOver(row(1), dataTransfer);
  expect(row(1).classList.contains(itemClasses["drop-right"])).toBe(true);
  fireEvent.dragEnd(row(0).querySelector("[draggable]"));
  expect(rowData(row(1)).dropLeft).toBeNull();
  dragOver(row(1), dataTransfer);
  act(() => store.dispatch(promptActions.addTagToPrompt({ type: "negative", value: "blur" })));
  expect(rowData(row(1)).dropLeft).toBeNull();
});

it("reorders tags using current positions and clears the drop indicator", () => {
  const store = makeStore("portrait, light, landscape");
  const { row, rows } = mount(store);
  const dataTransfer = transfer();
  fireEvent.dragStart(row(0).querySelector("[draggable]"), { dataTransfer });
  expect(JSON.parse(dataTransfer.getData("text/plain"))).toMatchObject({ id: 0, position: 0, type: "positive" });
  dragOver(row(2), dataTransfer);
  fireEvent.drop(row(2), { dataTransfer });
  expect(store.getState().prompt.curPromptArr.map(({ id, tag, position }) => ({ id, tag, position }))).toEqual([
    { id: 1, tag: "light", position: 0 },
    { id: 2, tag: "landscape", position: 1 },
    { id: 0, tag: "portrait", position: 2 },
  ]);
  expect(rows().map((element) => rowData(element).id)).toEqual([1, 2, 0]);
  expect(rowData(row(2)).dropLeft).toBeNull();
});

it("moves a tag to a different prompt at the chosen side and keeps duplicate marks", async () => {
  const store = makeStore("portrait, light", "portrait, blur");
  const { row, rows } = mount(store);
  const dataTransfer = transfer();
  fireEvent.dragStart(row(0).querySelector("[draggable]"), { dataTransfer });
  dragOver(row(3, "negative"), dataTransfer, "left");
  fireEvent.drop(row(3, "negative"), { dataTransfer });
  expect(store.getState().prompt.curPromptArr.map(({ id }) => id)).toEqual([1]);
  expect(store.getState().prompt.curNegPromptArr).toMatchObject([
    { id: 2, tag: "portrait", position: 0, duplicateId: 1 },
    { id: 0, tag: "portrait", position: 1, duplicateId: 1 },
    { id: 3, tag: "blur", position: 2, duplicateId: null },
  ]);
  await waitFor(() => expect(rows().map((element) => rowData(element).id)).toEqual([1]));
  expect(rows("negative").map((element) => rowData(element).id)).toEqual([2, 0, 3]);
  expect(JSON.parse(sessionStorage.getItem("prompt-user-neg-prompt"))).toBe("portrait, portrait, blur");
});

it("appends a weighted tag to an empty prompt and shows placeholders on reset", async () => {
  const store = makeStore("(light:1.5)");
  const { field, row, rows } = mount(store);
  const dataTransfer = transfer();
  fireEvent.dragStart(row(0).querySelector("[draggable]"), { dataTransfer });
  fireEvent.drop(field("negative"), { dataTransfer });
  expect(store.getState().prompt.curNegPromptArr).toMatchObject([
    { id: 0, tag: "(light:1.5)", weight: 1.5, position: 0 },
  ]);
  await waitFor(() => expect(rows()).toHaveLength(0));
  expect(screen.getByText("Positive tags")).toBeTruthy();
  expect(screen.getByText("Add tags")).toBeTruthy();
  act(() => store.dispatch(promptActions.clearPrompt()));
  await waitFor(() => expect(rows("negative")).toHaveLength(0));
  expect(screen.getByText("Negative tags")).toBeTruthy();
  expect(JSON.parse(sessionStorage.getItem("prompt-user-prompt"))).toBe("");
  expect(JSON.parse(sessionStorage.getItem("prompt-user-neg-prompt"))).toBe("");
});

it("renders current tokens after changing text and returning to tags mode", () => {
  const store = makeStore("portrait");
  const Field = () => {
    const prompt = useSelector((state) => state.prompt.curPrompt);
    const dispatch = useDispatch();
    return <><PromptModeSwitch /><PromptField promptType="positive"
      placeholderText="Prompt text" placeholderTags="Prompt tags" minHeight={100} maxHeight={400}
      prompt={prompt} promptHandler={(event) => dispatch(promptActions.setCurrentPrompt(event.target.value))}
      onPromptResize={vi.fn()} /></>;
  };
  render(<Provider store={store}><Field /></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "Text" }));
  fireEvent.change(screen.getByPlaceholderText("Prompt text"), { target: { value: "landscape, (light:1.5)" } });
  fireEvent.click(screen.getByRole("button", { name: "Tags" }));
  expect(screen.queryByPlaceholderText("Prompt text")).toBeNull();
  expect(screen.getByText("landscape")).toBeTruthy();
  expect(screen.getByText("(light:1.5)")).toBeTruthy();
  expect(screen.queryByText("portrait")).toBeNull();
  expect(store.getState().prompt.curPromptArr).toMatchObject([
    { id: 0, tag: "landscape", weight: 1 }, { id: 1, tag: "(light:1.5)", weight: 1.5 },
  ]);
  expect(JSON.parse(sessionStorage.getItem("prompt-user-prompt-text"))).toEqual({ isTextMode: false });
});
