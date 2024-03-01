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
import { arrayUnion, doc, getFirestore, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";

const firestore = getFirestore(firebaseApp);

const Carousel = ({
  images,
  visibleImgAmount,
  postId,
  onUpdate,
  modelId,
  versionId,
}) => {
  const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount);
  const [imgIsOpen, setImgIsOpen] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState("0ms");
  const [imagesHtml, setImagesHtml] = useState([]);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [carouselHeight, setCarouselHeight] = useState(null);
  const [visibleImages, setVisibleImages] = useState([]);
  const [prevVisibleImages, setPrevVisibleImages] = useState([]);
  const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
  const [dimensions, setDimensions] = useState({});
  const carouselRef = useRef();
  const imagesRef = useRef();
  const wrapRef = useRef();
  const transitionDuration = 300;
  const caruselIsVisible = useIntersection(carouselRef);
  const uid = useSelector((state) => state.auth.user.uid);

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
    const visibleImg = Array.from(
      { length: visibleAmount },
      (_, i) => visibleAmount + i
    );

    setVisibleImages(visibleImg);
    setCurTransitionDur("0ms");
  }, [visibleAmount, images]);

  const openImgHandler = useCallback(
    (e) => {
      // setCurTransitionDur("0ms");
      setImgIsOpen((prevState) => !prevState);
      const imgNum = e.target.dataset.position - visibleAmount;
      setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
      setCurVisibleAmount(1);
      setPrevVisibleImages(visibleImages);
      setVisibleImages([+e.target.dataset.position]);
    },
    [visibleAmount, visibleImages, images]
  );

  const closeImgHandler = () => {
    setImgIsOpen(false);
    setCurVisibleAmount(visibleAmount);
    if (prevVisibleImages?.length === visibleAmount) {
      setVisibleImages(prevVisibleImages);
    } else {
      const visibleImg = Array.from(
        { length: visibleAmount },
        (_, i) => visibleImages[0] + i
      );
      setVisibleImages(visibleImg);
    }
  };

  useEffect(() => {
    if (!images?.length || !visibleImages?.length) return;

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
          onClick={openImgHandler}
          id={image.hash}
          dataset={i + visibleAmount}
          src={src}
          alt="example image"
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
            onClick={openImgHandler}
            id={image.hash}
            dataset={i + visibleAmount}
            src={src}
            alt="example image"
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
            onClick={openImgHandler}
            id={image.hash}
            dataset={i}
            src={src}
            alt="example image"
          />
        );
      });
    }
    setImagesHtml([...imagesleft, ...imagesHtml, ...imagesRight]);
  }, [visibleAmount, images, visibleImages, openImgHandler, caruselIsVisible]);

  useEffect(() => {
    if (!images) return;
    const imgSize = images?.reduce(
      (acc, cur) => {
        return cur.height > acc[0] ? [cur.height, cur.width] : acc;
      },
      [0, 0]
    );
    const carHight = Math.floor(
      (dimensions.imgWidth / imgSize[1]) * imgSize[0]
    );

    setCarouselHeight(carHight < 300 ? 300 : carHight);
  }, [images, dimensions.imgWidth]);

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
    try {
      if (savingImages) return;
      setSavingImages(true);
      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}`
      );
      const data = await imgExampleResponse.json();
      console.log(data);
      if (!data.items.length) {
        throw new Error("0 items");
      }
      data.items.forEach((image) => {
        if (image.meta) {
          image.meta.comfy = "";
          image.meta = clearObjectKeys(image.meta);
          if (image.meta.hashes)
            image.meta.hashes = clearObjectKeys(image.meta.hashes);
        }
      });

      const examplesDataWithRes = await makeBatchRequest(
        data.items,
        getImagesInfo
      );
      console.log(examplesDataWithRes);
      examplesDataWithRes.versionId = versionId;

      const modelRef = doc(firestore, "users", uid, "models", modelId + "");
      const modelImagesRef = doc(
        firestore,
        "users",
        uid,
        "models",
        modelId + "",
        "images",
        postId + ""
      );

      const newImgData = { postId: +postId, amount: data.items.length };

      await setDoc(
        modelImagesRef,
        {
          items: examplesDataWithRes,
          versionId,
          createdAt: examplesDataWithRes[0].createdAt,
          savedAt: new Date().toISOString(),
          nsfw: examplesDataWithRes[0].nsfw,
          nsfwLevel: examplesDataWithRes[0]?.nsfwLevel || "",
        },
        { merge: true }
      );

      await setDoc(
        modelRef,
        {
          savedImages: {
            [`${versionId}`]: arrayUnion(newImgData),
          },
        },
        { merge: true }
      );

      setSavingImages(false);
    } catch (err) {
      setSavingImages(false);
      console.log(err.message);
    }
  };
  const updateExampleHandler = () => {
    onUpdate(images[0].postId);
  };

  return (
    <div
      className={classes.container}
      style={carouselHeight ? { height: `${carouselHeight}px` } : {}}
    >
      <div
        ref={wrapRef}
        className={`${classes.wrap} ${imgIsOpen ? classes["wrap--open"] : ""}`}
      >
        <div
          className={`${classes.carousel} ${
            classes[`carousel__visible--${curVisibleAmount}`]
          } `}
          ref={carouselRef}
          style={carouselHeight ? { height: `${carouselHeight}px` } : {}}
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
              ></button>

              <button
                type="button"
                className={`${classes.btn} ${classes["btn__right"]}`}
                onClick={slideNextHandler}
                title="Next"
              ></button>
            </>
          )}
          {images?.length > curVisibleAmount && (
            <ul className={classes.pagination}>{paginationHtml}</ul>
          )}
          {postId && (
            <span
              className={`${classes["post-id"]} ${
                savingImages ? classes["post-id--saving"] : ""
              }`}
              onClick={saveExampleHandler}
            >
              {!savingImages ? "+" : "S..."}
            </span>
          )}
          {onUpdate && (
            <span className={classes["post-id"]} onClick={updateExampleHandler}>
              UP
            </span>
          )}
          <span className={classes["amount"]}>{images?.length}</span>
        </div>
        <div
          className={`${classes.card} ${
            imgIsOpen ? classes["card--hidden"] : ""
          }`}
        >
          {imgIsOpen && (
            <ImageCard
              imageData={images[currImgNum]}
              closeImg={closeImgHandler}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
