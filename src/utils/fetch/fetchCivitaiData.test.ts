import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../../variables/constants";
import { AppError, handleErrors, normalizeError } from "../generalUtils";
import { fetchCivitaiData } from "./fetchCivitaiData";

const fetchMock = vi.fn();
const url = "https://civitai.com/api/v1/models/42";

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it("preserves the decoded object and passes request options unchanged", async () => {
  const data = { id: 42, description: "Existing metadata", extra: true };
  const config = { signal: new AbortController().signal, headers: { Accept: "application/json" } };
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => data });

  expect(await fetchCivitaiData(url, config)).toBe(data);
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(url, config);
});

describe("HTTP failures", () => {
  it.each([
    { status: 403, body: "<!DOCTYPE html><html>Blocked</html>" },
    { status: 404, body: JSON.stringify({ message: "Internal provider details" }) },
    { status: 500, body: JSON.stringify({ items: [] }) },
  ])("rejects HTTP $status before decoding the body", async ({ status, body }) => {
    const response = new Response(body, { status });
    const json = vi.spyOn(response, "json");
    fetchMock.mockResolvedValue(response);

    const error = await fetchCivitaiData(url).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      source: "civitai", url, status, code: "civitai/http",
      message: ERROR_MESSAGE_CIV_CONNECTION, original: response, cause: response,
    });
    expect(normalizeError(error)).toBe(error);
    expect(handleErrors(error as AppError)).toBe(ERROR_MESSAGE_CIV_CONNECTION);
    expect(json).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

it("retains the original JSON parsing failure with URL and status", async () => {
  const original = new SyntaxError("Unexpected token '<', <!DOCTYPE html>");
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => { throw original; } });

  await expect(fetchCivitaiData(url)).rejects.toMatchObject({
    message: ERROR_MESSAGE_CIV_CONNECTION, code: "civitai/json", source: "civitai",
    url, status: 200, original, cause: original,
  });
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("rejects an HTML success response with a safe message", async () => {
  fetchMock.mockResolvedValue(new Response("<!DOCTYPE html><html>Maintenance</html>"));

  await expect(fetchCivitaiData(url)).rejects.toMatchObject({
    message: ERROR_MESSAGE_CIV_CONNECTION, code: "civitai/json", status: 200,
    original: expect.any(SyntaxError),
  });
});

it("retains network errors without displaying their provider text or retrying", async () => {
  const original = new TypeError("Private network details");
  fetchMock.mockRejectedValue(original);

  await expect(fetchCivitaiData(url)).rejects.toMatchObject({
    message: ERROR_MESSAGE_CIV_CONNECTION, code: "civitai/network", source: "civitai",
    url, original, cause: original, status: undefined,
  });
  expect(fetchMock).toHaveBeenCalledOnce();
});

it.each([null, [], "Provider error", 1, false])("rejects a non-object JSON response: %j", async (data) => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => data });

  await expect(fetchCivitaiData(url)).rejects.toMatchObject({
    message: ERROR_MESSAGE_CIV_CONNECTION, code: "civitai/invalid-response",
    url, status: 200, original: data, cause: data,
  });
});

it.each(["request", "body"])("keeps native cancellation from the %s recognizable", async (stage) => {
  const original = new DOMException("Cancelled", "AbortError");
  if (stage === "request") fetchMock.mockRejectedValue(original);
  else fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => { throw original; } });

  await expect(fetchCivitaiData(url)).rejects.toBe(original);
});

it("preserves a caller-supplied abort reason", async () => {
  const controller = new AbortController();
  const reason = new Error("Navigation changed");
  fetchMock.mockImplementation(async () => {
    controller.abort(reason);
    throw reason;
  });

  await expect(fetchCivitaiData(url, { signal: controller.signal })).rejects.toBe(reason);
});
