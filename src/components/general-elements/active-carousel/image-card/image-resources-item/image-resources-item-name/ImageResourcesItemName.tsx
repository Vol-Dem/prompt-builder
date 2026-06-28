import { Link } from "react-router-dom";

import classes from "./ImageResourcesItemName.module.scss";
import type { ImageResourceData } from "../../../../../../types/images.types";
import type { MouseEvent } from "react";

type ImageResourcesItemNameProps = {
  resource: ImageResourceData;
  version?: number | null;
  versionName?: string | null;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Image resources name component.
 *
 * Renders image resource name with link to the model.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.resource - Resource data.
 * @param {number} props.version - Model version ID.
 * @param {string} props.versionName - Model version name.
 * @param {(e: MouseEvent<HTMLLinkElement>) => void} props.onClick - Callback to reset model data and currently opened carousel on navigation.
 * @returns {JSX.Element} Image resources name.
 */
const ImageResourcesItemName = ({
  resource,
  version,
  versionName,
  onClick,
}: ImageResourcesItemNameProps) => {
  const resourceName =
    resource.preview?.name ||
    resource?.name ||
    resource?.modelVersionName ||
    resource?.modelVersionId ||
    resource?.hash;

  const modelId = resource.preview?.id || resource?.modelId;
  const versionId = version || resource.modelVersionId || resource.versionId;

  return (
    <>
      {modelId && (
        <>
          <Link
            to={`/models/${modelId}${
              versionId ? `?versionId=${versionId}` : ""
            }`}
            state={{ versionId: version }}
            className={`${classes["link"]} ${classes["name"]}`}
            onClick={onClick}
            data-id={resource?.preview?.id}
          >
            {resourceName}
          </Link>
        </>
      )}
      {!resource?.preview && !versionName && !modelId && (
        <div
          className={classes["name"]}
          title={resource?.name || resource?.modelVersionId + "" || ""}
        >
          {resourceName}
        </div>
      )}
    </>
  );
};

export default ImageResourcesItemName;
