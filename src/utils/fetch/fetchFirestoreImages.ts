import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import type { Image, SavedPostDoc } from "../../../shared/types/image";
import {
  SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE,
  SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE,
} from "../../variables/constants";

const firestore = getFirestore(firebaseApp);

// Preserve the hook's empty-object cursor for the first page.
export type SavedImagePostsCursor = QueryDocumentSnapshot | {};

export const fetchSavedImagePosts = async ({
  uid,
  versionId,
  nsfwMode,
  cursor,
}: {
  uid: string;
  versionId: number;
  nsfwMode: boolean;
  cursor: SavedImagePostsCursor;
}) => {
  const snapshot = await getDocs(
    query(
      collection(firestore, "users", uid, "images"),
      where("versionsId", "array-contains", versionId),
      ...(!nsfwMode ? [where("hasSfw", "==", true)] : []),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE),
    ),
  );
  const isLastPage = snapshot.docs.length < SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE;
  return {
    posts: snapshot.docs.flatMap((doc) => doc.data() as SavedPostDoc),
    isLastPage,
    cursor: isLastPage ? cursor : snapshot.docs[snapshot.docs.length - 1],
  };
};

/** Fetches the caller's selected post IDs, including its pagination lookahead. */
export const fetchImagePostsByIds = async (
  uid: string,
  ids: number[],
  nsfwMode: boolean,
): Promise<SavedPostDoc[]> => {
  const snapshot = await getDocs(
    query(
      collection(firestore, "users", uid, "images"),
      where("id", "in", ids),
      where("hasSfw", "in", !nsfwMode ? [true] : [true, false]),
      orderBy("createdAt", "desc"),
      limit(SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1),
    ),
  );
  return snapshot.docs.flatMap((doc) => doc.data() as SavedPostDoc);
};

/** Null means the document is missing; an existing document may have no items. */
export const fetchDefaultModelImages = async (
  modelId: number | undefined,
  versionId: number | undefined,
): Promise<{ items?: Image[] } | null> => {
  const reference = doc(
    firestore,
    "models",
    modelId + "",
    "defaultImages",
    versionId + "",
  );
  const snapshot = await getDoc(reference);
  return snapshot.exists()
    ? { items: snapshot.data()?.items as Image[] | undefined }
    : null;
};
