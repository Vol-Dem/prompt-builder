import { FirebaseError } from "firebase/app";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, handleErrors, normalizeError } from "./generalUtils";
import { ERROR_MESSAGE_CIV_CONNECTION, ERROR_MESSAGE_DEFAULT } from "../variables/constants";

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe("error normalization and display", () => {
  it("retains a Firebase error's code and original cause without trusting its display text", () => {
    const original = new FirebaseError("auth/unknown", "Internal provider details");
    const error = normalizeError(original);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("auth/unknown");
    expect(error.message).toBe("Internal provider details");
    expect(error.original).toBe(original);
    expect(error.cause).toBe(original);
    expect(error.isCustom).toBe(false);
    expect(handleErrors(error)).toBe(ERROR_MESSAGE_DEFAULT);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  });

  it("preserves explicit application errors and their messages without logging them", () => {
    const error = new AppError("Invalid input data", "input/invalid");

    expect(normalizeError(error)).toBe(error);
    expect(error.isCustom).toBe(true);
    expect(handleErrors(error)).toBe("Invalid input data");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("logs the original JavaScript error with its own stack instead of only the wrapper", () => {
    const original = new SyntaxError("Unexpected token '<'");
    const error = normalizeError(original);

    expect(error.original).toBe(original);
    expect(error.cause).toBe(original);
    expect(handleErrors(error)).toBe(ERROR_MESSAGE_DEFAULT);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  });

  it.each([undefined, null, "Provider failure", 42, {
    code: "auth/invalid-email", message: "Internal details", isCustom: true,
  }])("retains an unknown thrown value for diagnostics without exposing it: %j", (original) => {
    const error = normalizeError(original);

    expect(error.original).toBe(original);
    expect(error.cause).toBe(original);
    expect(error.isCustom).toBe(false);
    expect(handleErrors(error)).toBe(ERROR_MESSAGE_DEFAULT);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original ?? error);
  });

  it("logs the wrapper when no original failure was supplied", () => {
    const error = new AppError("Internal details", "unknown", undefined, false);

    expect(normalizeError(error)).toBe(error);
    expect(handleErrors(error)).toBe(ERROR_MESSAGE_DEFAULT);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("preserves the existing Civitai prisma fallback", () => {
    const original = new Error("prisma request failed");

    expect(handleErrors(normalizeError(original))).toBe(ERROR_MESSAGE_CIV_CONNECTION);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  });
});
