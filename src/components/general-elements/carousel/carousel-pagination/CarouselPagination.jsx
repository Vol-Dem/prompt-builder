import classes from "./CarouselPagination.module.scss";

/**
 * Carousel pagination component.
 *
 * Renders carousel pagination.
 *
 * @component
 *
 * @param {object} props
 * @param {Array<object>} props.images - List of post images.
 * @param {(position: number) => void} props.onClick - Callback when pagination clicked.
 * @param {number} props.visibleImgAmount - Number of images visible at the same time.
 * @param {Array<number>} props.visibleImages - Indexes of currently visible images.
 * @returns {JSX.Element} Carousel pagination.
 */
const CarouselPagination = ({
  images,
  onClick,
  visibleAmount,
  visibleImages,
}) => {
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
