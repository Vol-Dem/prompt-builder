import { forwardRef } from "react";
import CarouselImage from "../carousel-image/CarouselImage";
import classes from "./CarouselImages.module.scss";
import { useSelector } from "react-redux";

const CarouselImages = forwardRef(
  (
    {
      visibleAmount,
      images,
      visibleImages,
      caruselIsVisible = true,
      versionId,
      openCarouselHandler,
      saved,
      active,
      side,
      imageWidth,
      location,
      locationId,
      openDeleteListHandler,
      translate,
      curTransitionDur,
      openFullViewHandler,
    },
    ref
  ) => {
    const sfwValue = useSelector((state) => state.general.sfwValue);
    let imagesHtml = [];

    if (!!images?.length || !!visibleImages?.length || !!visibleAmount) {
      const imagesHtmlCenter = images.map((image, i) => {
        const src =
          (visibleImages.includes(i + visibleAmount) ||
            visibleImages.includes(i - images?.length + visibleAmount)) &&
          caruselIsVisible
            ? image.url
            : "";

        return (
          <CarouselImage
            key={image?.id + "c" + i}
            imageData={image}
            postId={images}
            saved={saved}
            active={!!active}
            versionId={versionId}
            onClick={openCarouselHandler}
            onDelete={openDeleteListHandler}
            onOpen={openFullViewHandler}
            id={image?.hash}
            dataset={i + visibleAmount}
            src={src}
            alt="example image"
            side={side}
            nsfw={
              image?.nsfw === false ||
              image?.nsfw === "None" ||
              image?.nsfwLevel === sfwValue ||
              image.nsfwLevel === 1
                ? false
                : true
            }
            imageWidth={imageWidth}
            location={location}
            locationId={locationId}
          />
        );
      });

      let imagesleft = [];
      let imagesRight = [];

      if (images.length >= +visibleAmount) {
        imagesRight = images.slice(0, visibleAmount).map((image, i) => {
          const src =
            visibleImages.includes(i + visibleAmount) && caruselIsVisible
              ? image.url
              : "";
          return (
            <CarouselImage
              key={image?.id + "r" + i}
              imageData={image}
              postId={images}
              saved={saved}
              active={!!active}
              versionId={versionId}
              onClick={openCarouselHandler}
              onDelete={openDeleteListHandler}
              onOpen={openFullViewHandler}
              id={image?.hash}
              dataset={i + visibleAmount}
              src={src}
              alt="example image"
              side={side}
              nsfw={
                image?.nsfw === false ||
                image?.nsfw === "None" ||
                image?.nsfwLevel === sfwValue ||
                image.nsfwLevel === 1
                  ? false
                  : true
              }
              imageWidth={imageWidth}
              location={location}
              locationId={locationId}
            />
          );
        });
        imagesleft = images.slice(-visibleAmount).map((image, i) => {
          const src =
            (visibleImages.includes(i) ||
              visibleImages.includes(i + images?.length)) &&
            caruselIsVisible
              ? image.url
              : "";
          return (
            <CarouselImage
              key={image?.id + "l" + i}
              imageData={image}
              postId={images}
              saved={saved}
              active={!!active}
              versionId={versionId}
              onClick={openCarouselHandler}
              onDelete={openDeleteListHandler}
              onOpen={openFullViewHandler}
              id={image?.hash}
              dataset={i}
              src={src}
              alt="example image"
              side={side}
              nsfw={
                image?.nsfw === false ||
                image?.nsfw === "None" ||
                image?.nsfwLevel === sfwValue ||
                image.nsfwLevel === 1
                  ? false
                  : true
              }
              imageWidth={imageWidth}
              location={location}
              locationId={locationId}
            />
          );
        });
      }

      imagesHtml = [...imagesleft, ...imagesHtmlCenter, ...imagesRight];
    }

    return (
      <>
        <div
          className={`${classes["carousel__images"]} `}
          style={{
            transform: `translate3D(${translate}px, 0, 0)`,
            transitionDuration: `${curTransitionDur}ms`,
          }}
          ref={ref}
        >
          {imagesHtml}
          {!imagesHtml.length && <div style={{ width: imageWidth }}></div>}
        </div>
      </>
    );
  }
);

export default CarouselImages;
