import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import firebaseApp from "../../firebase-config";
import type { CollectionSavedPost } from "../../../shared/types/collection";
import type { CollectionDoc, CollectionPreviewDoc, UserDoc } from "../../../shared/types/firestore";
import type { CollectionCategory } from "../../../shared/types/user";
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

export const fetchCollectionCategories = async (
  uid: string,
): Promise<CollectionCategory[] | null> => {
  const snapshot = await getDoc(doc(firestore, "users", uid));
  if (!snapshot.exists()) return null;
  const user = snapshot.data() as UserDoc;
  return user?.imageCategories || [];
};

export const saveCollectionCategories = (
  uid: string,
  categories: CollectionCategory[],
): Promise<void> =>
  setDoc(doc(firestore, "users", uid), { imageCategories: categories }, { merge: true });

export const createCollectionDocuments = async (
  uid: string,
  collectionId: number,
  collection: CollectionDoc,
  preview: CollectionPreviewDoc,
): Promise<void> => {
  const collectionRef = doc(firestore, "users", uid, "collections", collectionId + "");
  const previewRef = doc(firestore, "users", uid, "collectionPreviews", collectionId + "");

  // Preserve sequential merges and partial-failure behavior.
  await setDoc(collectionRef, collection, { merge: true });
  await setDoc(previewRef, preview, { merge: true });
};

export const deleteCollectionDocuments = async (
  uid: string,
  collectionId: number | string,
  categories: CollectionCategory[],
): Promise<void> => {
  const userRef = doc(firestore, "users", uid);
  const collectionRef = doc(firestore, "users", uid, "collections", collectionId + "");
  const previewRef = doc(firestore, "users", uid, "collectionPreviews", collectionId + "");

  // Category persistence must finish before either document is deleted.
  await setDoc(userRef, { imageCategories: categories }, { merge: true });
  await deleteDoc(collectionRef);
  await deleteDoc(previewRef);
};
