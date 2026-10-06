// @vitest-environment jsdom
import { StrictMode } from "react";
import {
  createMemoryRouter,
  RouterProvider,
  useSearchParams,
} from "react-router-dom";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import usePageTitle from "./use-page-title";
import { DEFAULT_PAGE_TITLE } from "../variables/constants";
import ToS from "../pages/ToS";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import SearchPage from "../pages/SearchPage";
import Author from "../pages/Author";

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));

vi.mock("../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector({ general: { nsfwMode: false } }),
}));
vi.mock("../store/model", () => ({
  modelActions: {
    setActiveCarouselData: (value) => ({
      type: "model/setActiveCarouselData", payload: value,
    }),
  },
}));
vi.mock("../components/model/generated-images/external-images/ExternalImages", () => ({
  default: ({ username }) => <div>Images by {username}</div>,
}));
vi.mock("../components/general-elements/preview-card/PreviewCard", () => ({ default: () => null }));
vi.mock("../components/search/search-filter/SearchFilter", () => ({ default: () => null }));
vi.mock("../components/layout/left-sidebar/LeftSidebar", () => ({ default: () => null }));
vi.mock("./use-search-results-controller", () => ({
  default: () => {
    const [params] = useSearchParams();
    const parameter = params.get("searchQuery") || "";
    return {
      source: "aitools",
      query: { parameter, value: parameter },
      results: [],
      status: { isOnline: true, isLoading: false, errorMessage: "" },
      pagination: { hasMore: false, isLastPage: true, endPageRef: null },
    };
  },
}));

beforeEach(() => {
  document.title = DEFAULT_PAGE_TITLE;
  dispatch.mockClear();
});
afterEach(() => cleanup());

it("updates the title through Strict Mode replay and restores the default on unmount", () => {
  const { rerender, unmount } = renderHook(({ title }) => usePageTitle(title), {
    initialProps: { title: "Collection" },
    wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
  });
  expect(document.title).toBe("Collection");
  rerender({ title: "Edit - Portraits" });
  expect(document.title).toBe("Edit - Portraits");
  unmount();
  expect(document.title).toBe(DEFAULT_PAGE_TITLE);
});

const mountRoutes = (routes, url) => {
  const router = createMemoryRouter([
    ...routes,
    { path: "/untitled", element: <div>Untitled destination</div> },
  ], { initialEntries: [url] });
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
};
const navigate = (router, url) => act(async () => { await router.navigate(url); });

it("keeps the destination title when navigating between legal pages", async () => {
  const { router, unmount } = mountRoutes([
    { path: "/tos", element: <ToS title="Terms of Service" /> },
    { path: "/privacy", element: <PrivacyPolicy title="Privacy Policy" /> },
  ], "/tos");
  try {
    expect(document.title).toBe("Terms of Service");
    await navigate(router, "/privacy");
    expect(document.title).toBe("Privacy Policy");
    await navigate(router, "/tos");
    expect(document.title).toBe("Terms of Service");
    await navigate(router, "/untitled");
    expect(document.title).toBe(DEFAULT_PAGE_TITLE);
  } finally {
    unmount();
    router.dispose();
  }
});

it("tracks Search query changes and clears its title when navigating to an untitled page", async () => {
  const { router, unmount } = mountRoutes([
    { path: "/search", element: <SearchPage title="Search" /> },
  ], "/search?searchQuery=portrait");
  try {
    expect(document.title).toBe("Search - portrait");
    await navigate(router, "/search?searchQuery=landscape");
    expect(document.title).toBe("Search - landscape");
    await navigate(router, "/search");
    expect(document.title).toBe("Search");
    await navigate(router, "/untitled");
    expect(document.title).toBe(DEFAULT_PAGE_TITLE);
  } finally {
    unmount();
    router.dispose();
  }
});

it("updates reused Author routes without resetting the carousel until unmount", async () => {
  const { router, unmount } = mountRoutes([
    { path: "/author/:authorName", element: <Author /> },
  ], "/author/Alice");
  try {
    expect(document.title).toBe("Alice");
    expect(dispatch).not.toHaveBeenCalled();
    await navigate(router, "/author/Bob");
    expect(document.title).toBe("Bob");
    expect(screen.getByRole("heading").textContent).toBe("Bob");
    expect(screen.getByText("Images by Bob")).toBeTruthy();
    expect(dispatch).not.toHaveBeenCalled();
    await navigate(router, "/untitled");
    expect(document.title).toBe(DEFAULT_PAGE_TITLE);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({
      type: "model/setActiveCarouselData", payload: null,
    });
  } finally {
    unmount();
    router.dispose();
  }
});
