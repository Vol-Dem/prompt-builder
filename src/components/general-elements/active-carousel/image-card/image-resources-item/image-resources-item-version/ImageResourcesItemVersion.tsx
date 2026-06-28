import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import Tooltip from "../../../../../ui/Tooltip";
import classes from "./ImageResourcesItemVersion.module.scss";
import type { ImageResourceData } from "../../../../../../types/images.types";

type ImageResourcesItemVersionProps = {
  resource: ImageResourceData;
  versionName?: string | null;
  versionIsSaved: boolean;
};

/**
 * Image resources version name component.
 *
 * Renders image resource version name and saved status icon.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.resource - Resource data.
 * @param {string} props.versionName - Version name.
 * @param {boolean} props.versionIsSaved - If current model version is saved.
 * @returns {JSX.Element} Image resources version name.
 */
const ImageResourcesItemVersion = ({
  resource,
  versionName,
  versionIsSaved,
}: ImageResourcesItemVersionProps) => {
  let tooltip = "Version downloaded";
  let icon = (
    <CheckCircleIcon
      className={`${classes["version-svg"]} ${classes["version-svg--saved"]}`}
    />
  );

  if (!versionIsSaved) {
    tooltip = "Version not downloaded";
    icon = <ExclamationCircleIcon className={classes["version-svg"]} />;
  }

  if (!resource?.preview) {
    tooltip = "Model not downloaded";
    icon = (
      <XCircleIcon
        className={`${classes["version-svg"]} ${classes["version-svg--not-saved"]}`}
      />
    );
  }

  return (
    <Tooltip
      className={classes["tooltip--align-left"]}
      defSide="left"
      content={<div className={classes["version-tooltip"]}>{tooltip}</div>}
    >
      <div className={classes["version"]}>
        {icon}
        <span className={classes["version-name"]}>
          {versionName || resource?.versionName}
        </span>
      </div>
    </Tooltip>
  );
};

export default ImageResourcesItemVersion;
