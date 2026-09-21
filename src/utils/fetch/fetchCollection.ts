import { arrayRemove, arrayUnion, doc, getFirestore, writeBatch } from "firebase/firestore";

import firebaseApp from "../../firebase-config";
import type { CollectionSavedPost } from "../../../shared/types/collection";
import type { CollectionDoc } from "../../../shared/types/firestore";
import type { PostSavedData } from "../../types/collections.types";
import { fetchUserDataFromFirestore } from "./fetchUtils";

const firestore = getFirestore(firebaseApp);

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

export const saveCollectionPost = (
  uid: string,
  collectionId: number | null,
  {
    subcategoryIds,
    post,
    previousPost,
  }: {
    subcategoryIds: (string | null)[];
    post: { postId: number; imageIds: number[]; createdAt: number };
    previousPost?: PostSavedData | null;
  },
): Promise<void> => {
  const batch = writeBatch(firestore);
  const collectionRef = doc(firestore, "users", uid, "collections", collectionId + "");
  const previewRef = doc(firestore, "users", uid, "collectionPreviews", collectionId + "");

  if (previousPost?.postId) {
    batch.update(collectionRef, { posts: arrayRemove(previousPost) });
  }
  batch.update(collectionRef, {
    subcategories: arrayUnion(...subcategoryIds),
    posts: arrayUnion(post),
  });
  batch.update(previewRef, { subcategories: arrayUnion(...subcategoryIds) });
  return batch.commit();
};

type CollectionMetadata = {
  name: string;
  nameArr: string[];
  category: string | null;
  subcategories: (string | null)[];
  nsfw: boolean;
};

export const saveCollectionMetadata = (
  uid: string,
  collectionId: number | null,
  preview: CollectionMetadata,
  collection: CollectionMetadata & { description: string },
): Promise<void> => {
  const batch = writeBatch(firestore);
  const collectionRef = doc(firestore, "users", uid, "collections", collectionId + "");
  const previewRef = doc(firestore, "users", uid, "collectionPreviews", collectionId + "");

  batch.update(previewRef, preview);
  batch.update(collectionRef, collection);
  return batch.commit();
};

export const saveCollectionPosts = (
  uid: string,
  collectionId: number,
  posts: CollectionSavedPost[],
): Promise<void> => {
  const collectionRef = doc(firestore, "users", uid, "collections", collectionId + "");
  const batch = writeBatch(firestore);
  batch.update(collectionRef, { posts });
  return batch.commit();
};
