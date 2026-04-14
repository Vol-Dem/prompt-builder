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
    versionId: number;
    saved: boolean;
    active: boolean;
    side: boolean;
    imageWidth?: number;
    location: ResourceFirestoreCollection;
    locationId: number;
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
 * @param {object} props
 * @param {Array<number>} props.visibleImages - Indexes of currently visible images.
 * @param {boolean} props.caruselIsVisible - Whether carousel is currently in viewport.
 * @param {number} props.translate - Current translateX value.
 * @param {number} props.transitionDur - Slide transition duration.
 * @param {Array<object>} props.images - List of post images.
 * @param {number} [props.visibleAmount] - Number of visible images.
 * @param {boolean} props.active - Whether carousel is open.
 * @param {boolean} props.saved - Whether images were loaded from application DB.
 * @param {boolean} props.side - Whether carousel is opened from sidebar.
 * @param {number} props.versionId - Model version ID.
 * @param {number} props.imageWidth - Requested image width.
 * @param {'models' | 'collections'} props.location - Firestore collection name.
 * @param {number} props.locationId - Firestore document ID.
 * @param {(position: number) => void} props.onClick - Callback when image clicked.
 * @param {() => void} props.onOpen - Callback when image opened.
 * @param {(ids: number[], postId: number) => void} props.onDelete - Callback on delete.
 *
 * @returns {JSX.Element} Carousel images container.
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
