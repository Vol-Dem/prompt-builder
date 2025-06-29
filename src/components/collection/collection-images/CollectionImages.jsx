import { memo, useCallback, useEffect, useRef, useState } from "react";
import classes from "./CollectionImages.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "../../carousel/Carousel";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";

import { useOnlineStatus } from "../../../hooks/use-online-status";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_LOAD_MORE_MARGIN_MEDIUM,
} from "../../../variables/constants";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import FolderSvg from "../../../assets/FolderSvg";
import { motion } from "framer-motion";
import useIntersection from "../../../hooks/use-intersection";
import { getColectionImagesByIds, imagesActions } from "../../../store/images";

const CollectionImages = memo(() => {
  const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const savedImagesData = useSelector(
    (state) => state.images.collectionData
  )?.posts?.toSorted((a, b) => b.createdAt - a.createdAt);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const uid = useSelector((state) => state.auth.user.uid);
  const collectionData = useSelector((state) => state.images.collectionData);
  const collectionImages = useSelector(
    (state) => state.images.collectionImages
  );
  const examplesImgData = collectionImages?.images || [];
  const isLastPage = !!collectionImages?.isLastPage;
  const endPageRef = useRef(null);
  const isIntersecting = useIntersection(
    endPageRef,
    false,
    SETTINGS_LOAD_MORE_MARGIN_MEDIUM
  );
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(imagesActions.setCollectionImages({}));
    return () => {
      dispatch(imagesActions.setCollectionImages({}));
    };
  }, [collectionData?.id, nsfwLevel, dispatch]);

  const getImagesFromFirestore = useCallback(
    async (posts) => {
      try {
        console.log("GET IMAGES");

        if (isLastPage) return;
        setExamplesIsLoading(true);

        await dispatch(getColectionImagesByIds(posts, collectionData?.id));
      } catch (err) {
        setErrorMessage(err);
      } finally {
        setExamplesIsLoading(false);
      }
    },
    [
      isLastPage,
      savedImagesData,
      nsfwMode,
      nsfwLevel,
      uid,
      setErrorMessage,
      dispatch,
      collectionData?.id,
    ]
  );

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !errorMessage &&
      isOnline &&
      !examplesIsLoading &&
      savedImagesData?.length
    ) {
      getImagesFromFirestore(savedImagesData);
    }
  }, [
    isIntersecting,
    isLastPage,
    getImagesFromFirestore,
    errorMessage,
    examplesIsLoading,
    isOnline,
    savedImagesData,
  ]);

  const postsHtml = examplesImgData.flatMap((item, i) => {
    const postData = collectionData.posts.find(
      (post) => post.postId === item[0].postId
    );

    return (
      <Carousel
        key={i}
        versionId={null}
        imagesData={item}
        visibleImgAmount={1}
        saved={true}
        postId={item[0].postId}
        showInView={true}
        location="collections"
        locationId={collectionData.id}
        curPostData={postData}
      />
    );
  });

  return (
    <>
      {!!examplesImgData?.length && postsHtml}
      {examplesIsLoading && <Spinner />}
      {errorMessage && isOnline && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!examplesIsLoading && !examplesImgData.length && !errorMessage && (
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
            at the top left corner of the image or use "Add image by ID" button
            to add it to your collection.
          </span>
        </motion.div>
      )}
      <div ref={endPageRef}></div>
    </>
  );
});

export default CollectionImages;
