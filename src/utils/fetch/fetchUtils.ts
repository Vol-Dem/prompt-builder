import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import firebaseApp from "../../firebase-config";
import { addDelayPromise, AppError, normalizeError } from "../generalUtils";
import type { UserGuideState } from "../../../shared/types/user";
import { ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * Makes a batch request using the provided fetch function
 * @param data - The data to fetch
 * @param fetchFunc - The fetch function
 * @param concurrencyLimit - The number of simultaneous requests
 * @param returnResult - Whether to return the fetched result
 * @param delay - The delay between each request in milliseconds
 * @returns A promise that resolves with fetched data if returnResult is true
 */
export const makeBatchRequest = async <T, R>(
  data: T[],
  fetchFunc: (curBatch: T[]) => Promise<R[] | void>,
  concurrencyLimit: number = 5,
  returnResult: boolean = true,
  delay: number = 500,
): Promise<R[]> => {
  try {
    let result: R[] = [];
    const queue = [...data];

    const processQueue = async () => {
      while (queue.length > 0) {
        const curBatch: T[] = [];

        for (let i = 0; i < concurrencyLimit && queue.length > 0; i++) {
          const curElement = queue.shift();
          if (curElement !== undefined) {
            curBatch.push(curElement);
          }
        }

        await addDelayPromise(delay);

        const batchResults = await fetchFunc(curBatch);

        if (returnResult && batchResults) {
          result.push(...batchResults);
        }
      }
    };

    await processQueue();

    return result;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Fetches data from a given URL
 * @param url - The URL to fetch
 * @param config - The fetch configuration
 * @returns A promise that resolves with the fetched data
 */
export const fetchData = async <T>(
  url: string,
  config?: Record<string, any>,
): Promise<T> => {
  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new AppError(data.message || `Error (${response.status})`);
  }

  return data;
};

/**
 * Fetches a document from Firestore
 * @param docPath - The path to the document
 * @returns A promise resolved with the document content
 * @throws If the final path has an odd number of segments and does not point to a document.
 */
export const fetchDataFromFirestore = async <T>(
  ...docPath: [string, ...string[]]
): Promise<T> => {
  try {
    const dataDoc = doc(firestore, ...docPath);
    const docSnap = await getDoc(dataDoc);

    if (!docSnap.exists()) {
      throw new AppError("Can't find document");
    }

    return docSnap.data() as T;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Fetches a user document from Firestore
 * @param docPath - The path to the user document
 * @returns A promise resolved with the document content
 * @throws If the final path has an odd number of segments and does not point to a document.
 */
export const fetchUserDataFromFirestore = async (...docPath: string[]) => {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new AppError(ERROR_MESSAGE_DEFAULT);
  return fetchDataFromFirestore("users", uid, ...docPath);
};

/**
 * Saves the current guide state to the database
 * @param guideData - The guide data
 * @param uid - The user ID
 * @returns A promise that resolves when the guide state is saved
 */
export const saveGuideData = async (guideData: UserGuideState, uid: string) => {
  try {
    if (!guideData || !uid) return;

    const userRef = doc(firestore, "users", uid);

    await setDoc(
      userRef,
      {
        guide: guideData,
      },
      { merge: true },
    );
  } catch (error) {
    const err = normalizeError(error);
    console.error(err.message);
  }
};
