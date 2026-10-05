import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import classes from "./CarouselContent.module.scss";
import { uploadActions } from "../../../store/upload";
import { modelActions } from "../../../store/model";
import { deleteImgPost } from "../../../store/modelThunks";
import Modal from "../../ui/Modal";
import ChooseImageForm from "../../forms/choose-image-form/ChooseImageForm";
import ImageFullView from "../../ui/ImageFullView";
import { ERROR_MESSAGE_DEFAULT } from "../../../variables/constants";
import SaveToCollectionForm from "../../forms/save-to-collection-form/SaveToCollectionForm";
import { updateCollectionPostsData } from "../../../store/imagesThunks";
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

import useCarouselNavigation from "../../../hooks/use-carousel-navigation";

export type CarouselContentProps = {
  imagesData: Image[];
  visibleImgAmount?: number;
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
  location?: ResourceFirestoreCollection;
  locationId?: number | null;
  curPostData?: PostSavedData;
  menu?: boolean;
};

export type CarouselImageFormState = {
  isOpen: boolean;
  location: ResourceFirestoreCollection | null;
  type: "save" | "del";
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
 * @param props
 * @param props.imagesData - List of post images.
 * @param props.visibleImgAmount - Number of images visible at the same time. If omitted, calculated automatically.
 * @param props.postId - Post ID.
 * @param props.onDelete - Callback triggered when images are deleted.
 * @param props.modelId - Model ID.
 * @param props.versionId - Model version ID.
 * @param props.existedImgsAmount - Number of images already saved for the current model.
 * @param props.saved - Whether the images were loaded from the application database.
 * @param props.activeImgNum - Index of the currently active carousel image.
 * @param props.active - Whether the carousel is currently open.
 * @param props.onActiveNumChange - Callback triggered when the active image changes.
 * @param props.side - Whether the carousel is opened from the sidebar.
 * @param props.imageHeight - Carousel image height.
 * @param props.imageWidth - Carousel image width.
 * @param props.location - Firestore collection name where images belong.
 * @param props.locationId - Firestore document ID of the current model or collection.
 * @param props.curPostData - Metadata of the current post.
 *
 * @returns Carousel content.
 */
const CarouselContent = ({
  imagesData,
  visibleImgAmount = 0,
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
  menu,
}: CarouselContentProps) => {
  const [imageFormState, setImageFormState] =
    useState<CarouselImageFormState | null>(null);
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    refs: { carouselRef, imagesRef },
    slides: {
      visibleAmount, currImgNum, visibleImages, translate, curTransitionDur,
      carouselWidth, showNavigation, hasMultipleImages,
    },
    actions: { next: slideNextHandler, previous: slidePrevHandler, goTo: scrollToImageHandler },
    gestures: { onStart: mouseDownHandler, onMove: moveElement, onEnd: mouseUp },
  } = useCarouselNavigation({
    imagesData, visibleImgAmount, activeImgNum, fullViewIsOpen, onActiveNumChange,
  });
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const modelName = useAppSelector((state) => state.model.model?.name);
  const savedImages = useAppSelector((state) => state.model.savedImages);
  const dispatch = useAppDispatch();

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
        menu,
      }),
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
      imgType: imagesForSaving[0].type || "image",
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
        imgType: imagesData[0].type || "image",
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

  const showImageSelectionForm =
    imageFormState?.location === "models" || imageFormState?.type === "del";
  const showCollectionSaveForm =
    imageFormState?.location === "collections" && imageFormState.type !== "del";

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
        menu={menu}
      />
      {showNavigation && (
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
      {showNavigation && (
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
      {hasMultipleImages && (
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
            controls={hasMultipleImages}
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
            {showImageSelectionForm && (
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
            {showCollectionSaveForm && (
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
