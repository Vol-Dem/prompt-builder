// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import About from "../pages/About";
import AboutNavBtnContainer from "../components/about/layout/AboutNavBtnContainer";
import { ABOUT_NAV_DATA } from "../variables/constants";

vi.mock("../store/hooks/hooks", () => ({
  useAppSelector: (selector) => selector({ general: { activeAboutSectionId: "" } }),
}));

let router;
let header;
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(window, "scrollY", { configurable: true, value: 100 });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top: 500, bottom: 600, left: 0, right: 100, width: 100, height: 100, x: 0, y: 500,
  });
  header = document.createElement("header");
  header.id = "header";
  Object.defineProperty(header, "offsetHeight", { value: 80 });
  document.body.append(header);
});
afterEach(() => {
  cleanup();
  router?.dispose();
  header.remove();
  vi.restoreAllMocks();
});

const Page = ({ item }) => (
  <div data-testid="page">
    <h1 id={item.id}>{item.name}</h1>
    {item.subNav.map((section) => <h2 key={section.id} id={section.id}>{section.name}</h2>)}
    <AboutNavBtnContainer />
  </div>
);
const mount = (url = "/about/sidebar") => {
  router = createMemoryRouter([{
    path: "/about", element: <About title="About" />,
    children: ABOUT_NAV_DATA.map((item) => ({
      ...(item.url ? { path: item.url } : { index: true }),
      element: <Page item={item} />,
      handle: { pageTitle: item.name },
    })),
  }], { initialEntries: [url] });
  render(<RouterProvider router={router} />);
};
const navigate = (url) => act(async () => { await router.navigate(url); });
const targetScroll = { top: 510, behavior: "smooth" };

it("scrolls a direct hash destination once with the existing header offset", () => {
  mount("/about/sidebar#references");
  expect(document.getElementById("references")).toBeTruthy();
  expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(targetScroll);
});

it("scrolls destinations without a hash to the top through programmatic and history navigation", async () => {
  mount();
  expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(0, 0);
  for (const destination of ["/about/top-panel", -1, 1]) {
    vi.mocked(window.scrollTo).mockClear();
    await navigate(destination);
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(0, 0);
  }
});

it("keeps the page position when the sidebar is closed, dismissed, or swiped away", () => {
  mount();
  vi.mocked(window.scrollTo).mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));
  fireEvent.click(screen.getByRole("button", { name: "Close sidebar" }));
  fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));
  fireEvent.click(document.querySelector('[class*="overlay"]'));
  fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));
  const sidebar = document.querySelector("aside");
  fireEvent.touchStart(sidebar, { touches: [{ clientX: 100 }] });
  fireEvent.touchMove(sidebar, { touches: [{ clientX: 20 }] });
  fireEvent.touchEnd(sidebar);
  expect(screen.getByRole("button", { name: "Open sidebar" })).toBeTruthy();
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(router.state.location.pathname).toBe("/about/sidebar");
});

it("scrolls sidebar section links without an intermediate reset, including repeated links", async () => {
  mount();
  vi.mocked(window.scrollTo).mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));
  fireEvent.click(screen.getByRole("link", { name: "Search", exact: true }));
  await waitFor(() => expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(targetScroll));
  expect(router.state.location).toMatchObject({ pathname: "/about/top-panel", hash: "#search" });
  expect(screen.getByRole("button", { name: "Open sidebar" })).toBeTruthy();
  vi.mocked(window.scrollTo).mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));
  fireEvent.click(screen.getByRole("link", { name: "Search", exact: true }));
  await waitFor(() => expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(targetScroll));
});

it("lets previous and next links scroll to their destination without click-handler resets", async () => {
  mount();
  vi.mocked(window.scrollTo).mockClear();
  fireEvent.click(within(screen.getByTestId("page")).getByRole("link", { name: "Top Panel" }));
  await waitFor(() => expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(targetScroll));
  expect(router.state.location).toMatchObject({ pathname: "/about/top-panel", hash: "#top" });
  vi.mocked(window.scrollTo).mockClear();
  fireEvent.click(within(screen.getByTestId("page")).getByRole("link", { name: "Sidebar" }));
  await waitFor(() => expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith(targetScroll));
  expect(router.state.location).toMatchObject({ pathname: "/about/sidebar", hash: "#sidebar" });
});
