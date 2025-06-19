import { useDispatch, useSelector } from "react-redux";
import Image from "../../ui/image/Image";
import classes from "./CarouselImageList.module.scss";
import { modelActions } from "../../../store/model";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";
import { useRef } from "react";
import CarouselImage from "../carousel-image/CarouselImage";
import ButtonAdd from "../../ui/ButtonSquareAdd";

const IMAGE_HEIGHT = 250;

const CarouselImageList = ({ images }) => {
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const dispatch = useDispatch();

  // const [imageContainerWidtht, setImageContainerWidth] = useState(null);
  // const imageContainerRef = useRef(null);
  // console.log(imageData.data);
  // const { previewSrc, previewVideoWebmSrc, previewVideoMp4Src } =
  //   transformSrcPreview(
  //     imageData.data.url,
  //     SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  //     imageData.data.type
  //   );

  // useLayoutEffect(() => {
  //   if (imageContainerRef?.current?.offsetHeight)
  //     setImageContainerWidth(
  //       (imageContainerRef?.current?.offsetHeight / imageData.height) *
  //         imageData.width
  //     );
  // }, [imageContainerRef?.current?.offsetHeight, imageData]);

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
    // const imageContainerWidtht = (IMAGE_HEIGHT / image.height) * image.width;

    return (
      <li
        key={image.id}
        // ref={imageContainerRef}
        className={classes["image-container"]}
        data-position={i}

        // style={{
        //   height: IMAGE_HEIGHT,
        //   width: imageContainerWidtht ? `${imageContainerWidtht}px` : null,
        // }}
      >
        <Image
          onClick={openImageHandler}
          className={classes.image}
          imageData={image}
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
