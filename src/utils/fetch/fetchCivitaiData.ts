import type {
  CivitaiFetchResult,
  CivitaiFetchResultItem,
} from "../../../shared/types/api";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../../variables/constants";
import { AppError } from "../generalUtils";

class CivitaiRequestError extends AppError {
  readonly source = "civitai";
  readonly url: string;
  readonly status?: number;

  constructor(url: string, code: string, original: unknown, status?: number) {
    super(ERROR_MESSAGE_CIV_CONNECTION, code, original);
    this.url = url;
    this.status = status;
  }
}

const isCancellation = (error: unknown, signal?: AbortSignal | null) =>
  signal?.aborted ||
  (typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError");

/** Checks the transport and response envelope, leaving field policies to callers. */
export const fetchCivitaiData = async <T>(
  url: string,
  config?: RequestInit,
  validate?: (data: Record<string, unknown>) => boolean,
): Promise<T> => {
  let response: Response;
  try {
    response = config === undefined ? await fetch(url) : await fetch(url, config);
  } catch (error) {
    if (isCancellation(error, config?.signal)) throw error;
    throw new CivitaiRequestError(url, "civitai/network", error);
  }

  if (!response.ok) {
    throw new CivitaiRequestError(url, "civitai/http", response, response.status);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (isCancellation(error, config?.signal)) throw error;
    throw new CivitaiRequestError(url, "civitai/json", error, response.status);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data) ||
    (validate && !validate(data as Record<string, unknown>))
  ) {
    throw new CivitaiRequestError(
      url,
      "civitai/invalid-response",
      data,
      response.status,
    );
  }

  return data as T;
};

/** Empty result sets are valid; the caller decides whether they are useful. */
export const fetchCivitaiItems = <T = CivitaiFetchResultItem>(
  url: string,
  config?: RequestInit,
) =>
  fetchCivitaiData<CivitaiFetchResult<T>>(
    url,
    config,
    (data) => Array.isArray(data.items),
  );
