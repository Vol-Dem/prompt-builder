import { memo, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import classes from "./CollectionImages.module.scss";
import Carousel from "../../carousel/Carousel";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
} from "../../../variables/constants";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import FolderSvg from "../../../assets/FolderSvg";
import useIntersection from "../../../hooks/use-intersection";
import { getColectionImagesByIds } from "../../../store/images";

const CollectionImages = memo(() => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [imagesIsLoading, setImagesIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const savedImagesData = useSelector(
    (state) => state.images.collectionData
  )?.posts?.toSorted((a, b) => b.createdAt - a.createdAt);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const collectionData = useSelector((state) => state.images.collectionData);
  const collectionImages = useSelector(
    (state) => state.images.collectionImages
  );
  const imageData = collectionImages?.images;
  const isLastPage = !!collectionImages?.isLastPage;
  const endPageRef = useRef(null);
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`
  );
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall, nsfwLevel]);

  useEffect(() => {
    const getImagesFromFirestore = async (posts, collectionId) => {
      try {
        setImagesIsLoading(true);

        await dispatch(getColectionImagesByIds(posts, collectionId));
      } catch (err) {
        setErrorMessage(err);
      } finally {
        setIsIntersecting(false);
        setImagesIsLoading(false);
      }
    };

    if (
      !isLastPage &&
      isIntersecting &&
      !errorMessage &&
      isOnline &&
      !imagesIsLoading &&
      savedImagesData?.length
    ) {
      getImagesFromFirestore(savedImagesData, collectionData?.id);
    }
  }, [
    isIntersecting,
    isLastPage,
    errorMessage,
    imagesIsLoading,
    isOnline,
    savedImagesData,
    collectionData?.id,
    dispatch,
  ]);

  const postsHtml = imageData?.flatMap((item, i) => {
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
      {!!imageData?.length && postsHtml}
      {imagesIsLoading && <Spinner />}
      {errorMessage && isOnline && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!imagesIsLoading && !imageData?.length && !errorMessage && (
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
