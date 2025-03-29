import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import classes from "./ExternalImages.module.scss";
import { useSelector } from "react-redux";
import Carousel from "../../../carousel/Carousel";
import { useOnlineStatus } from "../../../../hooks/use-online-status";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ERROR_MESSAGE_INVALID_DATA,
  SETTINGS_IMAGES_NUMBER_PER_REQUEST,
  SETTINGS_LOAD_MORE_MARGIN,
} from "../../../../variables/constants";
import useIntersection from "../../../../hooks/use-intersection";
import Spinner from "../../../ui/Spinner";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import ErrorMessage from "../../../ui/ErrorMessage";
import Buttton from "../../../ui/Button";
import { motion } from "framer-motion";
import {
  filterDuplicates,
  throwCustomError,
} from "../../../../utils/generalUtils";

const ExternalImages = memo(
  ({
    modelId,
    curImagesModelVersionId,
    sortBy,
    errorMessage,
    setErrorMessage,
  }) => {
    const [examplesIsLoading, setExamplesIsLoading] = useState(false);
    const [isLastPage, setIsLastPage] = useState(false);
    const [examplesImages, setExamplesImages] = useState([]);
    const [currCursor, setCurrCursor] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [examplesImgData, setExamplesImgData] = useState([]);
    const [savedImages, setSavedImages] = useState({});
    const savedImagesInfo = useSelector((state) => state.model.savedImages);
    const nsfwMode = useSelector((state) => state.general.nsfwMode);
    const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
    const endPageRef = useRef(null);
    const abortControlerRef = useRef(null);
    const isIntersecting = useIntersection(
      endPageRef,
      false,
      SETTINGS_LOAD_MORE_MARGIN
    );
    const isOnline = useOnlineStatus();

    const resetExamples = () => {
      setCurrCursor(null);
      setNextCursor(null);
      setExamplesImgData([]);
      setExamplesImages([]);
      setIsLastPage(false);
    };

    useEffect(() => {
      resetExamples();

      return () => {
        resetExamples();
        if (abortControlerRef.current) {
          abortControlerRef.current.abort();
        }
      };
    }, [curImagesModelVersionId, nsfwMode, nsfwLevel]);

    useEffect(() => {
      if (modelId && modelId === savedImagesInfo?.modelId) {
        setSavedImages(savedImagesInfo.data);
      } else {
        setSavedImages({});
      }
    }, [modelId, savedImagesInfo]);

    const sortExampleImages = useCallback(
      (newExampleImages, versionId) => {
        const sortedExamples = {};
        newExampleImages.forEach((image) => {
          if (sortedExamples.hasOwnProperty(image.postId)) {
            sortedExamples[image.postId].push(image);
          } else {
            sortedExamples[image.postId] = [image];
          }
        });

        if (!sortedExamples) return;

        const sortedExamplesArr = Object.keys(sortedExamples).sort((a, b) => {
          return (
            Date.parse(sortedExamples[b].slice(-1).pop().createdAt) -
            Date.parse(sortedExamples[a].slice(-1).pop().createdAt)
          );
        });
        // const sortedExamplesArr = Object.keys(sortedExamples).sort((a, b) => {
        //   return sortedExamples[b][0].postId - sortedExamples[a][0].postId;
        // });

        const examples = sortedExamplesArr.map((key, i) => {
          return sortedExamples[key];
        });

        const sortedExamplesArrWithSortedImgs = examples.map((post) => {
          return post.sort((a, b) => {
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
          });
        });

        if (versionId === curImagesModelVersionId) {
          setExamplesImgData(sortedExamplesArrWithSortedImgs);
        }
      },
      [curImagesModelVersionId]
    );

    const getallExamples = useCallback(
      async (modelId, versionId, cursor) => {
        try {
          setExamplesIsLoading(true);
          if (abortControlerRef.current) {
            abortControlerRef.current.abort();
          }
          const newAbortControler = new AbortController();
          abortControlerRef.current = newAbortControler;

          setErrorMessage("");

          const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
            versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
          }${
            SETTINGS_IMAGES_NUMBER_PER_REQUEST
              ? `&limit=${SETTINGS_IMAGES_NUMBER_PER_REQUEST}`
              : ""
          }${sortBy ? `&sort=${sortBy}` : ""}${
            cursor ? `&cursor=${cursor}` : ""
          }${`&nsfw=${nsfwLevel}`}`;

          const imgExampleResponse = await fetch(url, {
            signal: newAbortControler.signal,
          });
          const data = await imgExampleResponse.json();
          // console.log(data);

          if (!data?.items) {
            throwCustomError(ERROR_MESSAGE_INVALID_DATA);
          }

          // Remove dublicate images (fix for civitai bug)
          const dataUniq = filterDuplicates(data?.items, "id");
          // const dataUniq = data?.items?.filter((obj1, i, arr) => {
          //   if (!!obj1?.id) {
          //     return arr.findIndex((obj2) => obj2?.id === obj1?.id) === i;
          //   } else {
          //     return true;
          //   }
          // });

          setExamplesImages((prevState) => {
            const newExampleImages = [...dataUniq, ...prevState];
            if (versionId === curImagesModelVersionId) {
              sortExampleImages(newExampleImages, versionId);
            }
            return newExampleImages;
          });

          setCurrCursor(nextCursor || true);
          if (data.metadata?.nextCursor) {
            setNextCursor(data.metadata.nextCursor);
          } else {
            setIsLastPage(true);
          }
        } catch (err) {
          if (err.name !== "AbortError") {
            setErrorMessage(
              "Failed to connect to Civitai. There may be maintenance going on at the moment. Try again later."
            );
          }
        } finally {
          setExamplesIsLoading(false);
        }
      },
      [
        sortBy,
        nextCursor,
        curImagesModelVersionId,
        sortExampleImages,
        nsfwLevel,
        setErrorMessage,
      ]
    );

    useEffect(() => {
      if (nextCursor && currCursor === nextCursor) return;

      if (
        modelId &&
        !isLastPage &&
        isIntersecting &&
        !errorMessage &&
        isOnline &&
        !examplesIsLoading
      ) {
        setExamplesIsLoading(true);
        getallExamples(modelId, curImagesModelVersionId, nextCursor);
      }
    }, [
      isIntersecting,
      isLastPage,
      curImagesModelVersionId,
      errorMessage,
      examplesIsLoading,
      getallExamples,
      modelId,
      nextCursor,
      currCursor,
      isOnline,
    ]);

    const retryImageLoadingHandler = () => {
      setErrorMessage("");
      getallExamples(modelId, curImagesModelVersionId, nextCursor);
    };

    const examplesHtml = examplesImgData.map((item, i) => {
      const existedExample =
        savedImages?.hasOwnProperty(curImagesModelVersionId) &&
        savedImages[`${curImagesModelVersionId}`]?.find(
          (img) => img?.postId === +item[0]?.postId
        );
      const postId = item[0]?.postId;
      // const postId =
      //   existedExample && existedExample?.imagesId?.length >= item.length
      //     ? ""
      //     : item[0]?.postId;

      return (
        <Carousel
          key={i}
          imagesData={item}
          visibleImgAmount={1}
          existedImgsAmount={existedExample?.imagesId?.length || null}
          postId={postId}
          saved={!postId}
          modelId={modelId}
          versionId={curImagesModelVersionId}
          showInView={true}
          location="models"
          locationId={modelId}
        />
      );
    });

    return (
      <>
        {examplesHtml}
        <div className={classes["status"]}>
          {errorMessage && isOnline && (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          )}
          {!examplesIsLoading && (
            <div>
              {errorMessage && !!nextCursor && (
                <Buttton onClick={retryImageLoadingHandler}>Retry</Buttton>
              )}
            </div>
          )}
          {!examplesIsLoading && !examplesHtml.length && !errorMessage && (
            <motion.div
              initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
              animate={ANIMATIONS_FM_SLIDEIN}
              className={classes["notification"]}
            >
              <ExclamationCircleIcon className={classes["notification__svg"]} />
              <span>No images found.</span>
            </motion.div>
          )}
          {examplesIsLoading && <Spinner />}
          <div ref={endPageRef}></div>
        </div>
      </>
    );
  }
);

export default ExternalImages;
