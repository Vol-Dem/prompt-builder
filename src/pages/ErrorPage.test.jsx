// @vitest-environment jsdom
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import ErrorPage from "./ErrorPage";
import AppErrorBoundary from "../components/ui/AppErrorBoundary";
import { reportError } from "../utils/generalUtils";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";

const { state, dispatch } = vi.hoisted(() => ({ state: {}, dispatch: vi.fn() }));
vi.mock("../store/hooks/hooks", () => ({
  useAppSelector: (selector) => selector(state), useAppDispatch: () => dispatch,
}));
vi.mock("../store/auth", () => ({ authActions: {
  openAuthForm: () => ({ type: "auth/openAuthForm" }),
  closeAuthForm: () => ({ type: "auth/closeAuthForm" }),
} }));
vi.mock("../components/forms/Auth/AuthForm", () => ({ default: () => <p>Authentication form</p> }));
vi.mock("../components/ui/Modal", () => ({ default: ({ children, onClose }) => (
  <div role="dialog">{children}<button onClick={onClose}>Close</button></div>
) }));
vi.mock("../utils/generalUtils", async (importOriginal) => ({
  ...await importOriginal(), reportError: vi.fn(),
}));

let router;
const Broken = ({ error }) => { throw error; };
const mount = (root = {}, url = "/") => {
  router = createMemoryRouter([
    { path: "/", element: <p>Healthy page</p>, errorElement: <ErrorPage />, ...root },
  ], { initialEntries: [url] });
  render(<AppErrorBoundary><RouterProvider router={router} /></AppErrorBoundary>);
};
beforeEach(() => {
  vi.clearAllMocks();
  state.auth = { isLoggedIn: false, authFormIsOpen: false };
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); });

it("keeps the 404 home link and sign-in action for unauthenticated users", async () => {
  mount({}, "/missing");

  expect(await screen.findByRole("heading", { name: "404" })).toBeTruthy();
  expect(screen.getByText("Page not found")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
  expect(screen.queryByRole("button", { name: "Reload" })).toBeNull();
  expect(reportError).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
  expect(dispatch).toHaveBeenCalledWith({ type: "auth/openAuthForm" });
});

it("keeps authenticated 404s free of the sign-in action", async () => {
  state.auth.isLoggedIn = true;
  mount({}, "/missing");

  await screen.findByRole("heading", { name: "404" });
  expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull();
  expect(reportError).not.toHaveBeenCalled();
});

it("keeps the 404 authentication dialog and close action", async () => {
  state.auth.authFormIsOpen = true;
  mount({}, "/missing");

  expect(await screen.findByRole("dialog")).toBeTruthy();
  expect(screen.getByText("Authentication form")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(dispatch).toHaveBeenCalledWith({ type: "auth/closeAuthForm" });
});

it.each([403, 500])("shows safe recovery controls for an HTTP %s error", async (status) => {
  mount({ loader: () => { throw new Response("Private response details", { status }); } });

  expect(await screen.findByRole("heading", { name: String(status) })).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain(ERROR_MESSAGE_DEFAULT);
  expect(screen.queryByText("Private response details")).toBeNull();
  expect(screen.queryByText("Page not found")).toBeNull();
  expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull();
  expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
  expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ original: expect.objectContaining({ status }) }));
});

it("reports a render error while displaying the shared fallback without private details", async () => {
  const error = new Error("Private page render failure");
  mount({ element: <Broken error={error} /> });

  expect((await screen.findByRole("alert")).textContent).toContain(ERROR_MESSAGE_DEFAULT);
  expect(screen.queryByText(error.message)).toBeNull();
  expect(screen.queryByText("404")).toBeNull();
  expect(reportError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ original: error }));
});

it("contains nested failures in their layout and recovers through route navigation", async () => {
  const error = new Error("Private child failure");
  mount({
    element: <><nav aria-label="Page navigation">Navigation</nav><Outlet /></>,
    children: [
      { path: "broken", element: <Broken error={error} />, errorElement: <ErrorPage /> },
      { path: "healthy", element: <p>Healthy child page</p> },
    ],
  }, "/broken");

  expect((await screen.findByRole("alert")).textContent).toContain(ERROR_MESSAGE_DEFAULT);
  const navigation = screen.getByRole("navigation", { name: "Page navigation" });
  await act(async () => { await router.navigate("/healthy"); });

  expect(screen.getByText("Healthy child page")).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "Page navigation" })).toBe(navigation);
  expect(screen.queryByRole("alert")).toBeNull();
});
