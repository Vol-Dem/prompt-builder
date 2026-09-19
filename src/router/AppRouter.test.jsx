// @vitest-environment jsdom
import { Suspense, useEffect } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  createBrowserRouter,
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useParams,
  useRouteError,
} from "react-router-dom";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { initAuth } from "../store/auth";

const checks = vi.hoisted(() => ({
  layoutMounted: vi.fn(),
  failingPage: null,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createBrowserRouter: vi.fn(actual.createBrowserRouter) };
});
vi.mock("../store/auth", () => ({
  initAuth: vi.fn(() => ({ type: "auth/initialize" })),
}));
vi.mock("../store/general", () => ({
  generalActions: { setIsMobile: (value) => ({ type: "general/mobile", payload: value }) },
}));
vi.mock("../utils/generalUtils", () => ({ checkIsMobile: () => false }));
vi.mock("../components/layout/layout/Layout", () => ({
  default: () => {
    useEffect(() => { checks.layoutMounted(); }, []);
    return (
      <div data-testid="layout">
        <input aria-label="Layout note" />
        <Suspense fallback={<div role="status">Loading</div>}>
          <Outlet />
        </Suspense>
      </div>
    );
  },
}));
vi.mock("../pages/ErrorPage", () => ({
  default: () => {
    const error = useRouteError();
    return <div role="alert">{error.status || error.message}</div>;
  },
}));
vi.mock("../pages/About", () => ({
  default: () => <div data-testid="about"><Outlet /></div>,
}));
vi.mock("../pages/ToS", () => ({
  default: (props) => <Page name="ToS" {...props} />,
}));
vi.mock("../pages/PrivacyPolicy", () => ({
  default: (props) => <Page name="PrivacyPolicy" {...props} />,
}));
vi.mock("../pages/Model", () => ({
  default: (props) => <Page name="Model" {...props} />,
}));
vi.mock("../pages/Collections", () => ({
  default: (props) => <Page name="Collections" {...props} />,
}));
vi.mock("../pages/SearchPage", () => ({
  default: (props) => <Page name="SearchPage" {...props} />,
}));
vi.mock("../pages/Profile", () => ({
  default: (props) => <Page name="Profile" {...props} />,
}));
vi.mock("../pages/Collection", () => ({
  default: (props) => <Page name="Collection" {...props} />,
}));
vi.mock("../pages/CollectionEdit", () => ({
  default: (props) => <Page name="CollectionEdit" {...props} />,
}));
vi.mock("../pages/Edit", () => ({
  default: (props) => <Page name="Edit" {...props} />,
}));
vi.mock("../pages/Landing", () => ({
  default: (props) => <Page name="Landing" {...props} />,
}));
vi.mock("../pages/Models", () => ({
  default: (props) => <Page name="Models" {...props} />,
}));
vi.mock("../pages/Author", () => ({
  default: (props) => <Page name="Author" {...props} />,
}));
vi.mock("../pages/about/AboutMain", () => ({
  default: (props) => <Page name="AboutMain" {...props} />,
}));
vi.mock("../pages/about/AboutStartAddingModels", () => ({
  default: (props) => <Page name="AboutStartAddingModels" {...props} />,
}));
vi.mock("../pages/about/AboutCategoryEdit", () => ({
  default: (props) => <Page name="AboutCategoryEdit" {...props} />,
}));
vi.mock("../pages/about/AboutWorkingWithPrompts", () => ({
  default: (props) => <Page name="AboutWorkingWithPrompts" {...props} />,
}));
vi.mock("../pages/about/AboutModelPage", () => ({
  default: (props) => <Page name="AboutModelPage" {...props} />,
}));
vi.mock("../pages/about/AboutModelSettings", () => ({
  default: (props) => <Page name="AboutModelSettings" {...props} />,
}));
vi.mock("../pages/about/AboutImageCollections", () => ({
  default: (props) => <Page name="AboutImageCollections" {...props} />,
}));
vi.mock("../pages/about/AboutTopPanel", () => ({
  default: (props) => <Page name="AboutTopPanel" {...props} />,
}));
vi.mock("../pages/about/AboutSidebar", () => ({
  default: (props) => <Page name="AboutSidebar" {...props} />,
}));

const Page = ({ name, title }) => {
  const params = useParams();
  if (checks.failingPage === name) throw new Error("Page failed");
  return (
    <section data-testid="page" data-page={name}>
      <h1>{title}</h1>
      <output data-testid="params">{JSON.stringify(params)}</output>
      <input aria-label="Page note" />
    </section>
  );
};

const browserRouter = vi.mocked(createBrowserRouter).mock.results[0].value;
const makeStore = () => configureStore({
  reducer: {
    auth: (state = { isLoggedIn: false, initialAuth: false }, action) =>
      action.type === "test/auth" ? { ...state, ...action.payload } : state,
  },
});
const mountApp = () => {
  const store = makeStore();
  const view = render(<Provider store={store}><App /></Provider>);
  const setAuth = (payload) => act(() => { store.dispatch({ type: "test/auth", payload }); });
  return { ...view, store, setAuth };
};
const expectPage = async (name) => {
  await waitFor(() => expect(screen.getByTestId("page").getAttribute("data-page")).toBe(name));
};

beforeEach(async () => {
  checks.failingPage = null;
  checks.layoutMounted.mockClear();
  vi.mocked(initAuth).mockClear();
  await browserRouter.navigate("/", { replace: true });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("application router", () => {
  it("switches the home content as auth resolves without replacing the router or layout", async () => {
    const { setAuth, rerender, store } = mountApp();
    expect(screen.getByTestId("layout")).toBeTruthy();
    expect(screen.queryByTestId("page")).toBeNull();
    fireEvent.change(screen.getByLabelText("Layout note"), { target: { value: "keep me" } });

    setAuth({ initialAuth: true });
    await expectPage("Landing");
    expect(screen.getByRole("heading").textContent).toBe("AIDE-TOOLS");

    // Login can arrive before the initial-auth-complete action.
    setAuth({ isLoggedIn: true, initialAuth: false });
    await expectPage("Models");
    expect(screen.getByRole("heading").textContent).toBe("Models");
    setAuth({ initialAuth: true });
    setAuth({ isLoggedIn: false });
    await expectPage("Landing");
    rerender(<Provider store={store}><App /></Provider>);

    expect(screen.getByLabelText("Layout note").value).toBe("keep me");
    expect(checks.layoutMounted).toHaveBeenCalledTimes(1);
    expect(createBrowserRouter).toHaveBeenCalledTimes(1);
    expect(initAuth).toHaveBeenCalledTimes(1);
  });

  it("preserves a deep URL, its query/hash, and page state during auth changes", async () => {
    await browserRouter.navigate("/models/42/edit?version=7#settings");
    const { setAuth } = mountApp();
    await expectPage("Edit");
    fireEvent.change(screen.getByLabelText("Page note"), { target: { value: "draft" } });
    setAuth({ initialAuth: true, isLoggedIn: true });
    setAuth({ isLoggedIn: false });
    expect(screen.getByLabelText("Page note").value).toBe("draft");
    expect(browserRouter.state.location).toMatchObject({
      pathname: "/models/42/edit", search: "?version=7", hash: "#settings",
    });
  });

  it("supports browser back and forward navigation", async () => {
    mountApp();
    await act(async () => { await browserRouter.navigate("/search?searchQuery=cat"); });
    await expectPage("SearchPage");
    await act(async () => { await browserRouter.navigate("/profile"); });
    await expectPage("Profile");
    await act(async () => { await browserRouter.navigate(-1); });
    await expectPage("SearchPage");
    expect(browserRouter.state.location.search).toBe("?searchQuery=cat");
    await act(async () => { await browserRouter.navigate(1); });
    await expectPage("Profile");
  });

  it.each([
    ["/models/42", "Model", "Model", { modelId: "42" }, "model-data"],
    ["/models/42/edit", "Edit", "Edit", { modelId: "42" }, "model-data"],
    ["/images", "Collections", "Collections", {}, null],
    ["/images/abc", "Collection", "Collection", { collectionId: "abc" }, "collection-data"],
    ["/images/abc/edit", "CollectionEdit", "Collection", { collectionId: "abc" }, "collection-data"],
    ["/search", "SearchPage", "Search", {}, null],
    ["/profile", "Profile", "Profile", {}, null],
    ["/author/alice", "Author", "Author", { authorName: "alice" }, "author-data"],
    ["/about", "AboutMain", "About", {}, null],
    ["/about/start-adding-models", "AboutStartAddingModels", "Start: Adding Models", {}, null],
    ["/about/category-edit", "AboutCategoryEdit", "Category edit", {}, null],
    ["/about/working-with-prompts", "AboutWorkingWithPrompts", "Working with Prompts", {}, null],
    ["/about/model-page", "AboutModelPage", "Model Page", {}, null],
    ["/about/model-settings", "AboutModelSettings", "Model Settings", {}, null],
    ["/about/image-collections", "AboutImageCollections", "Image collections", {}, null],
    ["/about/top-panel", "AboutTopPanel", "Top Panel", {}, null],
    ["/about/sidebar", "AboutSidebar", "Sidebar", {}, null],
    ["/tos", "ToS", "Terms of Service", {}, null],
    ["/privacy", "PrivacyPolicy", "Privacy Policy", {}, null],
  ])("opens %s directly with the existing title, params, and route ID", async (url, page, title, params, id) => {
    const router = createMemoryRouter(browserRouter.routes, { initialEntries: [url] });
    try {
      render(<Provider store={makeStore()}><RouterProvider router={router} /></Provider>);
      await expectPage(page);
      expect(screen.getByRole("heading").textContent).toBe(title);
      expect(JSON.parse(screen.getByTestId("params").textContent)).toEqual(params);
      if (id) expect(router.state.matches.some(match => match.route.id === id)).toBe(true);
      if (url.startsWith("/about")) expect(screen.getByTestId("about")).toBeTruthy();
    } finally {
      cleanup();
      router.dispose();
    }
  });

  it("keeps nested page errors inside their existing layout and recovers on navigation", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    checks.failingPage = "AboutSidebar";
    await browserRouter.navigate("/about/sidebar");
    mountApp();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Page failed"));
    expect(screen.getByTestId("layout")).toBeTruthy();
    expect(screen.getByTestId("about")).toBeTruthy();
    checks.failingPage = null;
    await act(async () => { await browserRouter.navigate("/about"); });
    await expectPage("AboutMain");
    consoleError.mockRestore();
  });

  it("uses the root error boundary for unmatched URLs", async () => {
    await browserRouter.navigate("/does-not-exist");
    mountApp();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("404"));
    expect(screen.queryByTestId("layout")).toBeNull();
  });
});
