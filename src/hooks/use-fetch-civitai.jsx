import { useCallback, useEffect, useRef, useState } from "react";

import { filterDuplicates, throwCustomError } from "../utils/generalUtils";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  ERROR_MESSAGE_INVALID_DATA,
  FILTER_CIV_DUPLICATES,
} from "../variables/constants";

/**
 * Fetches data from a given Civitai URL and manages the Civitai cursor-based pagination system
 * @param {String} url - The URL to fetch
 * @returns The state object containing the fetch function, fetched data, fetching state, last page state, error message,
 * and functions to update fetched data and the error message
 */
const useFetchCivitai = (url) => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currCursor, setCurrCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const abortControlerRef = useRef(null);

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
    async (setIsIntersecting) => {
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
        const data = await imgExampleResponse.json();

        if (!data?.items) {
          throwCustomError(ERROR_MESSAGE_INVALID_DATA);
        }

        let dataUniq = data?.items;

        // Remove dublicate images (fix for civitai bug)
        if (FILTER_CIV_DUPLICATES) {
          dataUniq = filterDuplicates(dataUniq, "id");
        }

        setFetchedData((prevState) => {
          const newExampleImages = [...dataUniq, ...prevState];

          return newExampleImages;
        });

        setCurrCursor(nextCursor || true);
        if (data.metadata?.nextCursor) {
          setNextCursor(data.metadata.nextCursor);
        } else {
          setIsLastPage(true);
        }
        setIsIntersecting(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setErrorMessage(ERROR_MESSAGE_CIV_CONNECTION);
        }
      } finally {
        setIsFetching(false);
      }
    },
    [nextCursor, url, currCursor]
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
