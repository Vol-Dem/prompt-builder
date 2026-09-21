// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useFetchCivitai from "./use-fetch-civitai";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../variables/constants";

const fetchMock = vi.fn();
const url = "https://civitai.com/api/v1/images?limit=10";
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it.each([false, true])("retains cursor pagination, deduplication, and prepend=%s", async (prepend) => {
  fetchMock.mockResolvedValueOnce({ json: async () => ({ items: [{ id: 1 }, { id: 2 }], metadata: { nextCursor: "next/value" } }) })
    .mockResolvedValueOnce({ json: async () => ({ items: [{ id: 3 }, { id: 3 }] }) });
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
  })).mockResolvedValueOnce({ json: async () => ({ items: [] }) });
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
  const secondSignal = fetchMock.mock.calls[1][1].signal;
  unmount();
  expect(secondSignal.aborted).toBe(true);
});

it("keeps the existing error message and stops further requests after missing items", async () => {
  fetchMock.mockResolvedValue({ json: async () => ({}) });
  const { result } = renderHook(() => useFetchCivitai(url));
  await act(async () => result.current.fetchCivitai());
  expect(result.current).toMatchObject({ isFetching: false, errorMessage: ERROR_MESSAGE_CIV_CONNECTION, fetchedData: [] });
  await act(async () => result.current.fetchCivitai());
  expect(fetchMock).toHaveBeenCalledOnce();
});
