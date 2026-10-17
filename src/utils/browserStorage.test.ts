// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  removeFromLocalStorage,
  removeFromStorage,
  saveToLocalStorage,
  saveToStorage,
  uploadLocalStorage,
  uploadStorage,
} from "./generalUtils";

const stores = [
  { name: "sessionStorage", save: saveToStorage, read: uploadStorage, remove: removeFromStorage },
  { name: "localStorage", save: saveToLocalStorage, read: uploadLocalStorage, remove: removeFromLocalStorage },
] as const;

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe.each(stores)("$name helpers", ({ name, save, read, remove }) => {
  it.each(["", "portrait", 0, false, null, [], { messages: [{ id: 1, read: true }] }])(
    "preserves valid JSON data: %j",
    (data) => {
      save("saved-key", data);

      expect(window[name].getItem("saved-key")).toBe(JSON.stringify(data));
      expect(read("saved-key")).toEqual(data);
      expect(console.error).not.toHaveBeenCalled();
    },
  );

  it("returns null for missing entries and removes only the specified key", () => {
    expect(read("missing")).toBeNull();
    save("saved-key", "value");
    save("other-key", "keep");

    remove("saved-key");

    expect(read("saved-key")).toBeNull();
    expect(read("other-key")).toBe("keep");
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each(["{broken JSON", "undefined", "["])("ignores malformed JSON without deleting it: %s", (data) => {
    window[name].setItem("saved-key", data);

    expect(read("saved-key")).toBeNull();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(expect.any(SyntaxError));
    expect(window[name].getItem("saved-key")).toBe(data);
  });

  it("returns the missing-data fallback when getItem fails", () => {
    const error = new DOMException("Storage blocked", "SecurityError");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw error; });

    expect(read("saved-key")).toBeNull();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("preserves existing entries when quota prevents a write and recovers on the next attempt", () => {
    save("saved-key", "original");
    const error = new DOMException("Storage full", "QuotaExceededError");
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw error; });

    expect(save("saved-key", "failed write")).toBeUndefined();
    expect(read("saved-key")).toBe("original");
    expect(console.error).toHaveBeenCalledExactlyOnceWith(error);

    save("saved-key", "next write");

    expect(read("saved-key")).toBe("next write");
    expect(setItem).toHaveBeenCalledTimes(2);
  });

  it("continues when removal fails and retains the original error", () => {
    save("saved-key", "original");
    const error = new DOMException("Storage blocked", "SecurityError");
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw error; });

    expect(remove("saved-key")).toBeUndefined();
    expect(read("saved-key")).toBe("original");
    expect(console.error).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("guards access to the storage getter itself", () => {
    const error = new DOMException("Storage disabled", "SecurityError");
    vi.spyOn(window, name, "get").mockImplementation(() => { throw error; });

    expect(read("saved-key")).toBeNull();
    expect(save("saved-key", "value")).toBeUndefined();
    expect(remove("saved-key")).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(vi.mocked(console.error).mock.calls.every(([original]) => original === error)).toBe(true);
  });

  it("handles circular data without overwriting the existing entry", () => {
    save("saved-key", "original");
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(save("saved-key", circular)).toBeUndefined();
    expect(read("saved-key")).toBe("original");
    expect(console.error).toHaveBeenCalledExactlyOnceWith(expect.any(TypeError));
  });

  it("retains failures thrown during serialization", () => {
    const error = new Error("Serialization failed");

    expect(save("saved-key", { toJSON() { throw error; } })).toBeUndefined();
    expect(read("saved-key")).toBeNull();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("does not replace an existing entry with data that cannot be serialized", () => {
    save("saved-key", "original");

    save("saved-key", undefined);

    expect(read("saved-key")).toBe("original");
    expect(console.error).not.toHaveBeenCalled();
  });
});
