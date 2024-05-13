import { useEffect } from "react";
import classes from "./ActiveCarousel.module.scss";
import { useSelector } from "react-redux";
import Carousel from "../carousel/Carousel";

const ActiveCarousel = () => {
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const model = useSelector((state) => state.model.model);

  const isSaved =
    activeCarouselData?.versionId &&
    model?.savedImages?.hasOwnProperty(activeCarouselData?.versionId) &&
    model?.savedImages[activeCarouselData?.versionId]?.find(
      (post) => post.postId === activeCarouselData.postId
    );

  useEffect(() => {
    if (!!activeCarouselData?.images?.length) {
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
      {!!activeCarouselData?.images?.length && (
        <Carousel
          images={activeCarouselData?.images}
          versionId={activeCarouselData.versionId}
          existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
          postId={!isSaved ? activeCarouselData.postId : null}
          modelId={activeCarouselData.modelId}
          visibleImgAmount={1}
          isOpen={true}
          activeImgNum={activeCarouselData.currImgNum}
        />
      )}
    </>
  );
};

export default ActiveCarousel;
