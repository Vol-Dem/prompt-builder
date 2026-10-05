import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type MouseEvent, type TouchEvent,
} from "react";

import type { Image } from "../../shared/types/image";
import { SETTINGS_CAROUSEL_TRANSITION_DURATION } from "../variables/constants";

type CarouselImageDementions = {
  gap: number;
  imgWidth: number;
  imgWidthWithGap: number;
  wrapWidth: number;
  isOpen?: boolean;
};

type CarouselNavigationOptions = {
  imagesData: Image[];
  visibleImgAmount?: number;
  activeImgNum?: number;
  fullViewIsOpen: boolean;
  onActiveNumChange?: (activeImage: number) => void;
};

/** Owns slide measurements, transitions and gestures; dialogs and persistence stay in the carousel. */
const useCarouselNavigation = ({
  imagesData, visibleImgAmount = 0, activeImgNum, fullViewIsOpen, onActiveNumChange,
}: CarouselNavigationOptions) => {
  const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount || 0);
  const [initial, setInitial] = useState(true);
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState(0);
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

  let carouselWidth: number | null = null;

  if (dimensions) {
    carouselWidth = !curVisibleAmount
      ? dimensions.imgWidth
      : dimensions.imgWidthWithGap * curVisibleAmount - dimensions.gap;
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

  const moveElement = (
    e: MouseEvent<HTMLElement> | TouchEvent<Element>,
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

  return {
    refs: { carouselRef, imagesRef },
    slides: {
      visibleAmount, currImgNum, visibleImages, translate, curTransitionDur, carouselWidth,
      showNavigation: imagesData?.length > curVisibleAmount,
      hasMultipleImages: imagesData?.length > 1,
    },
    actions: { next: slideNextHandler, previous: slidePrevHandler, goTo: scrollToImageHandler },
    gestures: { onStart: mouseDownHandler, onMove: moveElement, onEnd: mouseUp },
  };
};

export default useCarouselNavigation;
