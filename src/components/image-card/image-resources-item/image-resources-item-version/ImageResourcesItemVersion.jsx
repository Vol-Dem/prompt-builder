import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "../../../ui/Tooltip";
import classes from "./ImageResourcesItemVersion.module.scss";

const ImageResourcesItemVersion = ({
  resource,
  versionName,
  versionIsSaved,
}) => {
  return (
    <Tooltip
      className={classes["tooltip--align-left"]}
      defSide="left"
      content={
        <div className={classes["version-tooltip"]}>
          {`${
            versionIsSaved ? "Version downloaded" : "Version not downloaded"
          }`}
        </div>
      }
    >
      <div className={classes["version"]}>
        {!versionIsSaved && !!resource?.preview && (
          <ExclamationCircleIcon className={classes["version-svg"]} />
        )}
        {versionIsSaved && (
          <CheckCircleIcon
            className={`${classes["version-svg"]} ${classes["version-svg--saved"]}`}
          />
        )}{" "}
        <span className={classes["version-name"]}>
          {versionName || resource?.versionName}
        </span>
      </div>
    </Tooltip>
  );
};

export default ImageResourcesItemVersion;
