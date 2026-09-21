import {
  and,
  collection,
  FieldPath,
  getDocs,
  getFirestore,
  limit,
  or,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type Query,
  type QueryCompositeFilterConstraint,
  type QueryDocumentSnapshot,
  type QueryFieldFilterConstraint,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { clearFileExtension } from "../../../shared/utils";
import type {
  CollectionPreviewDoc,
  ModelPreviewDoc,
} from "../../../shared/types/firestore";
import type { SearchFilter, SearchResultCollection } from "../../types/search.types";

const firestore = getFirestore(firebaseApp);

export type SearchCursor = QueryDocumentSnapshot | string;

export interface SearchPage<T> {
  items: T[];
  cursor: SearchCursor;
}

interface FirestoreSearchOptions {
  uid: string;
  searchString: string;
  nsfwMode: boolean;
  limitAmount: number;
  hashtag: boolean;
  creator: boolean;
  onlyCollections: boolean;
  filter?: SearchFilter;
  lastVisible: SearchCursor;
  lastVisibleCollection: SearchCursor;
  lastVisibleSub: SearchCursor;
}

/**
 * Generates the existing name variants and ID-aware Firestore search rules.
 */
const createNameQuery = (
  searchString: string,
  nsfwFilter: boolean[],
  optionalWhere: QueryFieldFilterConstraint[] = [],
): QueryCompositeFilterConstraint => {
  const capitalized = searchString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return or(
    // query as-is:
    and(
      ...optionalWhere,
      where("name", ">=", searchString),
      where("name", "<=", searchString + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    //by id
    and(...optionalWhere, where("id", "==", +searchString)),
    // capitalize first letter:
    and(
      ...optionalWhere,
      where(
        "name",
        ">=",
        searchString.charAt(0).toUpperCase() + searchString.slice(1),
      ),
      where(
        "name",
        "<=",
        searchString.charAt(0).toUpperCase() + searchString.slice(1) + "\uf8ff",
      ),
      where("nsfw", "in", nsfwFilter),
    ),
    // capitalize all:
    and(
      ...optionalWhere,
      where("name", ">=", capitalized),
      where("name", "<=", capitalized + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    // caps:
    and(
      ...optionalWhere,
      where("name", ">=", searchString.toUpperCase()),
      where("name", "<=", searchString.toUpperCase() + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    // lowercase:
    and(
      ...optionalWhere,
      where("name", ">=", searchString.toLowerCase()),
      where("name", "<=", searchString.toLowerCase() + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    and(
      ...optionalWhere,
      where("nameArr", "array-contains-any", [
        clearFileExtension(searchString).toLowerCase(),
      ]),
      where("nsfw", "in", nsfwFilter),
    ),
  );
};

const fetchSearchPage = async <T>(
  request: Query,
  mapData: (data: DocumentData) => T,
): Promise<SearchPage<T>> => {
  const snapshot = await getDocs(request);
  return {
    items: snapshot.docs.map((doc) => mapData(doc.data())),
    cursor: snapshot.docs[snapshot.docs.length - 1] || "",
  };
};

/**
 * Prepares all queries eagerly, as the search workflow has always done.
 * Callers choose which requests to execute and own pagination and result merging.
 */
export const createFirestoreSearchRequests = ({
  uid,
  searchString,
  nsfwMode,
  limitAmount,
  hashtag,
  creator,
  onlyCollections,
  filter,
  lastVisible,
  lastVisibleCollection,
  lastVisibleSub,
}: FirestoreSearchOptions) => {
  const modelPreviewRef = collection(firestore, "users", uid, `preview`);
  const collectionPreviewRef = collection(
    firestore,
    "users",
    uid,
    `collectionPreviews`,
  );

  const nsfwFilter = !nsfwMode ? [false] : [true, false];

  const optionalWhere = [];

  if (filter?.modelType?.length && !onlyCollections) {
    optionalWhere.push(where("modelType", "in", filter.modelType));
  }
  if (filter?.baseModel?.length && !onlyCollections) {
    optionalWhere.push(where("baseModel", "in", filter.baseModel));
  }

  const modelQueryByNameRule = createNameQuery(
    searchString,
    nsfwFilter,
    optionalWhere,
  );
  const collectionQueryByNameRule = createNameQuery(
    searchString,
    nsfwFilter,
  );

  const queryModelsByName = query(
    modelPreviewRef,
    modelQueryByNameRule,
    orderBy("name", "asc"),
    startAfter(lastVisible),
    limit(limitAmount),
  );

  const queryCollectionsByName = query(
    collectionPreviewRef,
    collectionQueryByNameRule,
    orderBy("name", "asc"),
    startAfter(lastVisibleCollection),
    limit(limitAmount),
  );

  let queryRuleSub: QueryCompositeFilterConstraint;

  const hashlessSearchString =
    searchString.trim()[0] === "#" ? searchString.slice(1) : searchString;

  if (hashtag) {
    queryRuleSub = and(
      ...optionalWhere,
      where("authorTags", "array-contains-any", [
        searchString,
        searchString.toLowerCase(),
        hashlessSearchString,
      ]),
      where("nsfw", "in", nsfwFilter),
    );
  } else if (creator) {
    const creatorUsernamePath = new FieldPath("creator", "username");
    queryRuleSub = and(
      ...optionalWhere,
      where(creatorUsernamePath, "==", searchString),
      where("nsfw", "in", nsfwFilter),
    );
  } else {
    queryRuleSub = or(
      and(
        ...optionalWhere,
        where("fileNames", "array-contains-any", [
          clearFileExtension(searchString).toLowerCase(),
        ]),
        where("nsfw", "in", nsfwFilter),
      ),
      and(
        ...optionalWhere,
        where("customFileNames", "array-contains-any", [
          clearFileExtension(searchString).toLowerCase(),
        ]),
        where("nsfw", "in", nsfwFilter),
      ),
      and(
        ...optionalWhere,
        where("mainTags", "array-contains-any", [
          clearFileExtension(searchString).toLowerCase(),
        ]),
        where("nsfw", "in", nsfwFilter),
      ),
      and(
        ...optionalWhere,
        where("versionIds", "array-contains-any", [+searchString]),
        where("nsfw", "in", nsfwFilter),
      ),
      and(
        ...optionalWhere,
        where("authorTags", "array-contains-any", [
          searchString,
          searchString.toLowerCase(),
          hashlessSearchString,
        ]),
        where("nsfw", "in", nsfwFilter),
      ),
    );
  }

  const querySub = query(
    modelPreviewRef,
    queryRuleSub,
    orderBy("name", "asc"),
    startAfter(lastVisibleSub),
    limit(limitAmount),
  );

  return {
    fetchModelsByName: () =>
      fetchSearchPage(queryModelsByName, (data) => data as ModelPreviewDoc),
    fetchCollectionsByName: () =>
      fetchSearchPage<SearchResultCollection>(queryCollectionsByName, (data) => ({
        type: "collection",
        ...(data as CollectionPreviewDoc),
      })),
    fetchModelsBySecondaryFields: () =>
      fetchSearchPage(querySub, (data) => data as ModelPreviewDoc),
  };
};
