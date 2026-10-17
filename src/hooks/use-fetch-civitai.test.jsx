// @vitest-environment jsdom
import { useEffect } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useFetchCivitai from "./use-fetch-civitai";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../variables/constants";

const fetchMock = vi.fn();
const url = "https://civitai.com/api/v1/images?limit=10";
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const page = (items, metadata = {}) => ({ ok: true, status: 200, json: async () => ({ items, metadata }) });
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};

it.each([false, true])("retains cursor pagination, deduplication, and prepend=%s", async (prepend) => {
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [{ id: 1 }, { id: 2 }], metadata: { nextCursor: "next/value" } }) })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [{ id: 3 }, { id: 3 }] }) });
  const setIntersecting = vi.fn();
  const { result } = renderHook(() => useFetchCivitai(url, prepend));
  await act(async () => result.current.fetchCivitai(setIntersecting));
  expect(result.current.isLastPage).toBe(false);
  await act(async () => result.current.fetchCivitai(setIntersecting));
  expect(fetchMock.mock.calls[1][0]).toBe(url + "&cursor=next/value");
  expect(result.current.fetchedData.map(({ id }) => id)).toEqual(prepend ? [3, 1, 2] : [1, 2, 3]);
  expect(result.current).toMatchObject({ isFetching: false, isLastPage: true, errorMessage: "" });
  expect(setIntersecting).toHaveBeenLastCalledWith(false);
  await act(async () => result.current.fetchCivitai());
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("aborts the pending request on URL change and resets pagination", async () => {
  fetchMock.mockImplementationOnce((_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject("AbortError"));
  })).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [] }) });
  const { result, rerender, unmount } = renderHook(({ url }) => useFetchCivitai(url), { initialProps: { url } });
  let pending;
  act(() => { pending = result.current.fetchCivitai(); });
  const firstSignal = fetchMock.mock.calls[0][1].signal;
  expect(result.current.isFetching).toBe(true);
  await act(async () => { rerender({ url: url + "&modelId=2" }); });
  await act(async () => pending);
  expect(firstSignal.aborted).toBe(true);
  expect(result.current.fetchedData).toEqual([]);
  await act(async () => result.current.fetchCivitai());
  expect(fetchMock.mock.calls[1][0]).toBe(url + "&modelId=2");
  unmount();
});

it("keeps the existing error message and stops further requests after missing items", async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
  const { result } = renderHook(() => useFetchCivitai(url));
  await act(async () => result.current.fetchCivitai());
  expect(result.current).toMatchObject({ isFetching: false, errorMessage: ERROR_MESSAGE_CIV_CONNECTION, fetchedData: [] });
  await act(async () => result.current.fetchCivitai());
  expect(fetchMock).toHaveBeenCalledOnce();
});

it.each(["request", "body", "legacy string"])("treats %s cancellation as quiet and releases loading for another request", async (stage) => {
  const original = stage === "legacy string" ? "AbortError" : new DOMException("Cancelled", "AbortError");
  if (stage === "body") {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw original; } });
  } else {
    fetchMock.mockRejectedValueOnce(original);
  }
  fetchMock.mockResolvedValueOnce(page([{ id: 2 }]));
  const { result } = renderHook(() => useFetchCivitai(url));

  await act(async () => result.current.fetchCivitai());

  expect(result.current).toMatchObject({ isFetching: false, errorMessage: "", fetchedData: [], isLastPage: false });
  expect(console.error).not.toHaveBeenCalled();

  await act(async () => result.current.fetchCivitai());

  expect(result.current.fetchedData).toEqual([{ id: 2 }]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("clears the previous URL's error and allows a fresh feed to load", async () => {
  fetchMock.mockResolvedValueOnce(page(undefined)).mockResolvedValueOnce(page([{ id: 2 }]));
  const { result, rerender } = renderHook(({ url }) => useFetchCivitai(url), { initialProps: { url } });
  await act(async () => result.current.fetchCivitai());
  expect(result.current.errorMessage).toBe(ERROR_MESSAGE_CIV_CONNECTION);

  rerender({ url: url + "&modelId=2" });

  expect(result.current).toMatchObject({ errorMessage: "", isFetching: false, isLastPage: false, fetchedData: [] });
  await act(async () => result.current.fetchCivitai());
  expect(fetchMock.mock.calls[1][0]).toBe(url + "&modelId=2");
  expect(result.current.fetchedData).toEqual([{ id: 2 }]);
});

it.each([
  { outcome: "success", order: "before" },
  { outcome: "failure", order: "before" },
  { outcome: "success", order: "after" },
  { outcome: "failure", order: "after" },
])("ignores old-URL $outcome $order the new request settles", async ({ outcome, order }) => {
  const oldResponse = deferred();
  const newResponse = deferred();
  fetchMock.mockReturnValueOnce(oldResponse.promise).mockReturnValueOnce(newResponse.promise);
  const { result, rerender } = renderHook(({ url }) => useFetchCivitai(url), { initialProps: { url } });
  const oldIntersecting = vi.fn();
  const newIntersecting = vi.fn();
  let oldRequest;
  let newRequest;
  act(() => { oldRequest = result.current.fetchCivitai(oldIntersecting); });
  const oldSignal = fetchMock.mock.calls[0][1].signal;
  const nextUrl = url + "&modelId=2";
  rerender({ url: nextUrl });
  expect(oldSignal.aborted).toBe(true);
  expect(result.current.isFetching).toBe(false);
  act(() => { newRequest = result.current.fetchCivitai(newIntersecting); });

  const settleOld = () => act(async () => {
    // The transport deliberately ignores abort to exercise the request guard.
    if (outcome === "success") oldResponse.resolve(page([{ id: 1 }], { nextCursor: "stale" }));
    else oldResponse.reject(new Error("Old request failed"));
    await oldRequest;
  });
  const settleNew = () => act(async () => {
    newResponse.resolve(page([{ id: 2 }], { nextCursor: "fresh" }));
    await newRequest;
  });

  if (order === "before") {
    await settleOld();
    expect(result.current).toMatchObject({ isFetching: true, fetchedData: [], errorMessage: "", isLastPage: false });
    await settleNew();
  } else {
    await settleNew();
    await settleOld();
  }

  expect(result.current).toMatchObject({ isFetching: false, fetchedData: [{ id: 2 }], errorMessage: "", isLastPage: false });
  expect(oldIntersecting).not.toHaveBeenCalled();
  expect(newIntersecting).toHaveBeenCalledExactlyOnceWith(false);
  expect(console.error).not.toHaveBeenCalled();

  fetchMock.mockResolvedValueOnce(page([{ id: 3 }]));
  await act(async () => result.current.fetchCivitai());
  expect(fetchMock.mock.calls[2][0]).toBe(nextUrl + "&cursor=fresh");
  expect(result.current.fetchedData).toEqual([{ id: 2 }, { id: 3 }]);
});

it.each(["success", "failure"])("aborts on unmount and ignores a later %s", async (outcome) => {
  const response = deferred();
  fetchMock.mockReturnValue(response.promise);
  const setIntersecting = vi.fn();
  const { result, unmount } = renderHook(() => useFetchCivitai(url));
  let pending;
  act(() => { pending = result.current.fetchCivitai(setIntersecting); });
  const signal = fetchMock.mock.calls[0][1].signal;

  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    if (outcome === "success") response.resolve(page([{ id: 1 }]));
    else response.reject(new Error("Request failed after unmount"));
    await pending;
  });

  expect(setIntersecting).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("keeps the latest feed when a previous URL is selected again", async () => {
  const oldResponse = deferred();
  fetchMock.mockReturnValueOnce(oldResponse.promise).mockResolvedValueOnce(page([{ id: 2 }]));
  const { result, rerender } = renderHook(({ url }) => useFetchCivitai(url), { initialProps: { url } });
  let oldRequest;
  act(() => { oldRequest = result.current.fetchCivitai(); });
  rerender({ url: url + "&modelId=2" });
  rerender({ url });
  await act(async () => result.current.fetchCivitai());

  await act(async () => {
    oldResponse.resolve(page([{ id: 1 }], { nextCursor: "stale" }));
    await oldRequest;
  });

  expect(result.current).toMatchObject({ fetchedData: [{ id: 2 }], isLastPage: true, errorMessage: "" });
});

it("allows only one request at a time, including calls before React rerenders", async () => {
  const response = deferred();
  fetchMock.mockReturnValue(response.promise);
  const { result } = renderHook(() => useFetchCivitai(url));
  let firstRequest;
  let secondRequest;
  act(() => {
    firstRequest = result.current.fetchCivitai();
    secondRequest = result.current.fetchCivitai();
  });

  expect(fetchMock).toHaveBeenCalledOnce();
  expect(result.current.isFetching).toBe(true);
  await act(async () => {
    response.resolve(page([{ id: 1 }]));
    await Promise.all([firstRequest, secondRequest]);
  });
  expect(result.current).toMatchObject({ fetchedData: [{ id: 1 }], isFetching: false });
});

it("stops pagination when the first page has no next cursor", async () => {
  fetchMock.mockResolvedValue(page([]));
  const { result } = renderHook(() => useFetchCivitai(url));
  await act(async () => result.current.fetchCivitai());
  await act(async () => result.current.fetchCivitai());

  expect(result.current.isLastPage).toBe(true);
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("retains the guard against Civitai repeating the same cursor", async () => {
  fetchMock.mockResolvedValueOnce(page([{ id: 1 }], { nextCursor: "repeated" }))
    .mockResolvedValueOnce(page([{ id: 2 }], { nextCursor: "repeated" }));
  const { result } = renderHook(() => useFetchCivitai(url));
  await act(async () => result.current.fetchCivitai());
  await act(async () => result.current.fetchCivitai());
  await act(async () => result.current.fetchCivitai());

  expect(result.current.fetchedData).toEqual([{ id: 1 }, { id: 2 }]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("starts a new URL without the old cursor when a consumer effect fetches immediately", async () => {
  fetchMock.mockResolvedValueOnce(page([{ id: 1 }], { nextCursor: "old-cursor" }))
    .mockResolvedValueOnce(page([{ id: 2 }]));
  const { result, rerender } = renderHook(({ url }) => {
    const feed = useFetchCivitai(url);
    useEffect(() => { void feed.fetchCivitai(); }, [feed.fetchCivitai]);
    return feed;
  }, { initialProps: { url } });
  await act(async () => {});
  expect(result.current.fetchedData).toEqual([{ id: 1 }]);

  await act(async () => { rerender({ url: url + "&modelId=2" }); });

  expect(fetchMock.mock.calls[1][0]).toBe(url + "&modelId=2");
  expect(result.current.fetchedData).toEqual([{ id: 2 }]);
});
