import { memo, useCallback, useEffect, useRef, useState } from "react";
import classes from "./SavedImages.module.scss";
import { useSelector } from "react-redux";
import Carousel from "../../../carousel/Carousel";
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
import firebaseApp from "../../../../firebase-config";
import Spinner from "../../../ui/Spinner";
import ErrorMessage from "../../../ui/ErrorMessage";
import { useOnlineStatus } from "../../../../hooks/use-online-status";
import {
  ERROR_MESSAGE_DEFAULT,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE,
  SETTINGS_LOAD_MORE_MARGIN,
} from "../../../../variables/constants";
import ExclamationCircleSvg from "../../../../assets/ExclamationCircleSvg";
import FolderSvg from "../../../../assets/FolderSvg";
import { motion } from "framer-motion";
import useIntersection from "../../../../hooks/use-intersection";
import {
  checkIsInCurrentNsfwRange,
  filterDuplicates,
} from "../../../../utils/generalUtils";

const firestore = getFirestore(firebaseApp);

const SavedImages = memo(
  ({ modelId, curImagesModelVersionId, errorMessage, setErrorMessage }) => {
    const [examplesIsLoading, setExamplesIsLoading] = useState(false);
    const [isLastPage, setIsLastPage] = useState(false);
    const [lastVisible, setLastVisible] = useState({});
    const [examplesImgData, setExamplesImgData] = useState([]);
    const model = useSelector((state) => state.model.model);
    const savedImagesData = useSelector((state) => state.model.savedImages);
    const curVersion = useSelector((state) => state.model.curVersion);
    const nsfwMode = useSelector((state) => state.general.nsfwMode);
    const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
    const uid = useSelector((state) => state.auth.user.uid);
    const endPageRef = useRef(null);
    const isIntersecting = useIntersection(
      endPageRef,
      false,
      SETTINGS_LOAD_MORE_MARGIN
    );
    const isOnline = useOnlineStatus();

    const resetExamples = () => {
      setExamplesImgData([]);
      setIsLastPage(false);
      setLastVisible({});
    };

    useEffect(() => {
      resetExamples();
      return () => {
        resetExamples();
      };
    }, [curImagesModelVersionId]);

    useEffect(() => {
      resetExamples();
    }, [nsfwLevel]);

    const getImagesFromFirestore = useCallback(async () => {
      try {
        if (isLastPage) return;
        setExamplesIsLoading(true);

        setErrorMessage("");

        let q;

        if (nsfwMode) {
          q = query(
            collection(firestore, "users", uid, "images"),
            where("versionsId", "array-contains", curImagesModelVersionId),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE)
          );
        } else {
          q = query(
            collection(firestore, "users", uid, "images"),
            where("versionsId", "array-contains", curImagesModelVersionId),
            where("hasSfw", "==", true),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE)
          );
        }

        const modelImagesSnap = await getDocs(q);

        const isLast =
          !modelImagesSnap.docs.length ||
          modelImagesSnap.docs.length < SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE;

        const data = modelImagesSnap.docs.flatMap((doc, i) => {
          return doc.data();
        });

        const examples = data
          .map((post) => {
            return filterDuplicates(
              post.items.filter((image) => {
                const saved =
                  savedImagesData.data.hasOwnProperty(
                    curImagesModelVersionId
                  ) &&
                  savedImagesData.data[curImagesModelVersionId]
                    ?.find((postData) => postData.postId === image.postId)
                    ?.imagesId?.includes(image.id);

                const isInCurrentNsfwRange = checkIsInCurrentNsfwRange(
                  nsfwLevel,
                  image?.nsfwLevel
                );

                return saved && isInCurrentNsfwRange;
              }),
              "id"
            ).sort((a, b) => {
              return Date.parse(a.createdAt) - Date.parse(b.createdAt);
            });
          })
          .filter((item) => !!item.length);

        setExamplesImgData((prevState) => [...prevState, ...examples]);

        const lastVisiblePost =
          modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
        if (!isLast) {
          setLastVisible(lastVisiblePost);
        }
        setIsLastPage(isLast);
        setExamplesIsLoading(false);
      } catch (err) {
        setErrorMessage(ERROR_MESSAGE_DEFAULT);
        setExamplesIsLoading(false);
      }
    }, [
      curImagesModelVersionId,
      isLastPage,
      lastVisible,
      savedImagesData.data,
      nsfwMode,
      nsfwLevel,
      uid,
      setErrorMessage,
    ]);

    useEffect(() => {
      if (
        !isLastPage &&
        isIntersecting &&
        !errorMessage &&
        isOnline &&
        !examplesIsLoading
      ) {
        setExamplesIsLoading(true);
        // clearTimeout(timeoutRef.current);
        getImagesFromFirestore();
      }
    }, [
      isIntersecting,
      isLastPage,
      getImagesFromFirestore,
      errorMessage,
      examplesIsLoading,
      isOnline,
    ]);

    useEffect(() => {
      if (!!savedImagesData.data && !!examplesImgData?.length) {
        const savedPostsIds = savedImagesData.data[
          curImagesModelVersionId
        ]?.map((post) => post.postId);

        const newExamples = examplesImgData?.filter((image) =>
          savedPostsIds?.includes(image[0]?.postId)
        );
        if (examplesImgData?.length > newExamples?.length) {
          setExamplesImgData(newExamples);
        }
      }
    }, [savedImagesData.data, curImagesModelVersionId, examplesImgData]);

    const examplesHtml = examplesImgData.flatMap((item, i) => {
      const postData = savedImagesData?.data[curVersion.id]?.find(
        (post) => post.postId === item[0].postId
      );

      return (
        <Carousel
          key={i}
          versionId={curImagesModelVersionId}
          imagesData={item}
          postId={item[0].postId}
          visibleImgAmount={1}
          modelId={model.id}
          saved={true}
          showInView={true}
          location="models"
          locationId={model.id}
          curPostData={postData}
        />
      );
    });

    return (
      <>
        {examplesHtml}
        {examplesIsLoading && <Spinner />}
        {errorMessage && isOnline && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        {!examplesIsLoading && !examplesHtml.length && !errorMessage && (
          <motion.div
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            className={classes["notification"]}
          >
            <ExclamationCircleSvg className={classes["notification__svg"]} />
            <span>No images found.</span>
            <span>
              Click{" "}
              <FolderSvg
                className={`${classes["svg"]} ${classes["svg--medium"]}`}
              />{" "}
              at the top left corner of the image or use "Add image by ID"
              button to add it to your collection.
            </span>
          </motion.div>
        )}
        <div ref={endPageRef}></div>
      </>
    );
  }
);

export default SavedImages;
