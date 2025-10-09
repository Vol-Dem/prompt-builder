import { SETTINGS_CAROUSEL_TRANSITION_DURATION } from "../../../variables/constants";
import classes from "./CarouselPagination.module.scss";

const CarouselPagination = ({
  images,
  currImgIndex,
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
