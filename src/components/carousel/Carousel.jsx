import React, { useState } from "react";
import classes from "./Carousel.module.scss";
import ImageCard from "../image-card/ImageCard";
import { useRef } from "react";
import { useEffect } from "react";
import CarouselImage from "./carousel-image/CarouselImage";

const Carousel = ({ images, visibleAmount = 3 }) => {
  const [currImg, setCurrImg] = useState(null);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState("0ms");
  const [imagesHtml, setImagesHtml] = useState([]);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(0);
  const [imagesHaight, setImagesHeight] = useState([]);
  const [carouselHeight, setCarouselHeight] = useState(null);
  const [visibleImages, setVisibleImages] = useState([]);
  const carouselRef = useRef();
  const imagesRef = useRef();
  const transitionDuration = 300;

  useEffect(() => {
    const visibleImg = Array.from(
      { length: visibleAmount },
      (cur, i) => visibleAmount + i
    );
    console.log(visibleImg);
    setVisibleImages(visibleImg);
  }, [visibleAmount]);

  useEffect(() => {
    if (!images?.length) return;
    console.log("aaa");
    setImgIsLoading(true);
    const imagesFiltered = images.filter((image) => true);
    const imagesHtml = imagesFiltered.map((image, i) => {
      return (
        // <div key={image.hash} className={classes.image}>
        //   <CarouselImage
        //     onClick={openImgHandler}
        //     onLoad={imgLoadHandler}
        //     onHeight={imgHeightHandler}
        //     id={image.hash}
        //     src={image.url}
        //     alt=""
        //   />
        // </div>

        <CarouselImage
          key={image.hash}
          onClick={openImgHandler}
          onLoad={imgLoadHandler}
          onHeight={imgHeightHandler}
          id={image.hash}
          src={image.url}
          alt=""
        />
      );
    });

    let imagesleft = [];
    let imagesRight = [];

    if (imagesFiltered.length > +visibleAmount) {
      imagesRight = imagesFiltered.slice(0, visibleAmount).map((image, i) => {
        return (
          // <div key={image.hash + "r"} className={classes.image}>
          //   <CarouselImage
          //     onClick={openImgHandler}
          //     onLoad={imgLoadHandler}
          //     onHeight={imgHeightHandler}
          //     id={image.hash}
          //     src={image.url}
          //     alt=""
          //   />
          // </div>

          <CarouselImage
            key={image.hash + "r"}
            onClick={openImgHandler}
            onLoad={imgLoadHandler}
            onHeight={imgHeightHandler}
            id={image.hash}
            src={image.url}
            alt=""
          />
        );
      });
      imagesleft = imagesFiltered.slice(-visibleAmount).map((image, i) => {
        return (
          // <div key={image.hash + "l"} className={classes.image}>
          //   <CarouselImage
          //     onClick={openImgHandler}
          //     onLoad={imgLoadHandler}
          //     onHeight={imgHeightHandler}
          //     id={image.hash}
          //     src={image.url}
          //     alt=""
          //   />
          // </div>

          <CarouselImage
            key={image.hash + "l"}
            onClick={openImgHandler}
            onLoad={imgLoadHandler}
            onHeight={imgHeightHandler}
            id={image.hash}
            src={image.url}
            alt=""
          />
        );
      });
    }

    setImagesHtml([...imagesleft, ...imagesHtml, ...imagesRight]);
    if (imagesFiltered.length > +visibleAmount) {
      const imgWidth = imagesRef.current.children[0].clientWidth;
      const gap = parseInt(getComputedStyle(imagesRef.current).gap);
      setTranslate(-(imgWidth + gap) * visibleAmount);
    }
  }, [visibleAmount, images]);

  useEffect(() => {
    console.log("Eff");
    if (images.length <= visibleAmount) return;
    const transitionEnd = () => {
      setTransitionEnd(true);
      const carouseWdth = carouselRef.current.clientWidth;
      const containerWdth = imagesRef.current.clientWidth;
      const gap = parseInt(getComputedStyle(imagesRef.current).gap);
      const imgWidth = imagesRef.current.children[0].clientWidth + gap;
      // console.log(translate, -containerWdth + carouseWdth);
      if (translate === -containerWdth + carouseWdth) {
        setCurTransitionDur("0ms");
        setTranslate(-imgWidth * visibleAmount);
      }
      if (translate === 0) {
        // console.log("0000", -containerWdth + carouseWdth);
        // console.log("0001", containerWdth, carouseWdth);
        setCurTransitionDur("0ms");
        setTranslate(-containerWdth + imgWidth * 2 * visibleAmount - gap);
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
  }, [translate, visibleAmount]);

  const slideNextHandler = () => {
    if (!transitionEnd) return;
    setCurTransitionDur(`${transitionDuration}ms`);
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    const imgWidth = imagesRef.current.children[0].clientWidth + gap;
    setTranslate((prevState) => {
      const transition = prevState - imgWidth;
      return transition;
    });
    console.log(imagesHtml);
  };
  const slidePrevHandler = () => {
    if (!transitionEnd) return;
    setCurTransitionDur(`${transitionDuration}ms`);
    const carouseWdth = carouselRef.current.clientWidth;
    const containerWdth = imagesRef.current.clientWidth;
    const imgWidth = imagesRef.current.children[0].clientWidth;
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    // console.log(imgWidth);
    setTranslate((prevState) =>
      prevState < 0 ? prevState + imgWidth + gap : -containerWdth + carouseWdth
    );
  };

  const openImgHandler = (e) => {
    const id = e.target.id;
    const curImg = images.find((image) => image.hash === id);

    setCurrImg((prev) => {
      return prev === curImg ? null : curImg;
    });

    // setCurTransitionDur("0ms");
    // setImgIsOpen((prev) => !prev);
  };

  const closeImgHandler = () => {
    setCurrImg(null);
    // setImgIsOpen(false);
    // setCurTransitionDur(`${transitionDuration}ms`);
  };

  const imgLoadHandler = () => {
    console.log("load");
    setImgLoaded((prevState) => ++prevState);
    // if (imgLoaded === images.length) setImgIsLoading(false);
    if (imagesHaight.length === imagesHtml.length) {
      setImgIsLoading(false);
    }
  };

  useEffect(() => {
    if (imagesHaight.length !== imagesHtml.length) return;
    const height = imagesHaight.reduce((curr, acc) => {
      return +curr > acc ? curr : acc;
    }, 0);
    setCarouselHeight(height);
  }, [imagesHaight]);

  const imgHeightHandler = (height) => {
    setImagesHeight((prevState) => [...prevState, height]);
  };

  return (
    <>
      <div
        className={`${classes.carousel} ${
          classes[`carousel__visible--${visibleAmount}`]
        } `}
        ref={carouselRef}
        style={
          !imgIsLoading && carouselHeight
            ? { height: `${carouselHeight}px` }
            : {}
        }
      >
        {imgIsLoading && <div className={classes.spiner}>Loading...</div>}
        <div
          className={`${classes["carousel__images"]} ${
            imgIsLoading ? classes["carousel__images--hidden"] : ""
          }`}
          style={{
            transform: `translate3D(${translate}px, 0, 0)`,
            transitionDuration: curTransitionDur,
          }}
          ref={imagesRef}
        >
          {imagesHtml}
          {!imagesHtml.length && <div className={classes.image}>img</div>}
        </div>
        {images.length > +visibleAmount && !imgIsLoading && (
          <>
            <button
              type="button"
              className={`${classes.btn} ${classes["btn__left"]}`}
              onClick={slidePrevHandler}
            >
              prev
            </button>

            <button
              type="button"
              className={`${classes.btn} ${classes["btn__right"]}`}
              onClick={slideNextHandler}
            >
              next
            </button>
          </>
        )}
      </div>
      {currImg && <ImageCard imageData={currImg} closeImg={closeImgHandler} />}
    </>
  );
};

export default Carousel;
