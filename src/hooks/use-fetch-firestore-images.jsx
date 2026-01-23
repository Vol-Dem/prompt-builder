import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
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

const firestore = getFirestore(firebaseApp);

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
 * @param {string} curImagesModelVersionId - Firestore model version ID used to filter images.
 *
 * @returns {{
 *   fetchedData: Array<Array<Object>>,
 *   fetchFirestoreData: () => Promise<void>,
 *   setFetchedData: React.Dispatch<React.SetStateAction<Array<Array<Object>>>>,
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
const useFetchFirestoreImages = (curImagesModelVersionId) => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [lastVisible, setLastVisible] = useState({});
  const [fetchedData, setFetchedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const uid = useSelector((state) => state.auth.user.uid);

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
        return doc.data();
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
    savedImagesData.data,
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
