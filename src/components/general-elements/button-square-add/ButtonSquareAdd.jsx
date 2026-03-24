import { useDispatch, useSelector } from "react-redux";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";

import classes from "./ButtonSquareAdd.module.scss";
import {
  addImageToPanel,
  addModelToPanel,
  removeImageFromPanel,
  removeModelFromPanel,
} from "../../../store/usedModels";
import { SETTINGS_REF_IMAGE_AMOUNT } from "../../../variables/constants";
import ButtonSquare from "../../ui/buttons/ButtonSquare";
import { getUrlId } from "../../../utils/imageUtils";
import { createSidebarPreviewData } from "../../../utils/modelUtils";

/**
 * Sidebar toggle button component.
 *
 * Toggles adding or removing an item from the sidebar.
 * Detects whether the item is already present and dispatches the appropriate action.
 * Visually indicates the current sidebar state of the item.
 *
 * Responsibilities:
 * - Determines whether the item exists in the sidebar.
 * - Dispatches add or remove sidebar actions.
 * - Reflects the active state in the UI.
 *
 * @component
 *
 * @param {object} props
 * @param {object | null} props.previewData - Preview data for the model, collection, or image.
 * @param {('image' | 'model' | 'collection')} [props.type] - Type of sidebar item.
 * @param {number} [props.versionId] - Model version ID (used when type is "model").
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {JSX.Element} Sidebar toggle button.
 */
const ButtonAdd = ({ type, previewData, versionId, className, ...props }) => {
  const modelsInPanel = useSelector((state) => state.used.models);
  const imagesInPanel = useSelector((state) => state.used.images);

  //Parce uniq ID from video url (to have a unique value due to another Civitai bug with the same hash for all videos in a post)
  const uniqUrlPart = getUrlId(previewData?.url);

  const isInPanel =
    type === "image"
      ? imagesInPanel?.find((image) => {
          if (previewData?.type === "video") {
            return uniqUrlPart && image.url.includes(uniqUrlPart);
          }
          return image?.hash === previewData?.hash;
        })
      : modelsInPanel?.find((model) => model?.id === previewData?.id);

  const dispatch = useDispatch();

  const addToSidePanelHandler = () => {
    if (
      !isInPanel &&
      type === "image" &&
      imagesInPanel?.length < SETTINGS_REF_IMAGE_AMOUNT
    ) {
      dispatch(addImageToPanel(previewData, previewData?.url));
      return;
    } else if (isInPanel && type === "image") {
      dispatch(removeImageFromPanel(previewData.hash, previewData?.url));
      return;
    }

    if (!isInPanel && type !== "image" && previewData) {
      let curVersionData =
        previewData?.modelVersionsCustomData &&
        Object.values(previewData.modelVersionsCustomData)
          .filter((data) => data.downloadStatus)
          .toSorted((a, b) => b.versionId - a.versionId)[0];

      const sidePanelData = createSidebarPreviewData(
        versionId,
        previewData,
        curVersionData,
      );

      dispatch(addModelToPanel(sidePanelData));
    } else {
      dispatch(removeModelFromPanel(previewData?.id));
    }
  };

  return (
    <ButtonSquare
      className={`${classes["resource__add"]} ${
        isInPanel ? classes["resource__add--active"] : ""
      }
        ${className || ""}`}
      disabled={
        imagesInPanel?.length >= SETTINGS_REF_IMAGE_AMOUNT &&
        !isInPanel &&
        type === "image"
      }
      onClick={addToSidePanelHandler}
      title="Add to sidebar"
      {...props}
    >
      {!isInPanel && previewData && <PlusIcon className={classes.icon} />}
      {isInPanel && <CheckIcon className={classes.icon} />}
    </ButtonSquare>
  );
};

export default ButtonAdd;
