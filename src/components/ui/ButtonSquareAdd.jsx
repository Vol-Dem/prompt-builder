import { useDispatch, useSelector } from "react-redux";
import classes from "./ButtonSquareAdd.module.scss";
import {
  addImageToPanel,
  addModelToPanel,
  removeImageFromPanel,
  removeModelFromPanel,
} from "../../store/usedModels";
import { SETTINGS_REF_IMAGE_AMOUNT } from "../../variables/constants";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import ButtonSquare from "./ButtonSquare";

const ButtonAdd = ({
  previewData,
  type,
  className,
  modelId,
  versionId,
  onClick,
}) => {
  const modelsInPanel = useSelector((state) => state.used.models);
  const imagesInPanel = useSelector((state) => state.used.images);
  const isInPanel =
    type === "image"
      ? imagesInPanel?.find((image) => image?.hash === previewData?.hash)
      : modelsInPanel?.find((model) => model?.id === previewData?.id);

  const dispatch = useDispatch();

  const addToSidePanelHandler = (e) => {
    if (onClick) onClick(modelId);
    if (
      !isInPanel &&
      type === "image" &&
      imagesInPanel?.length < SETTINGS_REF_IMAGE_AMOUNT
    ) {
      dispatch(addImageToPanel(previewData));
      return;
    } else if (isInPanel && type === "image") {
      dispatch(removeImageFromPanel(previewData.hash));
      return;
    }

    if (!isInPanel && type !== "image" && previewData) {
      let curVersionData =
        previewData?.modelVersionsCustomData &&
        Object.values(previewData.modelVersionsCustomData)
          .filter((data) => data.downloadStatus)
          .toSorted((a, b) => b.versionId - a.versionId)[0];

      const sidePanelData = {
        id: previewData?.id,
        activeVersionId: versionId || null,
        src: previewData?.src || null,
        main: previewData?.main || null,
        sub: previewData?.sub || null,
        title: previewData?.name || previewData.title || null,
        versionName: curVersionData?.name || previewData?.versionName || null,
        imgUrl: previewData?.customPreviewImgUrl || previewData?.imgUrl || null,
        nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl || null,
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
    >
      {!isInPanel && previewData && <PlusIcon className={classes.icon} />}
      {isInPanel && <CheckIcon className={classes.icon} />}
    </ButtonSquare>
  );
};

export default ButtonAdd;
