import { useDispatch, useSelector } from "react-redux";
import classes from "./ButtonAdd.module.scss";
import {
  addImageToPanel,
  addModelToPanel,
  removeImageFromPanel,
  removeModelFromPanel,
} from "../../store/usedModels";
import { useState } from "react";

const ButtonAdd = ({ previewData, type, className, versionId }) => {
  // const [isInPanel, setIsInPanel] = useState()
  const modelsInPanel = useSelector((state) => state.used.models);
  const imagesInPanel = useSelector((state) => state.used.images);
  const isInPanel =
    type === "image"
      ? imagesInPanel?.find((image) => image?.hash === previewData?.hash)
      : // ? imagesInPanel?.find((image) => image?.id === previewData?.id)
        modelsInPanel?.find((model) => model?.id === previewData?.id);

  // const isInPanel = modelsInPanel?.find(
  //   (model) => model?.id === previewData?.id
  // );
  const imageIsInPanel = imagesInPanel?.find(
    (image) => image?.id === previewData?.id
  );
  const dispatch = useDispatch();

  const addToSidePanelHandler = (e) => {
    console.log(previewData);
    if (!isInPanel && type === "image") {
      dispatch(addImageToPanel(previewData));
      return;
    } else if (isInPanel && type === "image") {
      dispatch(removeImageFromPanel(previewData.hash));
      return;
    }
    // const modelId = e.target.closest(`.${classes["resource__add"]}`)?.dataset
    //   ?.id;
    // console.log(modelId);
    // const previewData = imageResources.find(
    //   (resource) => resource?.preview?.id === +modelId
    // )?.preview;
    if (!isInPanel && type !== "image") {
      let curVersionData =
        previewData?.modelVersionsCustomData &&
        Object.values(previewData.modelVersionsCustomData)
          .filter((data) => data.downloadStatus)
          .toSorted((a, b) => b.versionId - a.versionId)[0];

      const sidePanelData = {
        id: previewData?.id,
        activeVersionId: versionId,
        src: previewData?.src,
        main: previewData?.main,
        sub: previewData?.sub,
        title: previewData?.name || previewData.title,
        versionName: curVersionData?.name || previewData?.versionName || "",
        imgUrl: previewData?.customPreviewImgUrl || previewData?.imgUrl,
        nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl || null,
        type: previewData?.modelType,
        baseModel: curVersionData?.baseModel || previewData?.baseModel,
        mainTag: curVersionData?.mainTag || previewData?.mainTag,
        weight: curVersionData?.weight || previewData?.weight,
        minWeight: curVersionData?.minWeight || previewData?.minWeight,
        maxWeight: curVersionData?.maxWeight || previewData?.maxWeight,
        size: curVersionData?.size || previewData?.size,
        tags: curVersionData?.trainedWords || previewData?.tags,
        helperTags: curVersionData?.helperTags || previewData?.helperTags,
        updatedAt: previewData?.updatedAt,
      };
      dispatch(addModelToPanel(sidePanelData));
    } else {
      dispatch(removeModelFromPanel(previewData?.id));
    }
  };

  return (
    <div
      className={`${classes["resource__add"]} ${
        isInPanel ? classes["resource__add--active"] : ""
      } ${className || ""}`}
      onClick={addToSidePanelHandler}
    >
      {/* <span
        className={`${classes["plus"]} ${
          isInPanel ? classes["plus--active"] : ""
        }`}
      ></span> */}
      {!isInPanel && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      )}
      {isInPanel && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      )}
      {/* {isInPanel && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      )} */}
    </div>
  );
};

export default ButtonAdd;
