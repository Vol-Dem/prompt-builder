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

const ButtonAdd = ({
  previewData,
  type,
  className,
  modelId,
  versionId,
  onClick,
  ...props
}) => {
  const modelsInPanel = useSelector((state) => state.used.models);
  const imagesInPanel = useSelector((state) => state.used.images);
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
    if (onClick) onClick(modelId);
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

      const sidePanelData = {
        ...previewData,
        activeVersionId: versionId || null,
        title: previewData?.name || previewData.title || null,
        versionName: previewData?.versionName || curVersionData?.name || null,
        imgUrl: previewData?.customPreviewImgUrl || previewData?.imgUrl || null,
        type: previewData?.type || previewData?.modelType || null,
        baseModel: curVersionData?.baseModel || previewData?.baseModel || null,
        mainTag:
          curVersionData?.mainTag ||
          previewData?.mainTag ||
          curVersionData?.defActTag ||
          null,
        weight: curVersionData?.weight || previewData?.weight || null,
        minWeight: curVersionData?.minWeight || previewData?.minWeight || null,
        maxWeight: curVersionData?.maxWeight || previewData?.maxWeight || null,
        size: curVersionData?.size || previewData?.size || null,
        tags: curVersionData?.trainedWords || previewData?.tags || null,
        helperTags:
          curVersionData?.helperTags || previewData?.helperTags || null,
        updatedAt: previewData?.updatedAt || null,
      };
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
      title="Add to side panel"
      {...props}
    >
      {!isInPanel && previewData && <PlusIcon className={classes.icon} />}
      {isInPanel && <CheckIcon className={classes.icon} />}
    </ButtonSquare>
  );
};

export default ButtonAdd;
