import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import classes from "./ExternalImages.module.scss";
import Carousel from "../../../carousel/Carousel";
import { useOnlineStatus } from "../../../../hooks/use-online-status";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  EXAMPLE_MODEL_FILTER_CIV,
  EXAMPLE_MODEL_FILTER_LVL,
  EXAMPLE_MODEL_ID,
  SETTINGS_IMAGES_NUMBER_PER_REQUEST,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
} from "../../../../variables/constants";
import useIntersection from "../../../../hooks/use-intersection";
import Spinner from "../../../ui/Spinner";
import ErrorMessage from "../../../ui/ErrorMessage";
import Buttton from "../../../ui/Button";
import useFetchCivitai from "../../../../hooks/use-fetch-civitai";
import {
  filterNsfwImages,
  groupAndSortByField,
} from "../../../../utils/imageUtils";
import { fixCivImagesMeta } from "../../../../utils/tempUtils";

const ExternalImages = memo(({ modelId, curImagesModelVersionId, sortBy }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const savedImages = useSelector((state) => state.model.savedImages);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const endPageRef = useRef(null);
  const isOnline = useOnlineStatus();
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`
  );

  const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
    curImagesModelVersionId !== "all-versions"
      ? `&modelVersionId=${curImagesModelVersionId}`
      : ""
  }${
    SETTINGS_IMAGES_NUMBER_PER_REQUEST
      ? `&limit=${SETTINGS_IMAGES_NUMBER_PER_REQUEST}`
      : ""
  }${sortBy ? `&sort=${sortBy}` : ""}${`&nsfw=${nsfwLevel}`}`;
  const {
    fetchedData: fetchedImages,
    isFetching: imagesIsLoading,
    setFetchedData: setFetchedImages,
    isLastPage,
    errorMessage,
    fetchCivitai,
    setErrorMessage,
  } = useFetchCivitai(url);

  const imagesSortedByPost = useMemo(() => {
    let images = fixCivImagesMeta(fetchedImages);

    if (EXAMPLE_MODEL_FILTER_CIV && modelId === EXAMPLE_MODEL_ID) {
      images = filterNsfwImages(images, EXAMPLE_MODEL_FILTER_LVL);
    }

    return groupAndSortByField(images, "postId", "createdAt");
  }, [fetchedImages, modelId]);

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall, curImagesModelVersionId, nsfwLevel]);

  const deleteImagesHandler = (ids) => {
    setFetchedImages((prevState) =>
      prevState.filter((image) => !ids.includes(image.id))
    );
  };

  useEffect(() => {
    if (
      modelId &&
      curImagesModelVersionId &&
      !isLastPage &&
      isIntersecting &&
      !errorMessage &&
      isOnline &&
      !imagesIsLoading
    ) {
      fetchCivitai(setIsIntersecting);
    }
  }, [
    isIntersecting,
    isLastPage,
    curImagesModelVersionId,
    errorMessage,
    imagesIsLoading,
    modelId,
    isOnline,
    fetchCivitai,
  ]);

  const retryImageLoadingHandler = () => {
    setErrorMessage("");
    fetchCivitai();
  };

  const imagesHtml = imagesSortedByPost.map((item, i) => {
    const existedImages =
      savedImages?.data &&
      Object.hasOwn(savedImages.data, curImagesModelVersionId) &&
      savedImages.data[`${curImagesModelVersionId}`]?.find(
        (img) => img?.postId === +item[0]?.postId
      );
    const postId = item[0]?.postId;

    return (
      <Carousel
        key={i}
        imagesData={item}
        visibleImgAmount={1}
        existedImgsAmount={existedImages?.imagesId?.length || null}
        postId={postId}
        saved={!postId}
        modelId={modelId}
        versionId={curImagesModelVersionId}
        showInView={true}
        location="models"
        locationId={modelId}
        onDelete={deleteImagesHandler}
      />
    );
  });

  return (
    <>
      {imagesHtml}
      <div className={classes["status"]}>
        {errorMessage && isOnline && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        {!imagesIsLoading && (
          <div>
            {errorMessage && (
              <Buttton
                className={classes["btn-more"]}
                onClick={retryImageLoadingHandler}
              >
                Retry
              </Buttton>
            )}
          </div>
        )}
        {!imagesIsLoading && !isLastPage && !errorMessage && (
          <div>
            <Buttton
              className={classes["btn-more"]}
              onClick={() => {
                fetchCivitai();
              }}
            >
              Load more
            </Buttton>
          </div>
        )}
        {!imagesIsLoading && !imagesHtml.length && !errorMessage && (
          <motion.div
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            className={classes["notification"]}
          >
            <ExclamationCircleIcon className={classes["notification__svg"]} />
            <span>No images found.</span>
          </motion.div>
        )}
        {imagesIsLoading && <Spinner />}
        <div ref={endPageRef}></div>
      </div>
    </>
  );
});

export default ExternalImages;
