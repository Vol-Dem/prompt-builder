import { fetchUserDataFromFirestore } from "./fetchUtils";

/**
 * Fetches data from Firestore
 * @param {Number | String} collectionId - The ID of the collection
 * @returns {Promise<Object>} A promise that resolves with the collection data
 */
export const getCollectionData = async (collectionId) => {
  return await fetchUserDataFromFirestore("collections", collectionId + "");
};
