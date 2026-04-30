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
import type { ComponentProps } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { Image } from "../../../../shared/types/image";
import type {
  CollectionPreviewDoc,
  ModelPreview,
} from "../../../../shared/types/firestore";

type ButtonAddProps = ComponentProps<"button"> & {
  resourceType: "image" | "model" | "collection";
  previewData: Image | ModelPreview | CollectionPreviewDoc;
  versionId?: number;
};

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
 * @param props
 * @param props.previewData - Preview data for the model, collection, or image.
 * @param props.type - Type of sidebar item.
 * @param props.versionId - Model version ID (used when type is "model").
 * @param props.className - Optional CSS class name.
 * @returns Sidebar toggle button.
 */
const ButtonAdd = ({
  resourceType,
  previewData,
  versionId,
  className,
  ...props
}: ButtonAddProps) => {
  const modelsInPanel = useAppSelector((state) => state.used.models);
  const imagesInPanel = useAppSelector((state) => state.used.images);
  const dispatch = useAppDispatch();

  let uniqUrlPart = null;

  //Parce uniq ID from video url (to have a unique value due to another Civitai bug with the same hash for all videos in a post)
  if (previewData && "url" in previewData) {
    uniqUrlPart = getUrlId(previewData?.url);
  }

  const isInPanel =
    resourceType === "image"
      ? imagesInPanel?.find((image) => {
          if (
            previewData &&
            "type" in previewData &&
            previewData.type === "video"
          ) {
            return uniqUrlPart && image.url.includes(uniqUrlPart);
          }
          return (
            previewData &&
            "hash" in previewData &&
            image?.hash === previewData?.hash
          );
        })
      : modelsInPanel?.find((model) => model?.id === previewData?.id);

  const addToSidePanelHandler = () => {
    if ("url" in previewData) {
      if (
        !isInPanel &&
        resourceType === "image" &&
        imagesInPanel?.length < SETTINGS_REF_IMAGE_AMOUNT
      ) {
        dispatch(addImageToPanel(previewData, previewData?.url));
      } else if (isInPanel && resourceType === "image") {
        dispatch(removeImageFromPanel(previewData.hash, previewData?.url));
      }

      return;
    }

    if (!isInPanel && resourceType !== "image") {
      let curVersionData =
        "modelVersionsCustomData" in previewData &&
        previewData?.modelVersionsCustomData &&
        Object.values(previewData.modelVersionsCustomData)
          .filter((data) => data.downloadStatus)
          .toSorted((a, b) => b.versionId - a.versionId)[0];

      const sidePanelData = createSidebarPreviewData(
        versionId || null,
        previewData,
        curVersionData,
      );

      dispatch(addModelToPanel(sidePanelData));
    } else {
      dispatch(removeModelFromPanel(previewData.id));
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
        resourceType === "image"
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
