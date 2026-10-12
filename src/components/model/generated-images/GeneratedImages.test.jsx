// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router-dom";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import GeneratedImages from "./GeneratedImages";
import Model from "../../../pages/Model";
import modelSlice, { modelActions } from "../../../store/model";
import { fetchModelData } from "../../../utils/fetch/fetchModel";

vi.mock("../../../utils/fetch/fetchModel", () => ({ fetchModelData: vi.fn() }));
vi.mock("../../../utils/modelUtils", async (importOriginal) => ({
  ...await importOriginal(), createModelPreviewData: () => null,
}));
vi.mock("../../../hooks/use-online-status", () => ({ useOnlineStatus: () => true }));
vi.mock("./external-images/ExternalImages", () => ({
  default: ({ versionId }) => <output data-testid="all-images-version">{versionId}</output>,
}));
vi.mock("./saved-images/SavedImages", () => ({
  default: ({ versionId }) => <output data-testid="saved-images-version">{versionId}</output>,
}));
vi.mock("../model-versions-list/ModelVersionsList", () => ({
  default: ({ itemComponent, curVersionId, modelVersions, onClick }) => (
    <div data-testid={itemComponent === "span" ? "generated-picker" : "model-picker"}>
      <output>{curVersionId}</output>
      {modelVersions.map((version) => <button key={version.id} id={version.id} onClick={onClick}>
        Version {version.id}
      </button>)}
    </div>
  ),
}));
vi.mock("../../ui/Modal", () => ({ default: () => null }));
vi.mock("../../forms/save-image-form/SaveImageForm", () => ({ default: () => null }));
vi.mock("../../ui/buttons/ButtonInfo", () => ({ default: () => null }));
vi.mock("../../general-elements/info/InfoGeneratedImages", () => ({ default: () => null }));
vi.mock("../../general-elements/guide/model/GeneratedImagesGuide", () => ({ default: () => null }));
vi.mock("../model-tooltip/ModelTooltip", () => ({ default: () => null }));
vi.mock("../model-info/ModelInfo", () => ({ default: () => null }));
vi.mock("../tags/ModelTags", () => ({ default: () => null }));
vi.mock("../tag-sets/TagSets", () => ({ default: () => null }));
vi.mock("../../general-elements/button-square-add/ButtonSquareAdd", () => ({ default: () => null }));
vi.mock("../../general-elements/guide/model/AddModelToSidePanelGuide", () => ({ default: () => null }));
vi.mock("../model-def-images/ModelDefImages", () => ({ default: () => null }));
vi.mock("../model-version-description/ModelVersionDescription", () => ({ default: () => null }));
vi.mock("../model-navigation-panel/ModelNavigationPanel", () => ({ default: () => null }));
vi.mock("../model-description/ModelDescription", () => ({ default: () => null }));

const versions = [7, 9, 11].map((id, index) => ({ id, index, name: `Version ${id}`, images: [] }));
const model = {
  id: 42, name: "Model", data: { modelVersions: versions, tags: [] },
  modelVersionsCustomData: Object.fromEntries(versions.map(({ id, index }) => [id, {
    versionId: id, index, downloadStatus: true,
  }])),
  savedImages: { 7: [], 9: [], 11: [] },
};
const makeStore = () => configureStore({ reducer: {
  model: modelSlice.reducer,
  auth: (state = { user: { uid: "user" } }) => state,
  general: (state = { nsfwLevel: "None" }) => state,
  guide: (state = { active: false, home: { active: false }, model: { step: 0 } }) => state,
} });
let router;
beforeEach(() => { fetchModelData.mockReset().mockResolvedValue(model); });
afterEach(() => { cleanup(); router?.dispose(); router = undefined; });
const selectGeneratedVersion = (id) => fireEvent.click(
  within(screen.getByTestId("generated-picker")).getByRole("button", { name: `Version ${id}` }),
);
const mountPage = async () => {
  const store = makeStore();
  router = createMemoryRouter([{ path: "/models/:modelId", element: <Model title="Model" /> }], {
    initialEntries: ["/models/42?versionId=7"],
  });
  render(<Provider store={store}><RouterProvider router={router} /></Provider>);
  await waitFor(() => expect(screen.getByTestId("all-images-version").textContent).toBe("7"));
  return store;
};

it.each(["all", "saved"])("keeps the selected generated-image version after saving in the %s tab", async (tab) => {
  const store = await mountPage();
  if (tab === "saved") fireEvent.click(screen.getByText("Saved", { exact: true }));
  selectGeneratedVersion(9);
  const mainVersion = store.getState().model.curVersion;
  await act(async () => store.dispatch(modelActions.updateSavedImages({
    postInfo: { modelId: 42, versionId: 9, postId: 10 }, data: { postId: 10, imagesId: [1] },
  })));
  expect(store.getState().model.model.savedImages[9]).toEqual([{ postId: 10, imagesId: [1] }]);
  expect(store.getState().model.curVersion).toBe(mainVersion);
  expect(screen.getByTestId(`${tab}-images-version`).textContent).toBe("9");
});

it("preserves the generated selection on same-ID version refreshes and follows actual version changes", async () => {
  const store = makeStore();
  store.dispatch(modelActions.setModelData(model));
  store.dispatch(modelActions.setCurVersion({ ...versions[0], modelId: 42 }));
  render(<Provider store={store}><MemoryRouter><GeneratedImages /></MemoryRouter></Provider>);
  selectGeneratedVersion(9);
  await act(async () => store.dispatch(modelActions.setCurVersion({ ...versions[0], modelId: 42, name: "Updated" })));
  expect(screen.getByTestId("all-images-version").textContent).toBe("9");
  await act(async () => store.dispatch(modelActions.setCurVersion({ ...versions[2], modelId: 42 })));
  expect(screen.getByTestId("all-images-version").textContent).toBe("11");
});

it("continues following main-version changes made through the route", async () => {
  const store = await mountPage();
  await act(async () => { await router.navigate("/models/42?versionId=9"); });
  expect(store.getState().model.curVersion.id).toBe(9);
  expect(screen.getByTestId("all-images-version").textContent).toBe("9");
  expect(fetchModelData).toHaveBeenCalledOnce();
});
