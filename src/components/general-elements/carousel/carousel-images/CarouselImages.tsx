import { type ComponentProps, type ReactNode } from "react";

import CarouselImage from "../carousel-image/CarouselImage";
import classes from "./CarouselImages.module.scss";
import { checkIsNsfw } from "../../../../utils/generalUtils";
import type { Image } from "../../../../../shared/types/image";
import type { ResourceFirestoreCollection } from "../../../../types/models.types";
import { useAppSelector } from "../../../../store/hooks/hooks";
import type { OverrideFields } from "../../../../../shared/types/general";

type CarouselImagesProps = OverrideFields<
  ComponentProps<"div">,
  {
    visibleAmount: number;
    images: Image[];
    visibleImages: number[];
    caruselIsVisible?: boolean;
    versionId: number | null;
    saved: boolean;
    active: boolean;
    side: boolean;
    imageWidth?: number;
    location: ResourceFirestoreCollection;
    locationId: number | null;
    translate: number;
    transitionDur: number;
    onClick: (position: number | null) => void;
    onOpen: () => void;
    onDelete: () => void;
  }
>;

/**
 * Carousel images container.
 *
 * Renders all carousel images including duplicated edge items for infinite scrolling.
 * Receives a list of currently visible image indexes and passes a valid `src` only to
 * those images. Non-visible images receive `"#"` so they are not loaded by the browser.
 *
 * Optimization:
 * - Prevents repeated network requests by ensuring each image is loaded only once.
 * - Loads duplicated edge images at the same time as originals to avoid animation
 *   flickering and double loading.
 *
 * @component
 *
 * @param props
 * @param props.visibleImages - Indexes of currently visible images.
 * @param props.caruselIsVisible - Whether carousel is currently in viewport.
 * @param props.translate - Current translateX value.
 * @param props.transitionDur - Slide transition duration.
 * @param props.images - List of post images.
 * @param props.visibleAmount - Number of visible images.
 * @param props.active - Whether carousel is open.
 * @param props.saved - Whether images were loaded from application DB.
 * @param props.side - Whether carousel is opened from sidebar.
 * @param props.versionId - Model version ID.
 * @param props.imageWidth - Requested image width.
 * @param props.location - Firestore collection name.
 * @param props.locationId - Firestore document ID.
 * @param props.onClick - Callback when image clicked.
 * @param props.onOpen - Callback when image opened.
 * @param props.onDelete - Callback on delete.
 *
 * @returns Carousel images container.
 */
const CarouselImages = ({
  visibleAmount,
  images,
  visibleImages,
  caruselIsVisible = true,
  saved,
  active,
  side,
  imageWidth,
  location,
  locationId,
  translate,
  transitionDur,
  onClick,
  onOpen,
  onDelete,
  ref,
}: CarouselImagesProps) => {
  const sfwValue = useAppSelector((state) => state.general.sfwValue);
  let imagesHtml: ReactNode[] = [];

  if (!!images?.length || !!visibleImages?.length || !!visibleAmount) {
    const imagesHtmlCenter = images.map((image, i) => {
      const src =
        (visibleImages.includes(i + visibleAmount) ||
          visibleImages.includes(i - images?.length + visibleAmount)) &&
        caruselIsVisible
          ? image.url
          : "#";
      const isNsfw = checkIsNsfw(image?.nsfw, image?.nsfwLevel, sfwValue);

      return (
        <CarouselImage
          key={image?.id + "c" + i}
          imageData={image}
          saved={saved}
          active={!!active}
          onClick={onClick}
          onDelete={onDelete}
          onOpen={onOpen}
          id={image?.hash || image?.id + ""}
          position={i + visibleAmount}
          src={src}
          alt="example image"
          side={side}
          nsfw={isNsfw}
          imageWidth={imageWidth}
          location={location}
          locationId={locationId}
        />
      );
    });

    let imagesleft: ReactNode[] = [];
    let imagesRight: ReactNode[] = [];

    if (images.length >= +visibleAmount) {
      imagesRight = images.slice(0, visibleAmount).map((image, i) => {
        const src =
          visibleImages.includes(i + visibleAmount) && caruselIsVisible
            ? image.url
            : "";
        const isNsfw = checkIsNsfw(image?.nsfw, image?.nsfwLevel, sfwValue);

        return (
          <CarouselImage
            key={image?.id + "r" + i}
            imageData={image}
            saved={saved}
            active={!!active}
            onClick={onClick}
            onDelete={onDelete}
            onOpen={onOpen}
            id={image?.hash || image?.id + ""}
            position={i + visibleAmount}
            src={src}
            alt="example image"
            side={side}
            nsfw={isNsfw}
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
        const isNsfw = checkIsNsfw(image?.nsfw, image?.nsfwLevel, sfwValue);

        return (
          <CarouselImage
            key={image?.id + "l" + i}
            imageData={image}
            saved={saved}
            active={!!active}
            onClick={onClick}
            onDelete={onDelete}
            onOpen={onOpen}
            id={image?.hash || image?.id + ""}
            position={i}
            src={src}
            alt="example image"
            side={side}
            nsfw={isNsfw}
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
          transitionDuration: `${transitionDur}ms`,
        }}
        ref={ref}
      >
        {imagesHtml}
        {!imagesHtml.length && <div style={{ width: imageWidth }}></div>}
      </div>
    </>
  );
};
export default CarouselImages;
