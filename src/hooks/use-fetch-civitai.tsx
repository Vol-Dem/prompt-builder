import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  AppError,
  filterDuplicates,
  normalizeError,
} from "../utils/generalUtils";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  ERROR_MESSAGE_INVALID_DATA,
  FILTER_CIV_DUPLICATES,
} from "../variables/constants";

interface CivitaiFetchResultItem {
  id: number;
}

interface CivitaiFetchResult {
  items: CivitaiFetchResultItem[];
  metadata: { nextCursor: string; nextPage: string };
}

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
const useFetchCivitai = (url: string): useFetchCivitaiReturn => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currCursor, setCurrCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const abortControlerRef = useRef<AbortController>(null);

  useEffect(() => {
    const resetExamples = () => {
      setCurrCursor(null);
      setNextCursor(null);
      setFetchedData([]);
      setIsLastPage(false);
    };
    resetExamples();

    return () => {
      resetExamples();
      if (abortControlerRef.current) {
        abortControlerRef.current.abort();
      }
    };
  }, [url]);

  const fetchCivitai = useCallback(
    async (setIsIntersecting?: (isIntersecting: boolean) => void) => {
      if (!url) return;
      if (nextCursor && currCursor === nextCursor) return;

      try {
        setIsFetching(true);
        if (abortControlerRef.current) {
          abortControlerRef.current.abort();
        }
        const newAbortControler = new AbortController();
        abortControlerRef.current = newAbortControler;

        setErrorMessage("");

        const curUrl = `${url}${nextCursor ? `&cursor=${nextCursor}` : ""}`;

        const imgExampleResponse = await fetch(curUrl, {
          signal: newAbortControler.signal,
        });
        const data = (await imgExampleResponse.json()) as CivitaiFetchResult;

        if (!data?.items) {
          throw new AppError(ERROR_MESSAGE_INVALID_DATA);
        }

        let dataUniq = data?.items;

        // Remove dublicate images (Civitai bug)
        // if (FILTER_CIV_DUPLICATES) {
        //   dataUniq = filterDuplicates(dataUniq, "id");
        // }

        setFetchedData((prevState) => {
          const newExampleImages = [...dataUniq, ...prevState];

          // Remove dublicate images (Civitai bug)
          return FILTER_CIV_DUPLICATES
            ? filterDuplicates(newExampleImages, "id")
            : newExampleImages;
        });

        setCurrCursor(nextCursor);
        if (data.metadata?.nextCursor) {
          setNextCursor(data.metadata.nextCursor);
        } else {
          setIsLastPage(true);
        }

        if (setIsIntersecting) setIsIntersecting(false);
      } catch (error) {
        const err = normalizeError(error);
        console.log(error);
        if (err?.name !== "AbortError") {
          setErrorMessage(ERROR_MESSAGE_CIV_CONNECTION);
        }
      } finally {
        setIsFetching(false);
      }
    },
    [nextCursor, url, currCursor],
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
