import { useDispatch, useSelector } from "react-redux";

import Image from "../../../ui/image/Image";
import classes from "./CarouselImageList.module.scss";
import { modelActions } from "../../../../store/model";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../../variables/constants";
import ButtonAdd from "../../button-square-add/ButtonSquareAdd";

/**
 * Carousel image list component.
 *
 * Renders a grid/list of post image previews.
 * When a preview is clicked, opens the `ActiveCarousel` popup and sets the clicked
 * image as the active slide.
 * Each image item also provides a button to add or remove the image from the sidebar.
 *
 * Responsibilities:
 * - Displays preview thumbnails for all post images.
 * - Opens the carousel with the correct active image on click.
 * - Integrates sidebar add/remove functionality per image.
 *
 * Side effects:
 * - Dispatches `setActiveCarouselData` to update global carousel state.
 *
 * @component
 *
 * @param {object} props
 * @param {Array<object>} props.images - List of post images.
 * @returns {JSX.Element} Carousel image list.
 */
const CarouselImageList = ({ images }) => {
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData,
  );
  const dispatch = useDispatch();

  const openImageHandler = (position) => {
    dispatch(
      modelActions.setActiveCarouselData({
        ...activeCarouselData,
        currImgNum: +position,
      }),
    );
  };

  const imagesHtml = images.map((image, i) => {
    return (
      <li
        key={image?.id || image?.hash || i}
        className={classes["image-container"]}
      >
        <Image
          onClick={() => openImageHandler(i)}
          className={classes.image}
          src={image?.url}
          imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
          width={image.width}
          height={image.height}
          imgType={image.type}
        />
        <ButtonAdd
          className={classes["btn-add"]}
          previewData={image}
          type="image"
        />
      </li>
    );
  });
  return (
    <div>
      <ul className={classes.list}>{imagesHtml}</ul>
    </div>
  );
};

export default CarouselImageList;
