import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import firebaseApp from "../../firebase-config";
import { addDelayPromise, throwCustomError } from "../generalUtils";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * Makes a batch request using the provided fetch function
 * @param {array} data - The data to fetch
 * @param {function} fetchFunc - The fetch function
 * @param {number} concurrencyLimit - The number of simultaneous requests
 * @param {boolean} returnResult - Whether to return the fetched result
 * @param {number} delay - The delay between each request in milliseconds
 * @returns {Promise<array | void>} A promise that resolves with fetched data if returnResult is true
 */
export const makeBatchRequest = async (
  data,
  fetchFunc,
  concurrencyLimit = 5,
  returnResult = true,
  delay = 500,
) => {
  try {
    let result = [];
    const queue = data.slice();

    const processQueue = async () => {
      while (queue.length > 0) {
        const curBatch = [];
        for (let i = 0; i < concurrencyLimit && queue.length > 0; i++) {
          const curElement = queue.shift();
          curBatch.push(curElement);
        }
        await addDelayPromise(delay);

        const batchResults = await fetchFunc(curBatch);

        if (returnResult) result = [...result, ...batchResults];
      }
    };

    await processQueue();
    return result;
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

/**
 * Fetches data from a given URL
 * @param {string} url - The URL to fetch
 * @param {object} config - The fetch configuration
 * @returns A promise that resolves with the fetched data
 */
export const fetchData = async (url, config) => {
  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Error (${response.status})`);
  }

  return data;
};

/**
 * Fetches a document from Firestore
 * @param  {...string} docPath - The path to the document
 * @returns {Promise} A promise resolved with the document content
 * @throws If the final path has an odd number of segments and does not point to a document.
 */
export const fetchDataFromFirestore = async (...docPath) => {
  try {
    const dataDoc = doc(firestore, ...docPath);
    const docSnap = await getDoc(dataDoc);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throwCustomError("Can't find document");
    }
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Fetches a user document from Firestore
 * @param  {...string} docPath - The path to the user document
 * @returns {Promise}  A promise resolved with the document content
 * @throws If the final path has an odd number of segments and does not point to a document.
 */
export const fetchUserDataFromFirestore = async (...docPath) => {
  const uid = auth?.currentUser?.uid;
  return fetchDataFromFirestore("users", uid, ...docPath);
};

/**
 * Saves the current guide state to the database
 * @param {object} guideData - The guide data
 * @param {string} uid - The user ID
 * @returns {Promise<void>} A promise that resolves when the guide state is saved
 */
export const saveGuideData = async (guideData, uid) => {
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
  } catch (err) {
    console.error(err.message);
  }
};
