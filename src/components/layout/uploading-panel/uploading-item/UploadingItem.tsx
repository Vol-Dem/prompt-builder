import { Link } from "react-router-dom";

import Image from "../../../ui/image/Image";
import classes from "./UploadingItem.module.scss";
import type { UploadingItem as UploadingItemType } from "../../../../types/upload.types";

type UploadingItemProps = {
  data: UploadingItemType;
  curPostId: number | null;
  rejected?: boolean;
  completed?: boolean;
};

/**
 * Uploading queue item card.
 *
 * Renders a preview card inside the uploading dropdown list and reflects
 * the current upload state (uploading, rejected, or completed).
 *
 * @component
 *
 * @param props
 * @param props.data - Image post data associated with this queue item.
 * @param props.curPostId - ID of the post currently being uploaded.
 * @param props.rejected - Indicates whether the upload has failed.
 * @param props.completed - Indicates whether the upload has finished successfully.
 *
 * @returns The uploading queue item card.
 */
const UploadingItem = ({
  data,
  curPostId,
  rejected,
  completed,
}: UploadingItemProps) => {
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
          <Image
            className={classes["img-container"]}
            src={data.imgUrl}
            type={data.imgType}
            imgType={data.imgType}
          />
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
