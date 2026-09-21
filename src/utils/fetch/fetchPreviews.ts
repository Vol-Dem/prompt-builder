import {
  collection,
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
import type {
  CollectionPreviewDoc,
  ModelPreviewDoc,
} from "../../../shared/types/firestore";
import {
  SETTINGS_COLLECTION_PREVIEW_PER_PAGE,
  SETTINGS_MODEL_PREVIEW_PER_PAGE,
} from "../../variables/constants";

const firestore = getFirestore(firebaseApp);

export type ModelPreviewCursor = QueryDocumentSnapshot | "";
export type CollectionPreviewCursor = QueryDocumentSnapshot | null;

interface ModelPreviewPageOptions {
  uid: string;
  activeTab: string;
  activeCategory: string | null;
  activeSubcategory: string | null;
  baseModel: string;
  sortBy: string;
  nsfwMode: boolean;
  cursor: ModelPreviewCursor;
}

/** Fetches one page without owning cursor resets or accumulated results. */
export const fetchModelPreviewPage = async ({
  uid,
  activeTab,
  activeCategory,
  activeSubcategory,
  baseModel,
  sortBy,
  nsfwMode,
  cursor,
}: ModelPreviewPageOptions) => {
  const optionalWhere = [];
  if (activeTab && activeTab !== "all") {
    optionalWhere.push(where("modelType", "==", activeTab));
  }
  if (activeCategory && activeCategory !== "all") {
    optionalWhere.push(where("main", "==", activeCategory));
  }
  if (activeSubcategory && activeSubcategory !== "all") {
    optionalWhere.push(where("sub", "array-contains", activeSubcategory));
  }
  if (baseModel && baseModel !== "-") {
    optionalWhere.push(where("baseModel", "==", baseModel));
  }

  const snapshot = await getDocs(
    query(
      collection(firestore, "users", uid, "preview"),
      ...optionalWhere,
      where("nsfw", "in", !nsfwMode ? [false] : [true, false]),
      orderBy(sortBy, sortBy === "name" ? "asc" : "desc"),
      startAfter(cursor),
      limit(SETTINGS_MODEL_PREVIEW_PER_PAGE),
    ),
  );
  const items = snapshot.docs.map((doc) => doc.data() as ModelPreviewDoc);
  const isLastPage = snapshot.docs.length < SETTINGS_MODEL_PREVIEW_PER_PAGE;

  return {
    items,
    isLastPage,
    cursor: isLastPage ? cursor : snapshot.docs[snapshot.docs.length - 1],
  };
};

interface CollectionPreviewPageOptions {
  uid: string;
  activeCategory: string;
  activeSubcategory: string;
  nsfwMode: boolean;
  cursor: CollectionPreviewCursor;
}

export const fetchCollectionPreviewPage = async ({
  uid,
  activeCategory,
  activeSubcategory,
  nsfwMode,
  cursor,
}: CollectionPreviewPageOptions) => {
  const optionalWhere = [];
  if (activeCategory && activeCategory !== "all") {
    optionalWhere.push(where("category", "==", activeCategory));
  }
  if (activeSubcategory && activeSubcategory !== "all") {
    optionalWhere.push(
      where("subcategories", "array-contains", activeSubcategory),
    );
  }

  const snapshot = await getDocs(
    query(
      collection(firestore, "users", uid, "collectionPreviews"),
      ...optionalWhere,
      where("nsfw", "in", !nsfwMode ? [false] : [true, false]),
      orderBy("name", "asc"),
      startAfter(cursor),
      limit(SETTINGS_COLLECTION_PREVIEW_PER_PAGE),
    ),
  );
  const items = snapshot.docs.map((doc) => ({
    type: "collection",
    ...(doc.data() as CollectionPreviewDoc),
  }));
  const isLastPage = snapshot.docs.length < SETTINGS_COLLECTION_PREVIEW_PER_PAGE;

  return {
    items,
    isLastPage,
    cursor: isLastPage ? cursor : snapshot.docs[snapshot.docs.length - 1],
  };
};
