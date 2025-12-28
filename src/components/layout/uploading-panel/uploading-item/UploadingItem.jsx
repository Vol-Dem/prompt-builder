import { Link } from "react-router-dom";

import Image from "../../../ui/image/Image";
import classes from "./UploadingItem.module.scss";

const UploadingItem = ({ data, curPostId, rejected, completed }) => {
  return (
    <li
      className={`${classes["uploading-list__item"]} ${
        data.postId === curPostId || completed
          ? classes["uploading-list__item--active"]
          : ""
      } ${rejected ? classes["uploading-list__item--rejected"] : ""}`}
    >
      <div className={classes["uploading-list__link"]}>
        <>
          <Image className={classes["img-container"]} src={data.imgUrl} />
        </>
        <div className={classes["uploading-list__content"]}>
          <div className={classes["uploading-list__name"]}>
            ID: {data.postId}
          </div>
          {!data?.collectionData?.collectionData?.id && (
            <Link
              to={`/models/${data?.modelId}`}
              className={classes["uploading-list__collection"]}
            >
              {data.modelName}
            </Link>
          )}
          {data?.collectionData?.collectionData?.id && (
            <Link
              to={`/images/${data.collectionData.collectionData.id}`}
              className={classes["uploading-list__collection"]}
            >
              {data.collectionData.collectionData.name}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};

export default UploadingItem;
