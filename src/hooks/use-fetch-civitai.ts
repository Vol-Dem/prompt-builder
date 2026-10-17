import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  filterDuplicates,
  handleErrors,
  normalizeError,
} from "../utils/generalUtils";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  FILTER_CIV_DUPLICATES,
} from "../variables/constants";
import { fetchCivitaiImagePage } from "../utils/fetch/fetchCivitaiImages";

interface useFetchCivitaiReturn {
  fetchCivitai: (
    setIsIntersecting?: ((isIntersecting: boolean) => void) | undefined,
  ) => Promise<void>;
  fetchedData: any[];
  isFetching: boolean;
  isLastPage: boolean;
  errorMessage: string;
  setFetchedData: Dispatch<SetStateAction<any[]>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
}

/**
 * Fetches data from a given Civitai URL and manages the Civitai cursor-based pagination system
 * @param url - The URL to fetch
 * @returns The state object containing the fetch function, fetched data, fetching state, last page state, error message,
 * and functions to update fetched data and the error message
 */
const useFetchCivitai = (
  url: string,
  addToStart = false,
): useFetchCivitaiReturn => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const feedRef = useRef<{
    url: string;
    currCursor: string | null;
    nextCursor: string | null;
    isLastPage: boolean;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Reset cursors synchronously before a consumer effect starts the new feed.
    feedRef.current = {
      url,
      currCursor: null,
      nextCursor: null,
      isLastPage: false,
    };
    setFetchedData([]);
    setIsLastPage(false);
    setIsFetching(false);
    setErrorMessage("");

    return () => {
      feedRef.current = null;
      const controller = abortControllerRef.current;
      abortControllerRef.current = null;
      controller?.abort();
    };
  }, [url]);

  const fetchCivitai = useCallback(
    async (setIsIntersecting?: (isIntersecting: boolean) => void) => {
      const feed = feedRef.current;
      if (!url || !feed || feed.url !== url || errorMessage) return;
      if (abortControllerRef.current || feed.isLastPage) return;
      if (feed.nextCursor && feed.currCursor === feed.nextCursor) return;

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const isCurrent = () =>
        feedRef.current === feed && abortControllerRef.current === controller;

      try {
        setIsFetching(true);
        setErrorMessage("");

        const nextCursor = feed.nextCursor;
        const curUrl = `${url}${nextCursor ? `&cursor=${nextCursor}` : ""}`;

        const data = await fetchCivitaiImagePage(curUrl, controller.signal);
        if (!isCurrent() || controller.signal.aborted) return;

        setFetchedData((prevState) => {
          const newExampleImages = addToStart
            ? [...data.items, ...prevState]
            : [...prevState, ...data.items];

          // Remove duplicate images (Civitai bug).
          return FILTER_CIV_DUPLICATES
            ? filterDuplicates(newExampleImages, "id")
            : newExampleImages;
        });

        feed.currCursor = nextCursor;
        if (data.metadata?.nextCursor) {
          feed.nextCursor = data.metadata.nextCursor;
        } else {
          feed.isLastPage = true;
          setIsLastPage(true);
        }

        if (setIsIntersecting) setIsIntersecting(false);
      } catch (error) {
        if (!isCurrent() || controller.signal.aborted) return;

        const err = normalizeError(error);
        const original = err.original ?? err;
        if (
          (typeof original === "object" &&
            original !== null &&
            "name" in original &&
            original.name === "AbortError") ||
          (typeof original === "string" && original.includes("AbortError"))
        )
          return;

        handleErrors(err);
        setErrorMessage(ERROR_MESSAGE_CIV_CONNECTION);
      } finally {
        if (isCurrent()) {
          abortControllerRef.current = null;
          setIsFetching(false);
        }
      }
    },
    [url, errorMessage, addToStart],
  );

  return {
    fetchCivitai,
    fetchedData,
    isFetching,
    isLastPage,
    errorMessage,
    setFetchedData,
    setErrorMessage,
  };
};

export default useFetchCivitai;
