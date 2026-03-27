import { useEffect, useRef, useState, type ComponentProps } from "react";

import classes from "./Carousel3d.module.scss";
import { useAppSelector } from "../../../store/hooks/hooks";

interface Carousel3dImage {
  url: string;
  width: number;
  height: number;
}

type Carousel3dProps = ComponentProps<"div"> & { images: Carousel3dImage[] };

const slideDelaySec = 4;

/**
 * 3D-style auto-rotating image carousel.
 *
 * Cycles through images with transform-based transitions.
 * Resets seamlessly when reaching the end.
 * @param {object} props
 * @param {Array<{url:string,width:number,height:number}>} props.images - Images to display.
 * @param {string} [props.className] - Optional custom class.
 * @returns {JSX.Element} Rendered 3D carousel.
 */
const Carousel3d = ({ images, className }: Carousel3dProps) => {
  const [curSlideIndex, setCurSlideIndex] = useState(0);
  const [transitionSec, setTransitionSec] = useState(0.9);
  const isMobal = useAppSelector((state) => state.general.isMobile);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    const transitionEndHandler = () => {
      document.removeEventListener("transitionend", transitionEndHandler);

      if (curSlideIndex === images?.length) {
        setTransitionSec(0);
        setCurSlideIndex(0);
      }
    };

    if (curSlideIndex > 2 && !!images?.length && !isMobal) {
      document.removeEventListener("transitionend", transitionEndHandler);
      document.addEventListener("transitionend", transitionEndHandler);
    } else {
      document.removeEventListener("transitionend", transitionEndHandler);
    }

    return () => {
      document.removeEventListener("transitionend", transitionEndHandler);
    };
  }, [curSlideIndex, isMobal, images]);

  useEffect(() => {
    if (images?.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef?.current);
      }

      intervalRef.current = setInterval(() => {
        setCurSlideIndex((prevState) => {
          if (prevState > images?.length) {
            return 0;
          }
          setTransitionSec(0.9);
          return prevState + 1;
        });
      }, slideDelaySec * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images]);

  const imagesHtml = images.map((image, i) => {
    const trans = curSlideIndex - i;

    return (
      <li
        key={i}
        className={`${classes.item} ${classes[`item--${i + 1}`]}`}
        style={{
          opacity: trans > 0 ? 0 : 1,
          transform: `translate(${trans * 1.6}rem, ${trans * 1.2}rem)`,
          transition: `all ${transitionSec}s`,
          zIndex: images.length * 2 - i,
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
  });

  const imagesHtmlLeft = images.map((image, i) => {
    const trans = curSlideIndex - i - images.length;

    return (
      <li
        key={i + images.length}
        className={`${classes.item} ${
          classes[`item--${images.length + i + 1}`]
        }`}
        style={{
          opacity: trans > -images.length ? 1 : 0,
          transform: `translate(${trans * 1.6}rem, ${trans * 1.2}rem)`,
          transition: `all ${transitionSec}s`,
          zIndex: images.length - i,
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
  });

  return (
    <div className={`${classes.container} ${className || ""}`}>
      <ul className={classes["list"]}>{[...imagesHtml, ...imagesHtmlLeft]}</ul>
      <div className={classes.shadow}></div>
    </div>
  );
};

export default Carousel3d;
