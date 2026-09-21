// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { sendEmailVerification } from "firebase/auth";

import VerifyEmailMessage from "./VerifyEmailMessage";
import { ERROR_MESSAGE_AUTH, ERROR_MESSAGE_DEFAULT } from "../../../variables/constants";

const { auth } = vi.hoisted(() => ({ auth: { currentUser: null } }));
vi.mock("../../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", async (importOriginal) => ({
  ...await importOriginal(),
  getAuth: () => auth,
  sendEmailVerification: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  auth.currentUser = { uid: "user-1" };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("shows success only after verification is sent and clears it on the next request", async () => {
  let finish;
  sendEmailVerification.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  render(<VerifyEmailMessage />);
  fireEvent.click(screen.getByText("Resend request"));
  expect(sendEmailVerification).toHaveBeenCalledExactlyOnceWith(auth.currentUser);
  expect(screen.queryByText("Request sent, check your email")).toBeNull();
  finish();
  expect(await screen.findByText("Request sent, check your email")).toBeTruthy();

  fireEvent.click(screen.getByText("Resend request"));
  expect(screen.queryByText("Request sent, check your email")).toBeNull();
  expect(await screen.findByText("Request sent, check your email")).toBeTruthy();
});

it("shows the existing authentication error when there is no current user", async () => {
  auth.currentUser = null;
  render(<VerifyEmailMessage />);
  fireEvent.click(screen.getByText("Resend request"));
  expect(await screen.findByText(ERROR_MESSAGE_AUTH)).toBeTruthy();
  expect(sendEmailVerification).not.toHaveBeenCalled();
});

it("shows the existing provider failure message and allows retry", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const error = new Error("Verification failed");
  sendEmailVerification.mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
  render(<VerifyEmailMessage />);
  fireEvent.click(screen.getByText("Resend request"));
  expect(await screen.findByText(ERROR_MESSAGE_DEFAULT)).toBeTruthy();
  expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ original: error }));

  fireEvent.click(screen.getByText("Resend request"));
  expect(await screen.findByText("Request sent, check your email")).toBeTruthy();
  await waitFor(() => expect(screen.queryByTestId("error-message")).toBeNull());
});
