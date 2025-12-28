import { Link } from "react-router-dom";

import classes from "./ImageResourcesItemName.module.scss";

const ImageResourcesItemName = ({
  resource,
  version,
  onReset,
  versionName,
}) => {
  const resourceName =
    resource?.name ||
    resource?.modelVersionName ||
    resource?.modelVersionId ||
    resource?.hash;

  return (
    <>
      {resource?.preview && (
        <>
          <Link
            to={`/models/${resource?.preview?.id}${
              version ? `?versionId=${version}` : ""
            }`}
            state={{ versionId: version }}
            className={`${classes["link"]} ${classes["name"]}`}
            onClick={onReset}
            data-id={resource?.preview?.id}
          >
            {resource.preview.name}
          </Link>
        </>
      )}
      {!resource?.preview && !versionName && (
        <div
          className={classes["name"]}
          title={resource?.name || resource?.modelVersionId}
        >
          {resourceName}
        </div>
      )}
    </>
  );
};

export default ImageResourcesItemName;
