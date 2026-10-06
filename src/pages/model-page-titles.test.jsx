// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Model from "./Model";
import ModelEdit from "./Edit";
import usePageTitle from "../hooks/use-page-title";
import { fetchModelData } from "../utils/fetch/fetchModel";
import { fetchPublicModel } from "../utils/fetch/fetchModelReads";
import { DEFAULT_PAGE_TITLE } from "../variables/constants";

const { dispatch, state } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  state: {
    auth: { user: { uid: "user-1" } },
    general: { nsfwLevel: 0 },
    model: { model: null, curVersion: null },
    guide: { home: { active: false }, active: false },
  },
}));
vi.mock("../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector(state),
}));
vi.mock("../store/model", () => ({
  modelActions: Object.fromEntries([
    "resetModelData", "setModelData", "setErrorMessage", "setCurVersion",
    "setActiveCarouselData", "setModelPreview", "updateModelDataField",
  ].map((name) => [name, (payload) => ({ type: `model/${name}`, payload })])),
}));
vi.mock("../store/guide", () => ({ guideActions: {} }));
vi.mock("../utils/fetch/fetchModel", () => ({ fetchModelData: vi.fn() }));
vi.mock("../utils/fetch/fetchModelReads", () => ({
  fetchPublicModel: vi.fn(),
  subscribeToUserModel: () => vi.fn(),
}));
vi.mock("../utils/modelUtils", () => ({
  createModelPreviewData: () => null,
  getInitialVersionData: () => null,
}));
vi.mock("../components/model/model-info/ModelInfo", () => ({ default: () => null }));
vi.mock("../components/model/tags/ModelTags", () => ({ default: () => null }));
vi.mock("../components/model/generated-images/GeneratedImages", () => ({ default: () => null }));
vi.mock("../components/model/tag-sets/TagSets", () => ({ default: () => null }));
vi.mock("../components/general-elements/button-square-add/ButtonSquareAdd", () => ({ default: () => null }));
vi.mock("../components/general-elements/guide/model/AddModelToSidePanelGuide", () => ({ default: () => null }));
vi.mock("../components/model/model-def-images/ModelDefImages", () => ({ default: () => null }));
vi.mock("../components/model/model-version-description/ModelVersionDescription", () => ({ default: () => null }));
vi.mock("../components/model/model-navigation-panel/ModelNavigationPanel", () => ({ default: () => null }));
vi.mock("../components/model/model-description/ModelDescription", () => ({ default: () => null }));
vi.mock("../components/model/model-versions-list/ModelVersionsList", () => ({ default: () => null }));
vi.mock("../components/model/model-settings/ModelSettings", () => ({ default: () => null }));
vi.mock("../components/ui/Modal", () => ({ default: () => null }));
vi.mock("../components/general-elements/guide/OutroGuide", () => ({ default: () => null }));

const requests = new Map();
const pendingRead = (id) => new Promise((resolve, reject) => {
  requests.set(id, { resolve, reject });
});
const resolveRead = (id, data) => act(async () => { requests.get(id).resolve(data); });

beforeEach(() => {
  vi.clearAllMocks();
  requests.clear();
  document.title = DEFAULT_PAGE_TITLE;
  fetchModelData.mockImplementation(pendingRead);
  fetchPublicModel.mockImplementation(pendingRead);
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const Destination = () => {
  usePageTitle("Profile");
  return <div>Destination page</div>;
};

describe.each([
  { name: "Model", Page: Model, fallback: "Model", format: (name) => name },
  { name: "Edit", Page: ModelEdit, fallback: "Edit", format: (name) => `Edit - ${name}` },
])("$name page titles", ({ Page, fallback, format }) => {
  const mount = () => {
    const router = createMemoryRouter([
      { path: "/models/:modelId", element: <Page title={fallback} /> },
      { path: "/profile", element: <Destination /> },
    ], { initialEntries: ["/models/42"] });
    return { router, ...render(<RouterProvider router={router} />) };
  };

  it("sets the fallback immediately and uses the loaded name", async () => {
    const { router, unmount } = mount();
    try {
      expect(document.title).toBe(fallback);
      await resolveRead("42", { name: "Portrait" });
      expect(document.title).toBe(format("Portrait"));
      unmount();
      expect(document.title).toBe(DEFAULT_PAGE_TITLE);
    } finally { unmount(); router.dispose(); }
  });

  it.each([null, { name: "" }])("retains the fallback for unnamed data: %j", async (data) => {
    const { router, unmount } = mount();
    try {
      await resolveRead("42", data);
      expect(document.title).toBe(fallback);
    } finally { unmount(); router.dispose(); }
  });

  it("ignores older responses after navigation to another model", async () => {
    const { router, unmount } = mount();
    try {
      await act(async () => { await router.navigate("/models/43"); });
      await resolveRead("43", { name: "Current model" });
      expect(document.title).toBe(format("Current model"));
      await resolveRead("42", { name: "Old model" });
      expect(document.title).toBe(format("Current model"));
    } finally { unmount(); router.dispose(); }
  });

  it("resets a loaded title while the next model loads and retains the fallback on failure", async () => {
    const { router, unmount } = mount();
    try {
      await resolveRead("42", { name: "Old model" });
      await act(async () => { await router.navigate("/models/43"); });
      expect(document.title).toBe(fallback);
      await act(async () => { requests.get("43").reject(new Error("Read failed")); });
      expect(document.title).toBe(fallback);
    } finally { unmount(); router.dispose(); }
  });

  it("keeps the destination title when an unmounted page's request finishes", async () => {
    const { router, unmount } = mount();
    try {
      await act(async () => { await router.navigate("/profile"); });
      expect(screen.getByText("Destination page")).toBeTruthy();
      expect(document.title).toBe("Profile");
      await resolveRead("42", { name: "Old model" });
      expect(document.title).toBe("Profile");
    } finally { unmount(); router.dispose(); }
  });
});
