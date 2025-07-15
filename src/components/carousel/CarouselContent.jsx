import { useCallback, useState } from "react";
import classes from "./CarouselContent.module.scss";
import { useRef } from "react";
import { useEffect } from "react";
import CarouselImage from "./carousel-image/CarouselImage";
import { updateImagePostData } from "../../utils/fetchUtils";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../ui/Spinner";
import { uploadActions } from "../../store/upload";
import { deleteImgPost, modelActions } from "../../store/model";
import Modal from "../ui/Modal";
import ChooseImageForm from "../forms/choose-image-form/ChooseImageForm";
import ImageFullView from "../ui/ImageFullView";
import { AnimatePresence } from "framer-motion";
import { SETTINGS_CAROUSEL_TRANSITION_DURATION } from "../../variables/constants";
import {
  FolderArrowDownIcon,
  FolderPlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import SaveToCollectionForm from "../forms/save-to-collection-form/SaveToCollectionForm";
import { updateCollectionPostsData } from "../../store/images";

const CarouselContent = ({
  imagesData,
  visibleImgAmount,
  postId,
  onUpdate,
  modelId,
  versionId,
  existedImgsAmount,
  imgIsOpen = false,
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
  const [imageFormType, setImageFormType] = useState({});
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState(0);
  const [imagesListIsOpen, setImagesListIsOpen] = useState(false);
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagesHtml, setImagesHtml] = useState([]);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [visibleImages, setVisibleImages] = useState([]);
  const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [dimensions, setDimensions] = useState({});
  const [cursorInitialX, setCursorInitialX] = useState(null);
  const [cursorCurX, setCursorCurX] = useState(null);
  const carouselRef = useRef();
  const imagesRef = useRef();
  const wrapRef = carouselRef;
  const caruselIsVisible = true;
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const modelName = useSelector((state) => state.model.model.name);
  const savedImages = useSelector((state) => state.model.savedImages);
  const queue = useSelector((state) => state.upload.queue);
  const sfwValue = useSelector((state) => state.general.sfwValue);
  const isUploading = queue.find((item) => item.postId === postId);
  const dispatch = useDispatch();

  const postData =
    !!Object.keys(savedImages?.data)?.length &&
    savedImages.data[versionId]?.find((post) => post.postId === postId);

  useEffect(() => {
    setImages(imagesData);
  }, [imagesData]);

  useEffect(() => {
    if (!visibleImgAmount) {
      setVisibleAmount(0);
      setCurVisibleAmount(0);
    }
    setCurrImgNum(0);
    setTranslate(0);
    setInitial(true);
  }, [versionId, visibleImgAmount]);

  useEffect(() => {
    setInitial(true);
    setCurrImgNum(0);
    setTranslate(0);
  }, [nsfwMode]);

  useEffect(() => {
    if (!dimensions?.imgWidthWithGap) return;
    if (!curVisibleAmount) {
      setCarouselWidth(dimensions.imgWidth);
    } else {
      const curCarouselWidth =
        dimensions.imgWidthWithGap * curVisibleAmount - dimensions.gap;
      setCarouselWidth(curCarouselWidth);
    }
  }, [
    dimensions.imgWidthWithGap,
    curVisibleAmount,
    dimensions.gap,
    dimensions.imgWidth,
  ]);

  useEffect(() => {
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

  const showSaveImagesListHandler = (e) => {
    const location = e.target.closest(`.${classes["save__btn"]}`).dataset
      .location;
    if (images.length === 1 && location === "models") {
      saveExampleHandler("models", null, null, postData);
    } else {
      // setImageFormType("save");
      setImageFormType({ type: "save", location: location || null });
      setImagesListIsOpen(true);
    }
  };

  const openDeleteListHandler = useCallback(
    (e) => {
      setImageFormType({ type: "del", location: location || null });
      setImagesListIsOpen(true);
    },
    [location]
  );

  const openFullViewHandler = () => {
    setFullViewIsOpen(true);
  };

  const openCarouselHandler = useCallback(
    (e) => {
      let currImgNum;
      const imgNum = +e?.target?.dataset?.position - visibleAmount;
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
    },
    [
      dispatch,
      images,
      visibleImgAmount,
      postId,
      modelId,
      versionId,
      existedImgsAmount,
      visibleAmount,
      saved,
      location,
      locationId,
    ]
  );

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

  const openImgHandler = useCallback(
    (e) => {
      const imgNum = e.target.dataset.position - visibleAmount;
      setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
      setCurVisibleAmount(1);
      setVisibleImages([+e.target.dataset.position]);
    },
    [visibleAmount, images]
  );

  useEffect(() => {
    if (!images?.length || !visibleImages?.length || !visibleAmount) return;

    const imagesFiltered = images.filter((image) => true);
    const imagesHtml = imagesFiltered.map((image, i) => {
      const src =
        (visibleImages.includes(i + visibleAmount) ||
          visibleImages.includes(i - images?.length + visibleAmount)) &&
        caruselIsVisible
          ? image.url
          : "";

      return (
        <CarouselImage
          key={image?.hash + i}
          imageData={image}
          postId={images}
          saved={saved}
          active={!!active}
          versionId={versionId}
          onClick={openCarouselHandler}
          onDelete={openDeleteListHandler}
          onOpen={openFullViewHandler}
          id={image?.hash}
          dataset={i + visibleAmount}
          src={src}
          alt="example image"
          side={side}
          nsfw={
            image?.nsfw === false ||
            image?.nsfw === "None" ||
            image?.nsfwLevel === sfwValue ||
            image.nsfwLevel === 1
              ? false
              : true
          }
          imageWidth={imageWidth}
          location={location}
          locationId={locationId}
        />
      );
    });

    let imagesleft = [];
    let imagesRight = [];

    if (imagesFiltered.length >= +visibleAmount) {
      imagesRight = imagesFiltered.slice(0, visibleAmount).map((image, i) => {
        const src =
          visibleImages.includes(i + visibleAmount) && caruselIsVisible
            ? image.url
            : "";
        return (
          <CarouselImage
            key={image?.hash + "r" + i}
            imageData={image}
            postId={images}
            saved={saved}
            active={!!active}
            versionId={versionId}
            onClick={openCarouselHandler}
            onDelete={openDeleteListHandler}
            onOpen={openFullViewHandler}
            id={image?.hash}
            dataset={i + visibleAmount}
            src={src}
            alt="example image"
            side={side}
            nsfw={
              image?.nsfw === false ||
              image?.nsfw === "None" ||
              image?.nsfwLevel === sfwValue ||
              image.nsfwLevel === 1
                ? false
                : true
            }
            imageWidth={imageWidth}
            location={location}
            locationId={locationId}
          />
        );
      });
      imagesleft = imagesFiltered.slice(-visibleAmount).map((image, i) => {
        const src =
          (visibleImages.includes(i) ||
            visibleImages.includes(i + images?.length)) &&
          caruselIsVisible
            ? image.url
            : "";
        return (
          <CarouselImage
            key={image?.hash + "l" + i}
            imageData={image}
            postId={images}
            saved={saved}
            active={!!active}
            versionId={versionId}
            onClick={openCarouselHandler}
            onDelete={openDeleteListHandler}
            onOpen={openFullViewHandler}
            id={image?.hash}
            dataset={i}
            src={src}
            alt="example image"
            side={side}
            nsfw={
              image?.nsfw === false ||
              image?.nsfw === "None" ||
              image?.nsfwLevel === sfwValue ||
              image.nsfwLevel === 1
                ? false
                : true
            }
            imageWidth={imageWidth}
            location={location}
            locationId={locationId}
          />
        );
      });
    }
    setImagesHtml([...imagesleft, ...imagesHtml, ...imagesRight]);
  }, [
    visibleAmount,
    images,
    visibleImages,
    openImgHandler,
    caruselIsVisible,
    postId,
    versionId,
    currImgNum,
    openCarouselHandler,
    saved,
    active,
    side,
    sfwValue,
    imageWidth,
    location,
    locationId,
    openDeleteListHandler,
  ]);

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

  const paginationHtml = images?.map((_, i) => {
    const isActive =
      visibleImages.includes(visibleAmount + i) ||
      visibleImages.includes(i - images?.length + visibleAmount) ||
      visibleImages.includes(i + images?.length + visibleAmount);
    return (
      <li
        key={i}
        className={`${classes["pagination__item"]} ${
          isActive ? classes["pagination__item--active"] : ""
        }`}
        onClick={() => {
          setCurTransitionDur(SETTINGS_CAROUSEL_TRANSITION_DURATION);
          setCurrImgNum(i);
          if (!!onActiveNumChange) {
            onActiveNumChange(i);
          }
          setVisibleImages((prevState) => {
            const newVisibleImages = prevState.map(
              (el, j) => i + j + visibleAmount
            );
            return newVisibleImages;
          });
        }}
      ></li>
    );
  });

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
    setImagesListIsOpen(false);
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
      setImagesListIsOpen(false);
    } catch (err) {
      console.error(err.message);
      setIsDeleting(false);
    }
  };

  const updateExampleHandler = () => {
    onUpdate(images[0].postId);
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
      <div
        className={`${classes["carousel__images"]} `}
        style={{
          transform: `translate3D(${translate}px, 0, 0)`,
          transitionDuration: `${curTransitionDur}ms`,
        }}
        ref={imagesRef}
      >
        {imagesHtml}
        {!imagesHtml.length && <div style={{ width: imageWidth }}></div>}
      </div>

      {images?.length > curVisibleAmount && (
        <>
          <button
            type="button"
            className={`${classes.btn} ${classes["btn__left"]}`}
            onClick={slidePrevHandler}
            title="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <button
            type="button"
            className={`${classes.btn} ${classes["btn__right"]}`}
            onClick={slideNextHandler}
            title="Next"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </>
      )}
      {images?.length > curVisibleAmount && (
        <ul className={classes.pagination}>{paginationHtml}</ul>
      )}
      <div className={classes["save"]}>
        {!saved && !!postId && (
          <div className={classes["save__btn"]} data-location="models">
            <button
              className={`${classes["btn-save"]} ${
                isUploading ? classes["btn-save--saving"] : ""
              }`}
              onClick={showSaveImagesListHandler}
              disabled={!!isUploading || existedImgsAmount >= images?.length}
              title="Save"
            >
              {!isUploading ? (
                <FolderArrowDownIcon />
              ) : (
                <Spinner size="small" />
              )}
            </button>
            <span className={classes["save__btn-text"]}>Save to model</span>
          </div>
        )}
        <div
          className={`${classes["save__btn"]} ${
            classes["save__btn--collection"]
          } ${
            !saved && !!postId ? classes["save__btn--collection-hidden"] : ""
          }`}
          data-location="collections"
        >
          <button
            className={`${classes["btn-save"]} ${
              isUploading ? classes["d"] : ""
            }`}
            onClick={showSaveImagesListHandler}
            title="Save"
          >
            <FolderPlusIcon />
          </button>
          <span className={classes["save__btn-text"]}>Save to collection</span>
        </div>

        {existedImgsAmount && !saved && (
          <div className={classes["btn-save__amount"]}>
            {existedImgsAmount}/{images.length}
          </div>
        )}
      </div>
      {images?.length > 1 && (
        <button
          className={classes["btn-all"]}
          onClick={openCarouselHandler}
          title="Show All Images"
        >
          <Squares2X2Icon />
        </button>
      )}
      {onUpdate && (
        <span className={classes["btn-save"]} onClick={updateExampleHandler}>
          UP
        </span>
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
        {imagesListIsOpen && (
          <Modal
            onClose={() => {
              setImagesListIsOpen(false);
            }}
          >
            {(imageFormType?.location === "models" ||
              imageFormType.type === "del") && (
              <ChooseImageForm
                postId={postId}
                postData={postData}
                type={imageFormType.type}
                location={imageFormType.location}
                modelId={modelId}
                versionId={versionId}
                images={images}
                activeImageIndex={currImgNum}
                existedImgsAmount={existedImgsAmount}
                savedImageIds={postData?.imagesId || []}
                onSave={
                  imageFormType.type === "save"
                    ? saveExampleHandler
                    : deleteExampleHandler
                }
                isDeleting={isDeleting}
                onClose={() => {
                  setImageFormType("");
                  setImagesListIsOpen(false);
                }}
              />
            )}
            {imageFormType?.location === "collections" &&
              imageFormType.type !== "del" && (
                <SaveToCollectionForm
                  postId={postId}
                  type={imageFormType.type}
                  location={imageFormType.location}
                  modelId={modelId}
                  versionId={versionId}
                  images={images}
                  activeImageIndex={currImgNum}
                  existedImgsAmount={existedImgsAmount}
                  onSave={
                    imageFormType.type === "save"
                      ? saveExampleHandler
                      : deleteExampleHandler
                  }
                  isDeleting={isDeleting}
                  onClose={() => {
                    setImageFormType("");
                    setImagesListIsOpen(false);
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
