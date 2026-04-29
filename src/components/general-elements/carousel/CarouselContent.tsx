import {
  useCallback,
  useLayoutEffect,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import classes from "./CarouselContent.module.scss";
import { uploadActions } from "../../../store/upload";
import { deleteImgPost, modelActions } from "../../../store/model";
import Modal from "../../ui/Modal";
import ChooseImageForm from "../../forms/choose-image-form/ChooseImageForm";
import ImageFullView from "../../ui/ImageFullView";
import {
  ERROR_MESSAGE_DEFAULT,
  SETTINGS_CAROUSEL_TRANSITION_DURATION,
} from "../../../variables/constants";
import SaveToCollectionForm from "../../forms/save-to-collection-form/SaveToCollectionForm";
import { updateCollectionPostsData } from "../../../store/images";
import CarouselPagination from "./carousel-pagination/CarouselPagination";
import CarouselSave from "./carousel-save/CarouselSave";
import CarouselImages from "./carousel-images/CarouselImages";
import { updateImagePostData } from "../../../utils/fetch/fetchImages";
import type { Image } from "../../../../shared/types/image";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { PostSavedData } from "../../../types/collections.types";
import type { ResourceFirestoreCollection } from "../../../types/models.types";
import type {
  UploadingCollectionData,
  UploadingPostData,
} from "../../../types/upload.types";
import {
  AppError,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";

export type CarouselContentProps = {
  imagesData: Image[];
  visibleImgAmount: number;
  postId: number;
  onDelete?: (ids: number[] | null, postId: number) => void;
  modelId?: number | null;
  versionId: number | null;
  existedImgsAmount?: number | null;
  activeImgNum?: number;
  saved: boolean;
  active?: boolean;
  onActiveNumChange?: (activeImage: number) => void;
  side?: boolean;
  imageHeight?: number;
  imageWidth?: number;
  location: ResourceFirestoreCollection;
  locationId: number | null;
  curPostData?: PostSavedData;
};

export type CarouselImageFormState = {
  isOpen: boolean;
  location: ResourceFirestoreCollection | null;
  type: "save" | "del";
};

type CarouselImageDementions = {
  gap: number;
  imgWidth: number;
  imgWidthWithGap: number;
  wrapWidth: number;
  isOpen?: boolean;
};

/**
 * Carousel content component.
 *
 * Renders an animated infinite carousel with controls and pagination.
 * Supports a fixed or auto-calculated number of visible images and touch gestures.
 * Tracks slide transitions and handles slide-change animations.
 * Tracks which carousel items are currently visible and passes this information
 * to `CarouselImages` so only visible images receive a valid `src`.
 *
 * Behavior:
 * - Opens the carousel when clicked.
 * - When rendered inside the ActiveCarousel component, clicking opens a full-screen image instead.
 * - Displays save/delete controls for post images.
 * - Shows how many images from the current post are already saved when used on a model page.
 * - Renders "Save" and "Show all images" action buttons.
 *
 * Responsibilities:
 * - Manages carousel state and animations.
 * - Handles touch swipe navigation.
 * - Triggers save and delete flows for images.
 *
 * Optimization:
 * - Prevents repeated network requests by ensuring each image is loaded only once.
 * - Loads duplicated edge images at the same time as originals to avoid animation
 *   flickering and double loading.
 *
 * @component
 *
 * @param {object} props
 * @param {any} props.imagesData - List of post images.
 * @param {number} [props.visibleImgAmount] - Number of images visible at the same time. If omitted, calculated automatically.
 * @param {number} props.postId - Post ID.
 * @param {(ids: number[], postId: number) => void} props.onDelete - Callback triggered when images are deleted.
 * @param {number} [props.modelId] - Model ID.
 * @param {number} [props.versionId] - Model version ID.
 * @param {number} [props.existedImgsAmount] - Number of images already saved for the current model.
 * @param {boolean} props.saved - Whether the images were loaded from the application database.
 * @param {number} props.activeImgNum - Index of the currently active carousel image.
 * @param {boolean} props.active - Whether the carousel is currently open.
 * @param {(curImgIndex: number) => void} props.onActiveNumChange - Callback triggered when the active image changes.
 * @param {boolean} props.side - Whether the carousel is opened from the sidebar.
 * @param {number} props.imageHeight - Carousel image height.
 * @param {number} props.imageWidth - Carousel image width.
 * @param {'models' | 'collections'} props.location - Firestore collection name where images belong.
 * @param {number} props.locationId - Firestore document ID of the current model or collection.
 * @param {object} props.curPostData - Metadata of the current post.
 *
 * @returns {JSX.Element} Carousel content.
 */
const CarouselContent = ({
  imagesData,
  visibleImgAmount,
  postId,
  onDelete,
  modelId,
  versionId,
  existedImgsAmount,
  activeImgNum,
  saved,
  active,
  onActiveNumChange,
  side,
  imageHeight,
  imageWidth,
  location,
  locationId,
  curPostData,
}: CarouselContentProps) => {
  const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount || 0);
  const [initial, setInitial] = useState(true);
  const [imageFormState, setImageFormState] =
    useState<CarouselImageFormState | null>(null);
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState(0);
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
  const [dimensions, setDimensions] = useState<CarouselImageDementions | null>(
    null,
  );
  const [cursorInitialX, setCursorInitialX] = useState<number | null>(null);
  const [cursorCurX, setCursorCurX] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const modelName = useAppSelector((state) => state.model.model?.name);
  const savedImages = useAppSelector((state) => state.model.savedImages);
  const dispatch = useAppDispatch();

  let carouselWidth: number | null = null;

  if (dimensions) {
    carouselWidth = !curVisibleAmount
      ? dimensions.imgWidth
      : dimensions.imgWidthWithGap * curVisibleAmount - dimensions.gap;
  }

  let postData = null;

  if (
    savedImages?.data &&
    !!Object.keys(savedImages?.data)?.length &&
    versionId
  ) {
    postData =
      savedImages.data[versionId]?.find((post) => post.postId === postId) ||
      null;
  }

  useLayoutEffect(() => {
    if (!imagesRef.current || !carouselRef.current) return;
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    const imgWidth = imagesRef.current.children[0].clientWidth;
    const imgWidthWithGap = imgWidth + gap;
    const wrapWidth = carouselRef.current.clientWidth;

    setDimensions((prevState) => {
      return {
        ...prevState,
        wrapWidth,
        imgWidth,
        gap,
        imgWidthWithGap,
      };
    });
  }, [imagesRef, carouselRef]);

  const openDeleteListHandler = () => {
    setImageFormState({
      type: "del",
      location: location || null,
      isOpen: true,
    });
  };

  const openFullViewHandler = () => {
    setFullViewIsOpen(true);
  };

  const openCarouselHandler = (position: number | null) => {
    let currImgNum: number | null = null;
    let imgNum: number | null = null;

    if (position) {
      imgNum = +position - visibleAmount;
    }

    if (imgNum || imgNum === 0) {
      currImgNum = imgNum >= 0 ? imgNum : imagesData?.length + imgNum;
    }

    dispatch(
      modelActions.setActiveCarouselData({
        images: imagesData,
        visibleImgAmount,
        postId,
        modelId: modelId || null,
        saved,
        versionId,
        existedImgsAmount,
        currImgNum: currImgNum,
        location,
        locationId,
      }),
    );
  };

  useEffect(() => {
    const curVisibleImgAmount =
      dimensions &&
      Math.floor(dimensions.wrapWidth / dimensions.imgWidthWithGap);
    let visibleImagesAmount = visibleImgAmount;

    if (
      !visibleImgAmount &&
      curVisibleImgAmount &&
      curVisibleImgAmount <= imagesData?.length
    ) {
      visibleImagesAmount = curVisibleImgAmount;
    } else if (
      !visibleImgAmount &&
      curVisibleImgAmount &&
      curVisibleImgAmount > imagesData?.length
    ) {
      visibleImagesAmount = imagesData?.length;
    }

    const initialVisibleImages = Array.from(
      { length: visibleImagesAmount },
      (_, i) => visibleImagesAmount + i,
    );

    setVisibleAmount(visibleImagesAmount);
    setCurVisibleAmount(visibleImagesAmount);

    if (
      initial &&
      activeImgNum &&
      !!visibleImgAmount &&
      dimensions?.imgWidthWithGap
    ) {
      setCurrImgNum(activeImgNum);
      setVisibleImages(
        initialVisibleImages.map((_, j) => activeImgNum + j + visibleImgAmount),
      );
      setTranslate(-dimensions.imgWidthWithGap * (activeImgNum + 1) || 0);
    } else if (initial && !activeImgNum && dimensions?.imgWidthWithGap) {
      setInitial(false);
      setVisibleImages(initialVisibleImages);
      setTranslate(-dimensions.imgWidthWithGap * initialVisibleImages[0] || 0);
    }
  }, [dimensions, visibleImgAmount, imagesData, activeImgNum, initial]);

  const transitionStartHandler = useCallback(() => {
    setTransitionEnd(false);
  }, []);

  const transitionEndHandler = useCallback(() => {
    setTransitionEnd(true);
    document.removeEventListener("transitionstart", transitionStartHandler);
    document.removeEventListener("transitionend", transitionEndHandler);
    if (!imagesRef?.current || !dimensions) return;

    if (visibleImages[0] === 0) {
      setCurTransitionDur(0);
      setVisibleImages((prevState) =>
        prevState.map((_, i) => imagesData?.length + i),
      );
      setTranslate(-dimensions.imgWidthWithGap * imagesData?.length);
    }
    if (visibleImages[0] === imagesData?.length + curVisibleAmount) {
      setCurTransitionDur(0);
      setVisibleImages((prevState) =>
        prevState.map((_, i) => curVisibleAmount + i),
      );
      setTranslate(-dimensions.imgWidthWithGap * curVisibleAmount);
    }
    if (visibleImages[0] > imagesData?.length + curVisibleAmount) {
      setCurTransitionDur(0);
      setVisibleImages((prevState) =>
        prevState.map(() => visibleImages[0] - imagesData?.length),
      );
    }
  }, [
    curVisibleAmount,
    visibleImages,
    imagesData,
    dimensions?.imgWidthWithGap,
    transitionStartHandler,
  ]);

  useEffect(() => {
    if (imagesData?.length > curVisibleAmount) {
      setTransitionEnd(true);
      document.removeEventListener("transitionstart", transitionStartHandler);
      document.removeEventListener("transitionend", transitionEndHandler);
      document.addEventListener("transitionstart", transitionStartHandler);
      document.addEventListener("transitionend", transitionEndHandler);
    }

    return () => {
      document.removeEventListener("transitionstart", transitionStartHandler);
      document.removeEventListener("transitionend", transitionEndHandler);
    };
  }, [
    curVisibleAmount,
    imagesData,
    transitionStartHandler,
    transitionEndHandler,
  ]);

  const slideNextHandler = () => {
    if (!transitionEnd || imagesData.length <= 1 || !dimensions) return;
    setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
    const curImg = visibleImages[0] + 1;
    setVisibleImages((prevState) => prevState.map((el) => el + 1));
    setTranslate(-dimensions.imgWidthWithGap * curImg);
    let imgNum = visibleImages[0] + 1 - visibleAmount;
    if (imgNum > imagesData?.length - 1) imgNum = 0;
    const activeImage = imgNum >= 0 ? imgNum : imagesData?.length + imgNum;
    setCurrImgNum(activeImage);
    if (!!onActiveNumChange && !fullViewIsOpen) {
      onActiveNumChange(activeImage);
    }
  };

  const slidePrevHandler = () => {
    if (!transitionEnd || imagesData.length <= 1 || !dimensions) return;
    setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
    const curImg = visibleImages[0] - 1;
    setVisibleImages((prevState) => prevState.map((el) => el - 1));
    setTranslate(-dimensions.imgWidthWithGap * curImg);
    const imgNum = visibleImages[0] - 1 - visibleAmount;
    const activeImage = imgNum >= 0 ? imgNum : imagesData?.length + imgNum;
    setCurrImgNum(activeImage);
    if (!!onActiveNumChange && !fullViewIsOpen) {
      onActiveNumChange(activeImage);
    }
  };

  const scrollToImageHandler = (curImgIndex: number) => {
    setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
    setCurrImgNum(curImgIndex);

    if (onActiveNumChange) {
      onActiveNumChange(curImgIndex);
    }
    setVisibleImages((prevState) => {
      const newVisibleImages = prevState.map(
        (_, j) => curImgIndex + j + visibleAmount,
      );
      return newVisibleImages;
    });
    setTranslate(
      dimensions ? -dimensions.imgWidthWithGap * (curImgIndex + 1) : 0,
    );
  };

  const saveExampleHandler = async (
    location: ResourceFirestoreCollection,
    ids: number[] | null,
    collectionData: UploadingCollectionData | null,
    postData?: UploadingPostData | null,
  ) => {
    const imagesForSaving = ids?.length
      ? imagesData.filter((image) => ids.includes(image?.id))
      : imagesData;

    const postInfo = {
      postId,
      modelId: modelId || null,
      location,
      collectionData,
      modelName: modelName,
      versionId: versionId || null,
      nsfwMode,
      postData: postData,
      imgUrl: imagesForSaving[0].url,
      ids: ids || [],
      existedAmount: existedImgsAmount,
      images: imagesForSaving,
    };

    dispatch(uploadActions.addToQueue(postInfo));
    setImageFormState(
      (prevState) => prevState && { ...prevState, isOpen: false },
    );
  };

  const deleteExampleHandler = async (
    location: ResourceFirestoreCollection,
    ids: number[] | null,
    collectionData: UploadingCollectionData | null,
  ) => {
    try {
      const curPostId = imagesData[0].postId;

      if (!curPostId) {
        throw new AppError(ERROR_MESSAGE_DEFAULT);
      }

      setIsDeleting(true);

      const postInfo = {
        postId: curPostId,
        modelId,
        location,
        collectionData,
        modelName: modelName,
        versionId,
        nsfwMode,
        postData: curPostData,
        delete: true,
        imgUrl: imagesData[0].url,
        ids: ids || [],
        existedAmount: existedImgsAmount,
      };

      if (location === "collections" && curPostData) {
        await dispatch(updateCollectionPostsData(ids, curPostData));
      }

      if (location === "models") {
        if (!!ids?.length && ids?.length !== curPostData?.imagesId?.length) {
          const newImages = imagesData.filter(
            (image) => !ids?.includes(image.id),
          );
          const updatedPostData = await updateImagePostData(
            postInfo,
            newImages,
          );

          // setImages(newImages);

          dispatch(
            modelActions.updateSavedImages({ postInfo, data: updatedPostData }),
          );
        } else {
          if (curPostData) dispatch(deleteImgPost(postInfo, curPostData));
        }

        if (postInfo.postId && onDelete) onDelete(ids, postInfo.postId);
      }
      setIsDeleting(false);
      setImageFormState(
        (prevState) => prevState && { ...prevState, isOpen: false },
      );
    } catch (err) {
      handleErrors(normalizeError(err));
      setIsDeleting(false);
    }
  };

  const moveElement = (
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<Element>,
  ) => {
    let clientX: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    setCursorCurX(clientX);
  };

  const mouseDownHandler = (
    e: MouseEvent<HTMLElement> | TouchEvent<Element>,
  ) => {
    let clientX: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    setCursorInitialX(clientX);
  };

  const mouseUp = () => {
    if (!cursorInitialX || !cursorCurX) return;
    const offcet = Math.round(cursorInitialX) - Math.round(cursorCurX);
    setCursorCurX(null);
    setCursorInitialX(null);
    if (!!offcet && offcet > 0 && Math.abs(offcet) > 40) {
      slideNextHandler();
    } else if (!!offcet && offcet < 0 && Math.abs(offcet) > 40) {
      slidePrevHandler();
    }
  };

  return (
    <div
      className={`${classes.carousel}`}
      ref={carouselRef}
      style={
        imageHeight && carouselWidth
          ? {
              height: `${imageHeight}px`,
              maxWidth: `${carouselWidth}px`,
            }
          : {}
      }
      onTouchEnd={mouseUp}
      onTouchStart={mouseDownHandler}
      onTouchMove={moveElement}
    >
      <CarouselImages
        ref={imagesRef}
        visibleAmount={visibleAmount}
        images={imagesData}
        visibleImages={visibleImages}
        versionId={versionId}
        onClick={openCarouselHandler}
        saved={saved}
        active={!!active}
        side={!!side}
        imageWidth={imageWidth}
        location={location}
        locationId={locationId}
        onDelete={openDeleteListHandler}
        translate={translate}
        transitionDur={curTransitionDur}
        onOpen={openFullViewHandler}
      />
      {imagesData?.length > curVisibleAmount && (
        <>
          <button
            type="button"
            className={`${classes.btn} ${classes["btn__left"]}`}
            onClick={slidePrevHandler}
            title="Previous"
          >
            <ChevronLeftIcon />
          </button>

          <button
            type="button"
            className={`${classes.btn} ${classes["btn__right"]}`}
            onClick={slideNextHandler}
            title="Next"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}
      {imagesData?.length > curVisibleAmount && (
        <CarouselPagination
          images={imagesData}
          // currImgIndex={currImgNum}
          visibleAmount={visibleAmount}
          visibleImages={visibleImages}
          onClick={scrollToImageHandler}
        />
      )}
      <CarouselSave
        images={imagesData}
        saved={saved}
        postId={postId}
        existedImgsAmount={existedImgsAmount || null}
        onSave={saveExampleHandler}
        onOpenForm={setImageFormState}
        postData={postData}
      />
      {imagesData?.length > 1 && (
        <button
          className={classes["btn-all"]}
          onClick={() => openCarouselHandler(null)}
          title="Show All Images"
        >
          <Squares2X2Icon />
        </button>
      )}
      <AnimatePresence>
        {fullViewIsOpen && (
          <ImageFullView
            src={imagesData[currImgNum]?.url}
            type={imagesData[currImgNum]?.type}
            onClose={() => {
              setFullViewIsOpen(false);
              if (onActiveNumChange) onActiveNumChange(currImgNum);
            }}
            nextSlide={slideNextHandler}
            prevSlide={slidePrevHandler}
            controls={imagesData?.length > 1}
          ></ImageFullView>
        )}
        {imageFormState?.isOpen && (
          <Modal
            title={
              imageFormState?.location === "collections"
                ? "Save to collection"
                : undefined
            }
            onClose={() => {
              setImageFormState(
                (prevState) =>
                  prevState && {
                    ...prevState,
                    isOpen: false,
                  },
              );
            }}
          >
            {(imageFormState?.location === "models" ||
              imageFormState.type === "del") && (
              <ChooseImageForm
                postData={postData}
                type={imageFormState.type}
                location={imageFormState.location}
                modelId={modelId}
                versionId={versionId}
                images={imagesData}
                activeImageIndex={currImgNum}
                savedImageIds={(postData && postData?.imagesId) || []}
                onSave={
                  imageFormState.type === "save"
                    ? saveExampleHandler
                    : deleteExampleHandler
                }
                isDeleting={isDeleting}
              />
            )}
            {imageFormState?.location === "collections" &&
              imageFormState.type !== "del" && (
                <SaveToCollectionForm
                  postId={postId}
                  images={imagesData}
                  activeImageIndex={currImgNum}
                  onSave={
                    imageFormState.type === "save"
                      ? saveExampleHandler
                      : deleteExampleHandler
                  }
                />
              )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarouselContent;
