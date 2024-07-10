import { useEffect, useState } from "react";
import classes from "./ActiveCarousel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "../carousel/Carousel";
import ImageCard from "../image-card/ImageCard";
import { modelActions } from "../../store/model";

const ActiveCarousel = () => {
  const [activeImageNumber, setActiveImageNumber] = useState(null);
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const model = useSelector((state) => state.model.model);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const dispatch = useDispatch();

  const isSaved =
    activeCarouselData?.versionId &&
    model?.savedImages?.hasOwnProperty(activeCarouselData?.versionId) &&
    model?.savedImages[activeCarouselData?.versionId]?.find(
      (post) => post.postId === activeCarouselData.postId
    );

  useEffect(() => {
    const scrollTop = document.documentElement.scrollTop;
    const disableScrollHandler = (e) => {
      window.scrollTo(0, scrollTop);
    };
    if (!!activeCarouselData?.images?.length) {
      setActiveImageNumber(activeCarouselData.currImgNum);
      // document.body.style.overflow = "hidden";
      // document.body.style.paddingRight = "8px";

      window.addEventListener("scroll", disableScrollHandler);

      // document.body.classList.add("scroll-off");
    } else {
      window.removeEventListener("scroll", disableScrollHandler);
      // document.body.classList.remove("scroll-off");
      // document.body.style.paddingRight = "0";
      // document.body.style.overflow = null;
    }
    return () => {
      window.removeEventListener("scroll", disableScrollHandler);
    };
  }, [activeCarouselData]);

  //   const activeCarouselHtml = (
  //     <Carousel
  //       images={activeCarouselData?.images}
  //       versionId={activeCarouselData.versionId}
  //       existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
  //       postId={!isSaved ? activeCarouselData.postId : null}
  //       modelId={activeCarouselData.modelId}
  //       visibleImgAmount={1}
  //       isOpen={true}
  //     />
  //   );

  return (
    <>
      <div
        // className={classes.container}
        className={`${classes.container} ${
          !!activeCarouselData?.images?.length ? classes["container--open"] : ""
        }`}
        // style={
        //   carouselHeight && !imgIsOpen ? { height: `${carouselHeight}px` } : {}
        // }
        // onClick={openCarouselHandler}
      >
        <div
          // ref={wrapRef}
          className={`${classes.wrap}`}
          style={
            !!activeCarouselData?.images?.length
              ? {
                  height: `${
                    promptIsOpen ? "calc(100vh - 315px)" : "calc(100vh - 110px)"
                  }`,
                }
              : {}
          }
          // className={`${classes.wrap} ${imgIsOpen ? classes["wrap--open"] : ""}`}
        >
          {!!activeCarouselData?.images?.length && (
            <Carousel
              imagesData={activeCarouselData?.images}
              versionId={activeCarouselData?.versionId}
              existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
              postId={!isSaved ? activeCarouselData?.postId : null}
              modelId={activeCarouselData?.modelId}
              visibleImgAmount={1}
              imgIsOpen={true}
              activeImgNum={activeCarouselData?.currImgNum || 0}
              active={true}
              saved={activeCarouselData?.saved}
              onActiveNumChange={setActiveImageNumber}
              side={activeCarouselData?.side}
              // onDelete={activeCarouselData?.onDelete}
            />
          )}
          <ImageCard activeImgNum={activeImageNumber} />
          <div
            className={classes["btn__close"]}
            onClick={() => {
              dispatch(modelActions.setActiveCarouselData({}));
            }}
          >
            {/* <span className={classes["btn__cross"]}></span> */}
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActiveCarousel;
