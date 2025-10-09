import classes from "./Carousel3d.module.scss";
import carouselImage1 from "../../assets/3dcarousel/slide-1.webp";
import carouselImage2 from "../../assets/3dcarousel/slide-2.webp";
import carouselImage3 from "../../assets/3dcarousel/slide-3.webp";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

const carouselImages = [
  { url: carouselImage1, width: 700, height: 336 },
  { url: carouselImage2, width: 700, height: 336 },
  { url: carouselImage3, width: 700, height: 336 },
];
const slideDelaySec = 4;

const Carousel3d = ({ className }) => {
  const [curSlideIndex, setCurSlideIndex] = useState(0);
  const [transitionSec, setTransitionSec] = useState(0.9);
  const isMobal = useSelector((state) => state.general.isMobile);
  const intervalRef = useRef(null);

  const transitionEndHandler = useCallback(() => {
    document.removeEventListener("transitionend", transitionEndHandler);

    if (curSlideIndex === carouselImages?.length) {
      setTransitionSec(0);
      setCurSlideIndex(0);
    }
  }, [curSlideIndex]);

  useEffect(() => {
    if (curSlideIndex > 2 && !!carouselImages?.length && !isMobal) {
      document.removeEventListener("transitionend", transitionEndHandler);
      document.addEventListener("transitionend", transitionEndHandler);
    } else {
      document.removeEventListener("transitionend", transitionEndHandler);
    }

    return () => {
      document.removeEventListener("transitionend", transitionEndHandler);
    };
  }, [transitionEndHandler, curSlideIndex, isMobal]);

  useEffect(() => {
    if (carouselImages?.length) {
      clearInterval(intervalRef?.current);
      intervalRef.current = setInterval(() => {
        setCurSlideIndex((prevState) => {
          if (prevState > carouselImages?.length) {
            return 0;
          }
          setTransitionSec(0.9);
          return prevState + 1;
        });
      }, slideDelaySec * 1000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const imagesHtml = useMemo(
    () =>
      carouselImages.map((image, i) => {
        const trans = curSlideIndex - i;

        return (
          <li
            key={i}
            className={`${classes.item} ${classes[`item--${i + 1}`]}`}
            style={{
              opacity: trans > 0 ? 0 : 1,
              transform: `translate(${trans * 1.6}rem, ${trans * 1.2}rem)`,
              transition: `all ${transitionSec}s`,
              zIndex: carouselImages.length * 2 - i,
            }}
          >
            <img
              className={classes.image}
              src={image.url}
              width={image.width}
              height={image.height}
              alt={`slide${i + 1}`}
            />
          </li>
        );
      }),
    [curSlideIndex, transitionSec]
  );

  const imagesHtmlLeft = useMemo(
    () =>
      carouselImages.map((image, i) => {
        const trans = curSlideIndex - i - carouselImages.length;

        return (
          <li
            key={i + carouselImages.length}
            className={`${classes.item} ${
              classes[`item--${carouselImages.length + i + 1}`]
            }`}
            style={{
              opacity: trans > -carouselImages.length ? 1 : 0,
              transform: `translate(${trans * 1.6}rem, ${trans * 1.2}rem)`,
              transition: `all ${transitionSec}s`,
              zIndex: carouselImages.length - i,
            }}
          >
            <img
              className={classes.image}
              src={image.url}
              width={image.width}
              height={image.height}
              alt={`slide${i + 1}`}
            />
          </li>
        );
      }),
    [curSlideIndex, transitionSec]
  );

  return (
    <div className={`${classes.container} ${className || ""}`}>
      <ul className={classes["list"]}>{[...imagesHtml, ...imagesHtmlLeft]}</ul>
      <div className={classes.shadow}></div>
    </div>
  );
};

export default Carousel3d;
