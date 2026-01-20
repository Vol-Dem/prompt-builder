import { memo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import classes from "./SavedImages.module.scss";
import Carousel from "../../../general-elements/carousel/Carousel";
import Spinner from "../../../ui/Spinner";
import ErrorMessage from "../../../ui/ErrorMessage";
import { useOnlineStatus } from "../../../../hooks/use-online-status";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_LOAD_MORE_MARGIN,
} from "../../../../variables/constants";
import ExclamationCircleSvg from "../../../../assets/ExclamationCircleSvg";
import FolderSvg from "../../../../assets/FolderSvg";
import useIntersection from "../../../../hooks/use-intersection";
import useFetchFirestoreImages from "../../../../hooks/use-fetch-firestore-images";

/**
 * Displays all saved images belonging to the active model version with infinite scroll support.
 * Handles image deletion.
 *
 * Uses intersection observers to detect when more images should be loaded.
 *
 * Fetches images in pages from Firestore, handles loading and error states, and
 * displays a guidance message when the model is empty.
 *
 * The component is memoized to avoid unnecessary re-renders when collection state
 * does not change.
 *
 * @component
 * 
 * @param {object} props
 * @param {number} props.versionId - Model version ID.
 *
 * @returns {JSX.Element} List of model images with infinite scroll behavior.
 */
const SavedImages = memo(({ versionId }) => {
  const model = useSelector((state) => state.model.model);
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const curVersion = useSelector((state) => state.model.curVersion);
  const endPageRef = useRef(null);
  const isIntersecting = useIntersection(
    endPageRef,
    false,
    SETTINGS_LOAD_MORE_MARGIN
  );
  const isOnline = useOnlineStatus();
  const {
    fetchedData: imageData,
    setFetchedData: setImageData,
    fetchFirestoreData: getImagesFromFirestore,
    isFetching: imagesIsLoading,
    isLastPage,
    errorMessage,
  } = useFetchFirestoreImages(versionId);

  const deleteImageHandler = (ids, postId) => {
    setImageData((prevState) => {
      const updatedImages = [...prevState];
      const updatedPostIndex = updatedImages.findIndex(
        (post) => post[0].postId === postId
      );
      const updatedPostData = updatedImages[updatedPostIndex].filter(
        (image) => !ids?.includes(image.id)
      );

      if (!updatedPostData.length || ids === null) {
        updatedImages.splice(updatedPostIndex, 1);
      } else {
        updatedImages.splice(updatedPostIndex, 1, updatedPostData);
      }

      return updatedImages;
    });
  };

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !errorMessage &&
      isOnline &&
      !imagesIsLoading
    ) {
      getImagesFromFirestore();
    }
  }, [
    isIntersecting,
    isLastPage,
    getImagesFromFirestore,
    errorMessage,
    imagesIsLoading,
    isOnline,
  ]);

  const imagesHtml = imageData.flatMap((item, i) => {
    const postData = savedImagesData?.data[curVersion.id]?.find(
      (post) => post.postId === item[0].postId
    );

    return (
      <Carousel
        key={i}
        versionId={versionId}
        imagesData={item}
        postId={item[0].postId}
        visibleImgAmount={1}
        modelId={model.id}
        saved={true}
        showInView={true}
        location="models"
        locationId={model.id}
        curPostData={postData}
        onDelete={deleteImageHandler}
      />
    );
  });

  return (
    <>
      {imagesHtml}
      {imagesIsLoading && <Spinner />}
      {errorMessage && isOnline && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!imagesIsLoading && !imagesHtml.length && !errorMessage && (
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
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <div ref={endPageRef}></div>
    </>
  );
});

export default SavedImages;
