import { useEffect } from "react";
import classes from "./ActiveCarousel.module.scss";
import { useSelector } from "react-redux";
import Carousel from "../carousel/Carousel";
import ImageCard from "../image-card/ImageCard";

const ActiveCarousel = () => {
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const model = useSelector((state) => state.model.model);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);

  const isSaved =
    activeCarouselData?.versionId &&
    model?.savedImages?.hasOwnProperty(activeCarouselData?.versionId) &&
    model?.savedImages[activeCarouselData?.versionId]?.find(
      (post) => post.postId === activeCarouselData.postId
    );

  useEffect(() => {
    if (!!activeCarouselData?.images?.length) {
      console.log(activeCarouselData?.images);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = null;
    }
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
              images={activeCarouselData?.images}
              versionId={activeCarouselData?.versionId}
              existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
              postId={!isSaved ? activeCarouselData?.postId : null}
              modelId={activeCarouselData?.modelId}
              visibleImgAmount={1}
              imgIsOpen={true}
              activeImgNum={activeCarouselData?.currImgNum || 0}
              active={true}
              saved={activeCarouselData?.saved}
              // onDelete={activeCarouselData?.onDelete}
            />
          )}
          <ImageCard />
        </div>
      </div>
    </>
  );
};

export default ActiveCarousel;
