import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  where,
} from "firebase/firestore";

import {
  ERROR_MESSAGE_DEFAULT,
  SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE,
} from "../variables/constants";
import {
  checkIsInCurrentNsfwRange,
  filterDuplicates,
} from "../utils/generalUtils";
import firebaseApp from "../firebase-config";
import { useAppSelector } from "../store/hooks/hooks";
import type { Image, SavedPostDoc } from "../../shared/types/image";

const firestore = getFirestore(firebaseApp);

interface useFetchFirestoreImagesReturn {
  fetchedData: Image[][];
  fetchFirestoreData: () => Promise<void>;
  setFetchedData: Dispatch<SetStateAction<Image[][]>>;
  isFetching: boolean;
  isLastPage: boolean;
  errorMessage: string;
}

/**
 * Fetches and paginates saved Firestore images for a specific model version.
 * Applies NSFW filtering, deduplication, and client-side sorting.
 *
 * This hook:
 * - Resets data when model version or NSFW level changes
 * - Supports infinite scroll / manual pagination
 * - Filters only images saved by the user
 * - Applies current NSFW visibility rules
 *
 * @param curImagesModelVersionId - Firestore model version ID used to filter images.
 *
 * @returns {{
 *   fetchedData: Image[][],
 *   fetchFirestoreData: () => Promise<void>,
 *   setFetchedData: React.Dispatch<SetStateAction<Image[][]>>,
 *   isFetching: boolean,
 *   isLastPage: boolean,
 *   errorMessage: string
 * }}
 *
 * @example
 * const {
 *   fetchedData,
 *   fetchFirestoreData,
 *   isFetching,
 *   isLastPage
 * } = useFetchFirestoreImages(modelVersionId);
 */
const useFetchFirestoreImages = (
  curImagesModelVersionId: number,
): useFetchFirestoreImagesReturn => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | {}>(
    {},
  );
  const [fetchedData, setFetchedData] = useState<Image[][]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const savedImagesData = useAppSelector((state) => state.model.savedImages);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useAppSelector((state) => state.general.nsfwLevel);
  const uid = useAppSelector((state) => state.auth.user.uid);

  const resetImages = () => {
    setFetchedData([]);
    setIsLastPage(false);
    setLastVisible({});
  };

  useEffect(() => {
    resetImages();
    return () => {
      resetImages();
    };
  }, [curImagesModelVersionId, nsfwLevel]);

  const fetchFirestoreData = useCallback(async () => {
    try {
      if (isLastPage) return;
      setIsFetching(true);

      setErrorMessage("");

      let q;

      if (nsfwMode) {
        q = query(
          collection(firestore, "users", uid, "images"),
          where("versionsId", "array-contains", curImagesModelVersionId),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE),
        );
      } else {
        q = query(
          collection(firestore, "users", uid, "images"),
          where("versionsId", "array-contains", curImagesModelVersionId),
          where("hasSfw", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE),
        );
      }

      const modelImagesSnap = await getDocs(q);

      const isLast =
        !modelImagesSnap.docs.length ||
        modelImagesSnap.docs.length < SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE;

      const data = modelImagesSnap.docs.flatMap((doc) => {
        return doc.data() as SavedPostDoc;
      });

      const images = data
        .map((post) => {
          return filterDuplicates(
            post.items.filter((image) => {
              const saved =
                savedImagesData?.data &&
                Object.hasOwn(savedImagesData.data, curImagesModelVersionId) &&
                savedImagesData.data[curImagesModelVersionId]
                  ?.find((postData) => postData.postId === image.postId)
                  ?.imagesId?.includes(image.id);

              const isInCurrentNsfwRange = checkIsInCurrentNsfwRange(
                nsfwLevel,
                image?.nsfwLevel,
              );

              return saved && isInCurrentNsfwRange;
            }),
            "id",
          ).sort((a, b) => {
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
          });
        })
        .filter((item) => !!item.length);

      setFetchedData((prevState) => [...prevState, ...images]);

      const lastVisiblePost =
        modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
      if (!isLast) {
        setLastVisible(lastVisiblePost);
      }
      setIsLastPage(isLast);
      setIsFetching(false);
    } catch (err) {
      console.log(err);
      setErrorMessage(ERROR_MESSAGE_DEFAULT);
      setIsFetching(false);
    }
  }, [
    curImagesModelVersionId,
    isLastPage,
    lastVisible,
    savedImagesData?.data,
    nsfwMode,
    nsfwLevel,
    uid,
  ]);

  return {
    fetchedData,
    fetchFirestoreData,
    setFetchedData,
    isFetching,
    isLastPage,
    errorMessage,
  };
};

export default useFetchFirestoreImages;
