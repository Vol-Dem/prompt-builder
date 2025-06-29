import { useDispatch, useSelector } from "react-redux";
import Image from "../../ui/image/Image";
import classes from "./CarouselImageList.module.scss";
import { modelActions } from "../../../store/model";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";
import ButtonAdd from "../../ui/ButtonSquareAdd";

const CarouselImageList = ({ images }) => {
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const dispatch = useDispatch();

  const openImageHandler = (e) => {
    const imageConatiner = e.target.closest(`.${classes["image-container"]}`);
    const imgNum = imageConatiner?.dataset?.position;

    dispatch(
      modelActions.setActiveCarouselData({
        ...activeCarouselData,
        currImgNum: +imgNum,
      })
    );
  };

  const imagesHtml = images.map((image, i) => {
    return (
      <li
        key={image.id}
        className={classes["image-container"]}
        data-position={i}
      >
        <Image
          onClick={openImageHandler}
          className={classes.image}
          src={image?.url}
          imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
          width={image.width}
          height={image.height}
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
