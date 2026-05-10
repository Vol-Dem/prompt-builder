import type { CollectionDoc } from "../../../shared/types/firestore";
import { fetchUserDataFromFirestore } from "./fetchUtils";

/**
 * Fetches data from Firestore
 * @param collectionId - The ID of the collection
 * @returns A promise that resolves with the collection data
 */
export const getCollectionData = async (
  collectionId: number | string,
): Promise<CollectionDoc> => {
  return (await fetchUserDataFromFirestore(
    "collections",
    collectionId + "",
  )) as CollectionDoc;
};
