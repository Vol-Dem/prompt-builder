import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import ButtonSquare from "../../../ui/ButtonSquare";
import ButtonAdd from "../../../ui/ButtonSquareAdd";
import ButtonSquareSave from "../../../ui/ButtonSquareSave";
import classes from "./ImageResourcesItemButton.module.scss";
import Tooltip from "../../../ui/Tooltip";

const ImageResourcesItemButton = ({
  resource,
  errorMessage,
  version,
  versionName,
  onOpen,
}) => {
  let resorceButtonHtml;

  if (resource?.preview) {
    resorceButtonHtml = (
      <ButtonAdd
        previewData={{
          ...resource.preview,
          versionName: resource?.versionName || versionName,
          versionId: resource?.versionId || null,
        }}
        versionId={version}
        className={classes["btn"]}
      />
    );
  } else if (!resource?.preview && !versionName) {
    resorceButtonHtml = (
      <>
        {resource?.modelId &&
          (resource?.modelVersionId || resource?.versionId) && (
            <ButtonSquareSave className={classes["btn"]} onClick={onOpen} />
          )}
        {errorMessage && (
          <ButtonSquare
            className={`${classes["btn"]} ${classes["unavailable"]}`}
          >
            <Tooltip
              className={`${classes["tooltip"]} ${classes["tooltip--centered"]}`}
              defSide="left"
              content={errorMessage}
            >
              <ExclamationTriangleIcon />{" "}
            </Tooltip>
          </ButtonSquare>
        )}
      </>
    );
  }
  return <>{resorceButtonHtml}</>;
};

export default ImageResourcesItemButton;
