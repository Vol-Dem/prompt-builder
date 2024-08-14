import classes from "./Carousel3d.module.scss";
import carouselImage1 from "../../assets/about/1-start-1.webp";
import carouselImage2 from "../../assets/about/1-start-2.webp";
import carouselImage3 from "../../assets/about/5-added-models.webp";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const carouselImages = [carouselImage1, carouselImage2, carouselImage3];
const slideDelaySec = 4;

const Carousel3d = () => {
  const [curSlideIndex, setCurSlideIndex] = useState(0);
  const [transitionSec, setTransitionSec] = useState(0.9);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const intervalRef = useRef(null);

  const transitionStartHandler = useCallback(() => {
    setTransitionEnd(false);
    // console.log("END");
  }, []);

  const transitionEndHandler = useCallback(() => {
    setTransitionEnd(true);
    document.removeEventListener("transitionstart", transitionStartHandler);
    document.removeEventListener("transitionend", transitionEndHandler);
    // console.log("STRAT");

    if (curSlideIndex === carouselImages?.length) {
      console.log("RESET");
      setTransitionSec(0);
      setCurSlideIndex(0);
    }
  }, [curSlideIndex, transitionStartHandler]);

  useEffect(() => {
    if (curSlideIndex > 2 && !!carouselImages?.length) {
      setTransitionEnd(true);
      document.removeEventListener("transitionstart", transitionStartHandler);
      document.removeEventListener("transitionend", transitionEndHandler);
      document.addEventListener("transitionstart", transitionStartHandler);
      document.addEventListener("transitionend", transitionEndHandler);
    }

    return () => {
      // console.log("RESET TRANSITION");
      document.removeEventListener("transitionstart", transitionStartHandler);
      document.removeEventListener("transitionend", transitionEndHandler);
    };
  }, [transitionStartHandler, transitionEndHandler, curSlideIndex]);

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
        // console.log(`Image ${i}`, `Cur ${curSlideIndex}`, trans);

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
            <img className={classes.image} src={image} alt={`slide${i + 1}`} />
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
            <img className={classes.image} src={image} alt={`slide${i + 1}`} />
          </li>
        );
      }),
    [curSlideIndex, transitionSec]
  );

  return (
    <div className={classes.container}>
      <ul className={classes["list"]}>{[...imagesHtml, ...imagesHtmlLeft]}</ul>
      <div className={classes.shadow}></div>
    </div>
  );
};

export default Carousel3d;
