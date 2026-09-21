import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import {
  checkIsInCurrentNsfwRange,
  filterDuplicates,
} from "../utils/generalUtils";
import {
  fetchSavedImagePosts,
  type SavedImagePostsCursor,
} from "../utils/fetch/fetchFirestoreImages";
import { useAppSelector } from "../store/hooks/hooks";
import type { Image } from "../../shared/types/image";

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
  const [lastVisible, setLastVisible] = useState<SavedImagePostsCursor>({});
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

      const {
        posts: data,
        isLastPage: isLast,
        cursor,
      } = await fetchSavedImagePosts({
        uid,
        versionId: curImagesModelVersionId,
        nsfwMode,
        cursor: lastVisible,
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

      if (!isLast) {
        setLastVisible(cursor);
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
