// @vitest-environment jsdom
import { lazy, Suspense, useLayoutEffect } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import AppErrorBoundary from "./AppErrorBoundary";
import { AppError, reportError } from "../../utils/generalUtils";
import { ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

vi.mock("../../utils/generalUtils", async (importOriginal) => ({
  ...await importOriginal(), reportError: vi.fn(),
}));

const Broken = ({ error }) => { throw error; };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("renders healthy children without replacing their local state", () => {
  const view = render(<AppErrorBoundary><input aria-label="Draft" defaultValue="" /></AppErrorBoundary>);
  fireEvent.change(screen.getByLabelText("Draft"), { target: { value: "Unsaved draft" } });
  view.rerender(<AppErrorBoundary><input aria-label="Draft" defaultValue="" /></AppErrorBoundary>);

  expect(screen.getByLabelText("Draft").value).toBe("Unsaved draft");
  expect(screen.queryByRole("alert")).toBeNull();
  expect(reportError).not.toHaveBeenCalled();
});

it.each([
  new Error("Private render failure"),
  new AppError("Private application details"),
  "Private non-Error failure",
])("shows safe recovery UI outside provider/router context for %s", (error) => {
  render(<AppErrorBoundary><Broken error={error} /></AppErrorBoundary>);

  expect(screen.getByRole("alert").textContent).toContain(ERROR_MESSAGE_DEFAULT);
  expect(screen.queryByText(typeof error === "string" ? error : error.message)).toBeNull();
  expect(screen.queryByText("404")).toBeNull();
  expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull();
  expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
  expect(reportError).toHaveBeenCalledOnce();
  expect(reportError.mock.calls[0][0]).toMatchObject({ original: error instanceof AppError ? undefined : error });
  if (error instanceof AppError) expect(reportError).toHaveBeenCalledWith(error);
});

it("contains lifecycle failures", () => {
  const error = new Error("Private lifecycle failure");
  const BrokenEffect = () => {
    useLayoutEffect(() => { throw error; }, []);
    return <p>Mounting</p>;
  };
  render(<AppErrorBoundary><BrokenEffect /></AppErrorBoundary>);

  expect(screen.getByRole("alert").textContent).toContain(ERROR_MESSAGE_DEFAULT);
  expect(screen.queryByText("Mounting")).toBeNull();
  expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ original: error }));
});

it("contains a rejected lazy import after Suspense finishes loading", async () => {
  let rejectImport;
  const page = new Promise((_, reject) => { rejectImport = reject; });
  const FailedPage = lazy(() => page);
  render(<AppErrorBoundary>
    <Suspense fallback={<p>Loading page</p>}><FailedPage /></Suspense>
  </AppErrorBoundary>);
  expect(screen.getByText("Loading page")).toBeTruthy();

  const error = new Error("Private chunk URL");
  await act(async () => { rejectImport(error); });
  expect((await screen.findByRole("alert")).textContent).toContain(ERROR_MESSAGE_DEFAULT);
  expect(screen.queryByText("Loading page")).toBeNull();
  expect(screen.queryByText(error.message)).toBeNull();
  expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ original: error }));
});

it("reloads the document when the user chooses Reload", () => {
  render(<AppErrorBoundary><Broken error={new Error("Render failed")} /></AppErrorBoundary>);
  const reload = vi.fn();
  vi.stubGlobal("location", { reload });

  fireEvent.click(screen.getByRole("button", { name: "Reload" }));
  expect(reload).toHaveBeenCalledOnce();
});
