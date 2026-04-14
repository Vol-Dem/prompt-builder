import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import ButtonSquare from "../../../../../ui/buttons/ButtonSquare";
import ButtonAdd from "../../../../button-square-add/ButtonSquareAdd";
import ButtonSquareSave from "../../../../../ui/buttons/ButtonSquareSave";
import classes from "./ImageResourcesItemButton.module.scss";
import Tooltip from "../../../../../ui/Tooltip";
import type { ImageResourceData } from "../../../../../../types/images.types";
import type { MouseEvent, ReactNode } from "react";

type ImageResourcesItemButtonProps = {
  resource: ImageResourceData;
  errorMessage: string | ReactNode;
  version?: number | null;
  versionName?: string | null;
  onOpen: (e: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Image resources button component.
 *
 * Renders a context-aware action button for an image resource.
 * If the model is already saved, the button adds or removes the item
 * from the sidebar. Otherwise, it opens the save-model flow.
 *
 * When the model is not available for saving, the button displays a disabled
 * state and shows an error tooltip on hover.
 *
 * Responsibilities:
 * - Displays the correct action based on model save state.
 * - Shows validation or availability errors on hover.
 * - Triggers the save-model popup when required.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.resource - Raw resource data extracted from image metadata.
 * @param {string | React.ReactNode} [props.errorMessage] - Error message shown when the model cannot be saved.
 * @param {number|string} props.version - Model version ID resolved from metadata or filename.
 * @param {string} [props.versionName] - Human-readable model version name.
 * @param {(e: MouseEvent<HTMLButtonElement>) => void} props.onOpen - Callback to open the save-model form.
 *
 * @returns {JSX.Element} Image resources action button.
 */
const ImageResourcesItemButton = ({
  resource,
  errorMessage,
  version,
  versionName,
  onOpen,
}: ImageResourcesItemButtonProps) => {
  let resorceButtonHtml: ReactNode;

  if (resource?.preview && version) {
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
