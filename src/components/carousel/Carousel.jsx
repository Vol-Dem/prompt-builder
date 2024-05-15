import React, { useCallback, useState } from "react";
import classes from "./Carousel.module.scss";
import ImageCard from "../image-card/ImageCard";
import { useRef } from "react";
import { useEffect } from "react";
import CarouselImage from "./carousel-image/CarouselImage";
import useIntersection from "../../hooks/use-intersection";
import { clearObjectKeys } from "../../utils/generalUtils";
import { getImagesInfo, makeBatchRequest } from "../../utils/fetchUtils";
import firebaseApp from "../../firebase-config";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getFirestore,
  // setDoc,
  // updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../ui/Spinner";
import { uploadActions } from "../../store/upload";
import { modelActions } from "../../store/model";

const firestore = getFirestore(firebaseApp);

const Carousel = ({
  images,
  visibleImgAmount,
  postId,
  onUpdate,
  modelId,
  versionId,
  existedImgsAmount,
  imgIsOpen = false,
  activeImgNum,
}) => {
  const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount);
  const [initial, setInitial] = useState(true);
  // const [imgIsOpen, setImgIsOpen] = useState(imgIsOpen);
  // const [isUploading, setSavingImages] = useState(false);
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState("0ms");
  const [imagesHtml, setImagesHtml] = useState([]);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [carouselHeight, setCarouselHeight] = useState(null);
  const [visibleImages, setVisibleImages] = useState([]);
  const [prevVisibleImages, setPrevVisibleImages] = useState([]);
  const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [dimensions, setDimensions] = useState({});
  const carouselRef = useRef();
  const imagesRef = useRef();
  const wrapRef = useRef();
  const maxCarouselHeight = 390;
  const transitionDuration = 300;
  const caruselIsVisible = useIntersection(carouselRef);
  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const model = useSelector((state) => state.model.model);
  const queue = useSelector((state) => state.upload.queue);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const isUploading = queue.find((item) => item.postId === postId);
  const dispatch = useDispatch();

  useEffect(() => {
    setInitial(true);
  }, [versionId]);

  useEffect(() => {
    if (!dimensions?.imgWidthWithGap) return;
    // console.log(dimensions.imgWidthWithGap);
    const curCarouselWidth =
      dimensions.imgWidthWithGap * curVisibleAmount - dimensions.gap;
    // console.log(curCarouselWidth);
    setCarouselWidth(curCarouselWidth);
  }, [dimensions.imgWidthWithGap, curVisibleAmount, dimensions.gap]);

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

  // useEffect(()=> {
  //   const handleResize = () => {}
  //   if(visibleImgAmount > 1) {
  //     window.addEventListener('resize', handleResize)
  //   }

  //   return ()=> {
  //     window.removeEventListener('resize', handleResize)
  //   }
  // },[])

  const openCarouselHandler = useCallback(() => {
    if (imgIsOpen) return;
    console.log("open");
    document.body.style.overflow = "hidden";
    dispatch(
      modelActions.setActiveCarouselData({
        images,
        visibleImgAmount,
        postId,
        modelId,
        versionId,
        existedImgsAmount,
        currImgNum,
      })
    );
  }, [
    dispatch,
    images,
    visibleImgAmount,
    postId,
    modelId,
    versionId,
    existedImgsAmount,
    currImgNum,
  ]);

  useEffect(() => {
    const curVisibleImgAmount = Math.floor(
      dimensions.wrapWidth / dimensions.imgWidthWithGap
    );
    if (!visibleImgAmount && curVisibleImgAmount <= images?.length) {
      setVisibleAmount(curVisibleImgAmount);
      setCurVisibleAmount(curVisibleImgAmount);
    }
    if (!visibleImgAmount && curVisibleImgAmount > images?.length) {
      setVisibleAmount(images?.length);
      setCurVisibleAmount(images?.length);
    }
  }, [dimensions, visibleImgAmount, images]);

  useEffect(() => {
    if (initial && !!images?.length && visibleAmount) {
      const visibleImg = Array.from(
        { length: visibleAmount },
        (_, i) => visibleAmount + i
      );

      setVisibleImages(visibleImg);
      setCurTransitionDur("0ms");
      setInitial(false);
    }
  }, [visibleAmount, images, initial]);

  const openImgHandler = useCallback(
    (e) => {
      // setCurTransitionDur("0ms");
      // setImgIsOpen((prevState) => !prevState);
      const imgNum = e.target.dataset.position - visibleAmount;
      setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
      setCurVisibleAmount(1);
      setPrevVisibleImages(visibleImages);
      setVisibleImages([+e.target.dataset.position]);
    },
    [visibleAmount, visibleImages, images]
  );

  const closeImgHandler = () => {
    // setImgIsOpen(false);
    // setCurVisibleAmount(visibleAmount);
    // if (prevVisibleImages?.length === visibleAmount) {
    //   setVisibleImages(prevVisibleImages);
    // } else {
    //   const visibleImg = Array.from(
    //     { length: visibleAmount },
    //     (_, i) => visibleImages[0] + i
    //   );
    //   setVisibleImages(visibleImg);
    // }
    dispatch(modelActions.setActiveCarouselData({}));
  };

  useEffect(() => {
    if (!images?.length || !visibleImages?.length) return;
    // console.log(currImgNum);

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
          key={image.hash + i}
          postId={images}
          saved={!postId}
          versionId={versionId}
          onClick={openCarouselHandler}
          id={image.hash}
          dataset={i + visibleAmount}
          src={src}
          alt="example image"
          nsfw={image.nsfw}
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
            key={image.hash + "r" + i}
            postId={images}
            saved={!postId}
            versionId={versionId}
            onClick={openCarouselHandler}
            id={image.hash}
            dataset={i + visibleAmount}
            src={src}
            alt="example image"
            nsfw={image.nsfw}
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
            key={image.hash + "l" + i}
            postId={images}
            saved={!postId}
            versionId={versionId}
            onClick={openCarouselHandler}
            id={image.hash}
            dataset={i}
            src={src}
            alt="example image"
            nsfw={image.nsfw}
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
  ]);

  useEffect(() => {
    if (!images) return;
    const bookImages = images.filter((img) => img.height - img.width > 0);
    const imgsToGetSize = !bookImages.length ? images : bookImages;
    const imgSize = imgsToGetSize?.reduce(
      (acc, cur) => {
        return cur.height > acc[0] ? [cur.height, cur.width] : acc;
      },
      [0, 0]
    );
    const imgHight = Math.floor(
      (dimensions.imgWidth / imgSize[1]) * imgSize[0]
    );
    setCarouselHeight(maxCarouselHeight);
    // if (curVisibleAmount === 1) {
    //   setCarouselHeight(maxCarouselHeight);
    // } else {
    //   setCarouselHeight(
    //     imgHight > maxCarouselHeight ? maxCarouselHeight : imgHight
    //   );
    // }
  }, [images, dimensions.imgWidth, curVisibleAmount]);

  useEffect(() => {
    if (images?.length > curVisibleAmount) {
      setTranslate(-dimensions.imgWidthWithGap * visibleImages[0]);
    }
  }, [dimensions.imgWidthWithGap, curVisibleAmount, visibleImages, images]);

  useEffect(() => {
    if (images?.length <= curVisibleAmount) return;
    setTransitionEnd(true);
    const transitionEnd = () => {
      setTransitionEnd(true);
      if (!imagesRef?.current) return;

      if (visibleImages[0] === 0) {
        setCurTransitionDur("0ms");
        setVisibleImages((prevState) =>
          prevState.map((el, i) => images?.length + i)
        );
        setPrevVisibleImages((prevState) =>
          prevState.map((el, i) => images?.length + i)
        );
        setTranslate(-dimensions.imgWidthWithGap * images?.length);
      }
      if (visibleImages[0] === images?.length + curVisibleAmount) {
        setCurTransitionDur("0ms");
        setVisibleImages((prevState) =>
          prevState.map((el, i) => curVisibleAmount + i)
        );
        setTranslate(-dimensions.imgWidthWithGap * curVisibleAmount);
      }
      if (visibleImages[0] > images?.length + curVisibleAmount) {
        setCurTransitionDur("0ms");
        setVisibleImages((prevState) =>
          prevState.map((el, i) => visibleImages[0] - images?.length)
        );
      }
    };

    const transitionStart = () => {
      setTransitionEnd(false);
    };

    document.addEventListener("transitionstart", transitionStart);
    document.addEventListener("transitionend", transitionEnd);
    return () => {
      document.removeEventListener("transitionstart", transitionStart);
      document.removeEventListener("transitionend", transitionEnd);
    };
  }, [
    translate,
    curVisibleAmount,
    visibleImages,
    images,
    dimensions.imgWidthWithGap,
  ]);

  const slideNextHandler = () => {
    if (!transitionEnd) return;
    setCurTransitionDur(`${transitionDuration}ms`);
    const curImg = visibleImages[0] + 1;
    setVisibleImages((prevState) => prevState.map((el) => el + 1));
    setTranslate(-dimensions.imgWidthWithGap * curImg);
    setPrevVisibleImages(visibleImages.map((el) => el + 1));
    let imgNum = visibleImages[0] + 1 - visibleAmount;
    if (imgNum > images?.length - 1) imgNum = 0;
    setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
  };

  const slidePrevHandler = () => {
    if (!transitionEnd) return;
    setCurTransitionDur(`${transitionDuration}ms`);
    const curImg = visibleImages[0] - 1;
    setVisibleImages((prevState) => prevState.map((el) => el - 1));
    setTranslate(-dimensions.imgWidthWithGap * curImg);
    setPrevVisibleImages(visibleImages.map((el) => el - 1));
    const imgNum = visibleImages[0] - 1 - visibleAmount;
    setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
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
          setCurTransitionDur(`${transitionDuration}ms`);
          setCurrImgNum(i);
          setVisibleImages((prevState) => {
            const newVisibleImages = prevState.map(
              (el, j) => i + j + visibleAmount
            );
            setPrevVisibleImages(newVisibleImages);
            return newVisibleImages;
          });
        }}
      ></li>
    );
  });

  const saveExampleHandler = async () => {
    const postData =
      model.hasOwnProperty("savedImages") &&
      model?.savedImages[versionId]?.find((post) => post.postId === +postId);
    console.log(queue);
    dispatch(
      uploadActions.addToQueue({
        postId,
        modelId,
        modelName: model.name,
        versionId,
        nsfwMode,
        postData: postData || null,
        imgUrl: images[0].url,
      })
    );

    // try {
    //   if (isUploading) return;
    //   setSavingImages(true);
    //   const imgExampleResponse = await fetch(
    //     `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
    //       nsfwMode ? `&nsfw=X` : `&nsfw=None`
    //     }`
    //   );
    //   // const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
    //   //     versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
    //   //   }${amountPerPage ? `&limit=${amountPerPage}` : ""}${
    //   //     imagesSortValue ? `&sort=${imagesSortValue}` : ""
    //   //   }${cursor ? `&cursor=${cursor}` : ""}${
    //   //     nsfwMode ? `&nsfw=X` : `&nsfw=None`
    //   //   }`;
    //   const data = await imgExampleResponse.json();
    //   console.log(data);
    //   if (!data.items.length) {
    //     throw new Error("0 items");
    //   }
    //   data.items.forEach((image) => {
    //     if (image.meta) {
    //       image.meta.comfy = "";
    //       image.meta = clearObjectKeys(image.meta);
    //       if (image.meta.hashes)
    //         image.meta.hashes = clearObjectKeys(image.meta.hashes);
    //     }
    //   });
    //   const examplesDataWithRes = await makeBatchRequest(
    //     data.items.sort((a, b) => {
    //       return b.createdAt - a.createdAt;
    //     }),
    //     getImagesInfo
    //   );
    //   console.log(examplesDataWithRes);
    //   examplesDataWithRes.versionId = versionId;
    //   const modelRef = doc(firestore, "users", uid, "models", modelId + "");
    //   const modelImagesRef = doc(
    //     firestore,
    //     "users",
    //     uid,
    //     "models",
    //     modelId + "",
    //     "images",
    //     postId + ""
    //   );
    //   const newImgData = { postId: +postId, amount: data.items.length };
    //   console.log("LENGTH");
    //   console.log(data.items.length);
    //   console.log(examplesDataWithRes.length);
    //   const batch = writeBatch(firestore);
    //   batch.set(
    //     modelImagesRef,
    //     {
    //       items: examplesDataWithRes,
    //       versionId,
    //       createdAt: examplesDataWithRes[0].createdAt,
    //       savedAt: new Date().toISOString(),
    //       nsfw: examplesDataWithRes[0].nsfw,
    //       nsfwLevel: examplesDataWithRes[0]?.nsfwLevel || "",
    //     },
    //     { merge: true }
    //   );
    //   const postData =
    //     model.hasOwnProperty("savedImages") &&
    //     model?.savedImages[versionId]?.find((post) => post.postId === +postId);
    //   console.log(postData);
    //   console.log(versionId);
    //   console.log(postId);
    //   if (postData) {
    //     batch.update(modelRef, {
    //       [`savedImages.${versionId}`]: arrayRemove(postData),
    //     });
    //   }
    //   batch.set(
    //     modelRef,
    //     {
    //       savedImages: {
    //         [`${versionId}`]: arrayUnion(newImgData),
    //       },
    //     },
    //     { merge: true }
    //   );
    //   // Commit the batch
    //   await batch.commit();
    //   setSavingImages(false);
    // } catch (err) {
    //   setSavingImages(false);
    //   console.log(err.message);
    //   console.log(err);
    // }
  };

  const updateExampleHandler = () => {
    onUpdate(images[0].postId);
  };

  // useEffect(() => {
  //   document.body.style.overflow = "hidden";
  //   return () => {
  //     document.body.style.overflow = null;
  //   };
  // }, []);
  useEffect(() => {
    if (activeImgNum) {
      console.log(activeImgNum);
      setCurrImgNum(activeImgNum);
      setVisibleImages((prevState) => {
        const newVisibleImages = prevState.map(
          (el, j) => activeImgNum + j + visibleAmount
        );
        setPrevVisibleImages(newVisibleImages);
        return newVisibleImages;
      });
    }
  }, [activeImgNum, visibleAmount]);

  return (
    <div
      // className={classes.container}
      className={`${classes.container} ${
        imgIsOpen ? classes["container--open"] : ""
      }`}
      style={
        carouselHeight && !imgIsOpen ? { height: `${carouselHeight}px` } : {}
      }
      // onClick={openCarouselHandler}
    >
      <div
        ref={wrapRef}
        className={`${classes.wrap}`}
        style={
          imgIsOpen
            ? {
                height: `${
                  promptIsOpen ? "calc(100vh - 315px)" : "calc(100vh - 110px)"
                }`,
              }
            : {}
        }
        // className={`${classes.wrap} ${imgIsOpen ? classes["wrap--open"] : ""}`}
      >
        <div
          className={`${classes.carousel}`}
          ref={carouselRef}
          style={
            carouselHeight && carouselWidth
              ? {
                  height: `${carouselHeight}px`,
                  maxWidth: `${carouselWidth}px`,
                }
              : {}
          }
        >
          <div
            className={`${classes["carousel__images"]} `}
            style={{
              transform: `translate3D(${translate}px, 0, 0)`,
              transitionDuration: curTransitionDur,
            }}
            ref={imagesRef}
          >
            {imagesHtml}
            {!imagesHtml.length && <div className={classes.image}>img</div>}
          </div>

          {images?.length > curVisibleAmount && (
            <>
              <button
                type="button"
                className={`${classes.btn} ${classes["btn__left"]}`}
                onClick={slidePrevHandler}
                title="Prev"
              >
                <span></span>
              </button>

              <button
                type="button"
                className={`${classes.btn} ${classes["btn__right"]}`}
                onClick={slideNextHandler}
                title="Next"
              >
                <span></span>
              </button>
            </>
          )}
          {images?.length > curVisibleAmount && (
            <ul className={classes.pagination}>{paginationHtml}</ul>
          )}
          {postId && (
            <span className={classes["btn-save-container"]}>
              <button
                className={`${classes["btn-save"]} ${
                  isUploading ? classes["btn-save--saving"] : ""
                }`}
                onClick={saveExampleHandler}
              >
                {!isUploading ? "+" : <Spinner size="small" />}
              </button>
              {existedImgsAmount && existedImgsAmount < images.length && (
                <span className={classes["btn-save__amount"]}>
                  {existedImgsAmount}/{images.length}
                </span>
              )}
            </span>
          )}
          {onUpdate && (
            <span
              className={classes["btn-save"]}
              onClick={updateExampleHandler}
            >
              UP
            </span>
          )}
          <span className={classes["amount"]}>{images?.length}</span>
        </div>
        {imgIsOpen && (
          <ImageCard
            imageData={images[currImgNum]}
            closeImg={closeImgHandler}
            // isOpen={imgIsOpen}
          />
        )}
      </div>
    </div>
  );
};

export default Carousel;
