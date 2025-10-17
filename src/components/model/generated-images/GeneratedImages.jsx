import { memo, useEffect, useState } from "react";
import classes from "./GeneratedImages.module.scss";
import { useSelector } from "react-redux";
import Modal from "../../ui/Modal";
import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import Buttton from "../../ui/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import {
  GUIDE_STEP_GENERATED_IMAGES,
  ERROR_MESSAGE_OFFLINE,
} from "../../../variables/constants";
import GeneratedImagesGuide from "../../ui/guide/model/GeneratedImagesGuide";
import { AnimatePresence } from "framer-motion";
import SavedImages from "./saved-images/SavedImages";
import ExternalImages from "./external-images/ExternalImages";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoGeneratedImages from "../../ui/guide/info/InfoGeneratedImages";
import ModelVersionsList from "../model-versions-list/ModelVersionsList";
import ImageTabs from "./image-tabs/ImageTabs";

const imageSortValue = "Newest";

const GeneratedImages = memo(() => {
  const [errorMessage, setErrorMessage] = useState("");
  const [curTab, setCurTab] = useState("all");
  const [addImgModalIsOpen, setAddImgModalIsOpen] = useState(false);
  const curVersion = useSelector((state) => state.model.curVersion);
  const [curVersionId, setCurVersionId] = useState(curVersion.id);
  const model = useSelector((state) => state.model.model);
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const savedImages =
    model?.id && model.id === savedImagesData?.modelId
      ? savedImagesData.data
      : null;
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const isOnline = useOnlineStatus();

  let versionsCustomData =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)?.sort(
      (a, b) => a?.index - b?.index
    );

  if (curTab === "saved") {
    versionsCustomData = versionsCustomData.filter((version) => {
      const isSaved =
        savedImages &&
        Object.keys(savedImages).includes(`${version.versionId}`);
      return curTab === "saved" && isSaved;
    });
  }

  useEffect(() => {
    if (curVersion?.id) setCurVersionId(curVersion.id);
  }, [curVersion]);

  const openVersionHandler = (e) => {
    if (+e.target.id === curVersionId) return;
    setErrorMessage("");
    setCurVersionId(+e.target.id);
  };

  const switchCurTab = (e) => {
    if (curTab === e.target.dataset.tab) return;
    setErrorMessage("");
    setCurTab(e.target.dataset.tab);
    if (
      e.target.dataset.tab !== "all" &&
      !savedImages.hasOwnProperty(curVersionId)
    ) {
      const latesVersionId = Object.values(model.modelVersionsCustomData)
        .sort((a, b) => a?.index - b?.index)
        .find((version) =>
          savedImages.hasOwnProperty(version.versionId)
        )?.versionId;
      if (latesVersionId) {
        setCurVersionId(latesVersionId);
      }
    }
  };

  const addImgByIdHandler = () => {
    setAddImgModalIsOpen(true);
  };

  return (
    <div className={classes.container}>
      <div className={classes["controls"]}>
        <ImageTabs curTab={curTab} onClick={switchCurTab} />
        <Buttton className={classes["button-add"]} onClick={addImgByIdHandler}>
          Add Image by ID
        </Buttton>
        <ButtonInfo>
          <InfoGeneratedImages />
        </ButtonInfo>
      </div>
      <ModelVersionsList
        onClick={openVersionHandler}
        itemComponent="span"
        versionsCustomData={versionsCustomData}
        curVersionId={curVersionId}
      />
      <div
        className={`${classes["images-container"]} ${
          guideIsActive && guideStep === GUIDE_STEP_GENERATED_IMAGES
            ? classes["images-container--guide"]
            : ""
        }`}
      >
        <GeneratedImagesGuide />
        <div className={classes.images}>
          {curTab === "all" && (
            <ExternalImages
              modelId={model.id}
              curImagesModelVersionId={curVersionId}
              sortBy={imageSortValue}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
          {curTab === "saved" && (
            <SavedImages
              modelId={model.id}
              curImagesModelVersionId={curVersionId}
              sortBy={imageSortValue}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
        </div>
      </div>
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <AnimatePresence>
        {addImgModalIsOpen && (
          <Modal
            title="Add images by Post ID"
            onClose={() => {
              setAddImgModalIsOpen(false);
            }}
          >
            <SaveImageForm
              modelData={model}
              curVersion={curVersionId}
              location="models"
              savedModelPosts={savedImagesData.data}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GeneratedImages;
