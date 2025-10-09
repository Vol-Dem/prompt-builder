import { useCallback, useLayoutEffect, useState } from "react";
import classes from "./CarouselContent.module.scss";
import { useRef } from "react";
import { useEffect } from "react";
import { updateImagePostData } from "../../utils/fetchUtils";
import { useDispatch, useSelector } from "react-redux";
import { uploadActions } from "../../store/upload";
import { deleteImgPost, modelActions } from "../../store/model";
import Modal from "../ui/Modal";
import ChooseImageForm from "../forms/choose-image-form/ChooseImageForm";
import ImageFullView from "../ui/ImageFullView";
import { AnimatePresence } from "framer-motion";
import { SETTINGS_CAROUSEL_TRANSITION_DURATION } from "../../variables/constants";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import SaveToCollectionForm from "../forms/save-to-collection-form/SaveToCollectionForm";
import { updateCollectionPostsData } from "../../store/images";
import CarouselPagination from "./carousel-pagination/CarouselPagination";
import CarouselSave from "./carousel-save/CarouselSave";
import CarouselImages from "./carousel-images/CarouselImages";

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
}) => {
  const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount || 0);
  const [initial, setInitial] = useState(true);
  const [images, setImages] = useState(imagesData);
  const [imageFormState, setImageFormState] = useState({});
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState(0);
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [visibleImages, setVisibleImages] = useState([]);
  const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
  const [dimensions, setDimensions] = useState({});
  const [cursorInitialX, setCursorInitialX] = useState(null);
  const [cursorCurX, setCursorCurX] = useState(null);
  const carouselRef = useRef();
  const imagesRef = useRef();
  const wrapRef = carouselRef;
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const modelName = useSelector((state) => state.model.model.name);
  const savedImages = useSelector((state) => state.model.savedImages);
  const dispatch = useDispatch();

  const carouselWidth = !curVisibleAmount
    ? dimensions.imgWidth
    : dimensions.imgWidthWithGap * curVisibleAmount - dimensions.gap;

  const postData =
    !!Object.keys(savedImages?.data)?.length &&
    savedImages.data[versionId]?.find((post) => post.postId === postId);

  useEffect(() => {
    setImages(imagesData);
  }, [imagesData]);

  useLayoutEffect(() => {
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    const imgWidth = imagesRef.current.children[0].clientWidth;
    const imgWidthWithGap = imgWidth + gap;
    const wrapWidth = wrapRef.current.clientWidth;

    setDimensions((prevState) => {
      return {
        ...prevState,
        wrapWidth,
        imgWidth,
        gap,
        imgWidthWithGap,
      };
    });
  }, [imagesRef, wrapRef]);

  const openDeleteListHandler = (e) => {
    setImageFormState({
      type: "del",
      location: location || null,
      isOpen: true,
    });
  };

  const openFullViewHandler = () => {
    setFullViewIsOpen(true);
  };

  const openCarouselHandler = (position) => {
    let currImgNum;
    const imgNum = +position - visibleAmount;
    if (imgNum || imgNum === 0) {
      currImgNum = imgNum >= 0 ? imgNum : images?.length + imgNum;
    } else {
      currImgNum = null;
    }

    dispatch(
      modelActions.setActiveCarouselData({
        images,
        visibleImgAmount,
        postId,
        modelId,
        saved,
        versionId,
        existedImgsAmount,
        currImgNum: currImgNum,
        location,
        locationId,
      })
    );
  };

  useEffect(() => {
    const curVisibleImgAmount = Math.floor(
      dimensions.wrapWidth / dimensions.imgWidthWithGap
    );
    if (!visibleImgAmount && curVisibleImgAmount <= images?.length) {
      setVisibleAmount(curVisibleImgAmount);
      setCurVisibleAmount(curVisibleImgAmount);
      setTranslate(0);
      setInitial(true);
    }
    if (!visibleImgAmount && curVisibleImgAmount > images?.length) {
      setVisibleAmount(images?.length);
      setCurVisibleAmount(images?.length);
      setTranslate(0);
      setInitial(true);
    }
  }, [dimensions, visibleImgAmount, images]);

  useEffect(() => {
    if (initial && !!images?.length && !!visibleAmount) {
      const visibleImg = Array.from(
        { length: visibleAmount },
        (_, i) => visibleAmount + i
      );
      setVisibleImages(visibleImg);
      setTranslate(0);
      setCurTransitionDur(0);
      setInitial(false);
    }
  }, [visibleAmount, images, initial]);

  useEffect(() => {
    if (images?.length > curVisibleAmount) {
      setTranslate(-dimensions.imgWidthWithGap * visibleImages[0] || 0);
    }
  }, [dimensions.imgWidthWithGap, curVisibleAmount, visibleImages, images]);

  const transitionStartHandler = useCallback(() => {
    setTransitionEnd(false);
  }, []);

  const transitionEndHandler = useCallback(() => {
    setTransitionEnd(true);
    document.removeEventListener("transitionstart", transitionStartHandler);
    document.removeEventListener("transitionend", transitionEndHandler);
    if (!imagesRef?.current) return;

    if (visibleImages[0] === 0) {
      setCurTransitionDur(0);
      setVisibleImages((prevState) =>
        prevState.map((el, i) => images?.length + i)
      );
      setTranslate(-dimensions.imgWidthWithGap * images?.length);
    }
    if (visibleImages[0] === images?.length + curVisibleAmount) {
      setCurTransitionDur(0);
      setVisibleImages((prevState) =>
        prevState.map((el, i) => curVisibleAmount + i)
      );
      setTranslate(-dimensions.imgWidthWithGap * curVisibleAmount);
    }
    if (visibleImages[0] > images?.length + curVisibleAmount) {
      setCurTransitionDur(0);
      setVisibleImages((prevState) =>
        prevState.map((el, i) => visibleImages[0] - images?.length)
      );
    }
  }, [
    curVisibleAmount,
    visibleImages,
    images,
    dimensions.imgWidthWithGap,
    transitionStartHandler,
  ]);

  useEffect(() => {
    if (images?.length > curVisibleAmount) {
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
  }, [curVisibleAmount, images, transitionStartHandler, transitionEndHandler]);

  const slideNextHandler = () => {
    if (!transitionEnd || images.length <= 1) return;
    setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
    const curImg = visibleImages[0] + 1;
    setVisibleImages((prevState) => prevState.map((el) => el + 1));
    setTranslate(-dimensions.imgWidthWithGap * curImg);
    let imgNum = visibleImages[0] + 1 - visibleAmount;
    if (imgNum > images?.length - 1) imgNum = 0;
    const activeImage = imgNum >= 0 ? imgNum : images?.length + imgNum;
    setCurrImgNum(activeImage);
    if (!!onActiveNumChange && !fullViewIsOpen) {
      onActiveNumChange(activeImage);
    }
  };

  const slidePrevHandler = () => {
    if (!transitionEnd || images.length <= 1) return;
    setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
    const curImg = visibleImages[0] - 1;
    setVisibleImages((prevState) => prevState.map((el) => el - 1));
    setTranslate(-dimensions.imgWidthWithGap * curImg);
    const imgNum = visibleImages[0] - 1 - visibleAmount;
    const activeImage = imgNum >= 0 ? imgNum : images?.length + imgNum;
    setCurrImgNum(activeImage);
    if (!!onActiveNumChange && !fullViewIsOpen) {
      onActiveNumChange(activeImage);
    }
  };

  const scrollToImageHandler = (curImgIndex) => {
    setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
    setCurrImgNum(curImgIndex);
    console.log(curImgIndex);
    if (!!onActiveNumChange) {
      onActiveNumChange(curImgIndex);
    }
    setVisibleImages((prevState) => {
      const newVisibleImages = prevState.map(
        (el, j) => curImgIndex + j + visibleAmount
      );
      return newVisibleImages;
    });
  };

  const saveExampleHandler = async (
    location,
    ids,
    collectionData,
    postData
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
    setImageFormState((prevState) => ({ ...prevState, isOpen: false }));
  };

  const deleteExampleHandler = async (
    location,
    ids,
    collectionData,
    postData
  ) => {
    try {
      const curPostId = images[0].postId;

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
        imgUrl: images[0].url,
        ids: ids || [],
        existedAmount: existedImgsAmount,
      };

      if (location === "collections") {
        await dispatch(updateCollectionPostsData(postInfo, curPostData));
      }

      if (location === "models") {
        if (!!ids?.length && ids?.length !== curPostData?.imagesId?.length) {
          const newImages = images.filter((image) => !ids?.includes(image.id));
          const updatedPostData = await updateImagePostData(
            postInfo,
            newImages
          );

          setImages(newImages);
          dispatch(
            modelActions.updateSavedImages({ postInfo, data: updatedPostData })
          );
        } else {
          dispatch(deleteImgPost(postInfo, curPostData));
        }
      }
      setIsDeleting(false);
      setImageFormState((prevState) => ({ ...prevState, isOpen: false }));
    } catch (err) {
      console.error(err.message);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (activeImgNum && !!visibleAmount) {
      setCurrImgNum(activeImgNum);
      setVisibleImages((prevState) => {
        const newVisibleImages = prevState.map(
          (el, j) => activeImgNum + j + visibleAmount
        );
        return newVisibleImages;
      });
    }
  }, [activeImgNum, visibleAmount]);

  const moveElement = (e) => {
    const clientX = Math.round(e.clientX || e.touches[0].clientX);
    setCursorCurX(clientX);
  };

  const mouseDownHandler = (e) => {
    const clientX = Math.round(e.clientX || e.touches[0].clientX);
    setCursorInitialX(clientX);
  };

  const mouseUp = (e) => {
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
        images={images}
        visibleImages={visibleImages}
        versionId={versionId}
        openCarouselHandler={openCarouselHandler}
        saved={saved}
        active={active}
        side={side}
        imageWidth={imageWidth}
        location={location}
        locationId={locationId}
        openDeleteListHandler={openDeleteListHandler}
        translate={translate}
        curTransitionDur={curTransitionDur}
        openFullViewHandler={openFullViewHandler}
      />
      {images?.length > curVisibleAmount && (
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
      {images?.length > curVisibleAmount && (
        <CarouselPagination
          images={images}
          currImgIndex={currImgNum}
          visibleAmount={visibleAmount}
          visibleImages={visibleImages}
          onClick={scrollToImageHandler}
        />
      )}
      <CarouselSave
        images={images}
        saved={saved}
        postId={postId}
        existedImgsAmount={existedImgsAmount}
        onSave={saveExampleHandler}
        onOpenForm={setImageFormState}
        postData={postData}
      />
      {images?.length > 1 && (
        <button
          className={classes["btn-all"]}
          onClick={openCarouselHandler}
          title="Show All Images"
        >
          <Squares2X2Icon />
        </button>
      )}
      <AnimatePresence>
        {fullViewIsOpen && (
          <ImageFullView
            src={images[currImgNum]?.url}
            type={images[currImgNum]?.type}
            onClose={() => {
              setFullViewIsOpen(false);
              onActiveNumChange(currImgNum);
            }}
            nextSlide={slideNextHandler}
            prevSlide={slidePrevHandler}
            controls={images?.length > 1}
          ></ImageFullView>
        )}
        {imageFormState?.isOpen && (
          <Modal
            onClose={() => {
              setImageFormState((prevState) => ({
                ...prevState,
                isOpen: false,
              }));
            }}
          >
            {(imageFormState?.location === "models" ||
              imageFormState.type === "del") && (
              <ChooseImageForm
                postId={postId}
                postData={postData}
                type={imageFormState.type}
                location={imageFormState.location}
                modelId={modelId}
                versionId={versionId}
                images={images}
                activeImageIndex={currImgNum}
                existedImgsAmount={existedImgsAmount}
                savedImageIds={postData?.imagesId || []}
                onSave={
                  imageFormState.type === "save"
                    ? saveExampleHandler
                    : deleteExampleHandler
                }
                isDeleting={isDeleting}
                onClose={() => {
                  setImageFormState("");
                  setImageFormState((prevState) => ({
                    ...prevState,
                    isOpen: false,
                  }));
                }}
              />
            )}
            {imageFormState?.location === "collections" &&
              imageFormState.type !== "del" && (
                <SaveToCollectionForm
                  postId={postId}
                  type={imageFormState.type}
                  location={imageFormState.location}
                  modelId={modelId}
                  versionId={versionId}
                  images={images}
                  activeImageIndex={currImgNum}
                  existedImgsAmount={existedImgsAmount}
                  onSave={
                    imageFormState.type === "save"
                      ? saveExampleHandler
                      : deleteExampleHandler
                  }
                  isDeleting={isDeleting}
                  onClose={() => {
                    setImageFormState("");
                    setImageFormState((prevState) => ({
                      ...prevState,
                      isOpen: false,
                    }));
                  }}
                />
              )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarouselContent;
