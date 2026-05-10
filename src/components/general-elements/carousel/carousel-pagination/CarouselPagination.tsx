import type { Image } from "../../../../../shared/types/image";
import classes from "./CarouselPagination.module.scss";

type CarouselPaginationProps = {
  images: Image[];
  onClick: (index: number) => void;
  visibleAmount: number;
  visibleImages: number[];
};

/**
 * Carousel pagination component.
 *
 * Renders carousel pagination.
 *
 * @component
 *
 * @param props
 * @param props.images - List of post images.
 * @param props.onClick - Callback when pagination clicked.
 * @param props.visibleImgAmount - Number of images visible at the same time.
 * @param props.visibleImages - Indexes of currently visible images.
 * @returns Carousel pagination.
 */
const CarouselPagination = ({
  images,
  onClick,
  visibleAmount,
  visibleImages,
}: CarouselPaginationProps) => {
  const paginationHtml = images?.map((_, i) => {
    const isActive =
      visibleImages.includes(visibleAmount + i) ||
      visibleImages.includes(i - images?.length + visibleAmount) ||
      visibleImages.includes(i + images?.length + visibleAmount);
    return (
      <li
        key={i}
        className={`${classes["pagination__item"]} ${
          isActive ? classes["pagination__item--active"] : ""
        }`}
        onClick={() => onClick(i)}
      ></li>
    );
  });
  return <ul className={classes.pagination}>{paginationHtml}</ul>;
};

export default CarouselPagination;
