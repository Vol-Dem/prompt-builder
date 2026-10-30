// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";

import { ERROR_MESSAGE_DEFAULT } from "./variables/constants";

const checks = vi.hoisted(() => ({
  renderRoot: vi.fn(), appError: null, providerError: null,
}));
vi.mock("react-dom/client", async (importOriginal) => ({
  ...await importOriginal(), default: { createRoot: () => ({ render: checks.renderRoot }) },
}));
vi.mock("./store/store", () => ({ default: {} }));
vi.mock("react-redux", () => ({
  Provider: ({ children }) => {
    if (checks.providerError) throw checks.providerError;
    return children;
  },
}));
vi.mock("./App", () => ({
  default: () => {
    if (checks.appError) throw checks.appError;
    return <p>Application rendered</p>;
  },
}));

beforeAll(async () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  await import("./main");
});
beforeEach(() => {
  checks.appError = null;
  checks.providerError = null;
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
afterAll(() => document.getElementById("root")?.remove());

it("mounts the application through the entry point", () => {
  expect(checks.renderRoot).toHaveBeenCalledOnce();
  render(checks.renderRoot.mock.calls[0][0]);

  expect(screen.getByText("Application rendered")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

it.each(["appError", "providerError"])("contains an entry-point %s outside the provider", (source) => {
  checks[source] = new Error("Private startup failure");
  render(checks.renderRoot.mock.calls[0][0]);

  expect(screen.getByRole("alert").textContent).toContain(ERROR_MESSAGE_DEFAULT);
  expect(screen.queryByText("Application rendered")).toBeNull();
  expect(screen.queryByText(checks[source].message)).toBeNull();
});
