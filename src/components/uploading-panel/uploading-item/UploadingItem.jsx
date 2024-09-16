import Image from "../../ui/image/Image";
import classes from "./UploadingItem.module.scss";

const UploadingItem = ({ data, curPostId, rejected }) => {
  return (
    <li
      className={`${classes["uploading-list__item"]} ${
        data.postId === curPostId ? classes["uploading-list__item--active"] : ""
      } ${rejected ? classes["uploading-list__item--rejected"] : ""}`}
    >
      <div className={classes["uploading-list__link"]}>
        <>
          <Image className={classes["img-container"]} src={data.imgUrl} />
        </>
        <div className={classes["uploading-list__content"]}>
          <div className={classes["uploading-list__name"]}>{data.postId}</div>
          <div className={classes["uploading-list__model"]}>
            {data.modelName}
          </div>
        </div>
      </div>
    </li>
  );
};

export default UploadingItem;
