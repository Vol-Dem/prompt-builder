import { memo, useEffect, useRef, useState } from "react";
import classes from "./GeneratedImages.module.scss";
import { useSelector } from "react-redux";
import Modal from "../../ui/Modal";
import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import Buttton from "../../ui/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import ButtonTertiary from "../../ui/ButtonTertiary";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import {
  GUIDE_STEP_GENERATED_IMAGES,
  ERROR_MESSAGE_OFFLINE,
} from "../../../variables/constants";
import GeneratedImagesGuide from "../../ui/guide/model/GeneratedImagesGuide";
import { AnimatePresence } from "framer-motion";
import SavedImages from "./saved-images/SavedImages";
import ExternalImages from "./external-images/ExternalImages";

const GeneratedImages = memo(({ customData }) => {
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [curExampleImgsType, setCurExampleImgsType] = useState("all");
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState(null);
  const [imagesSortValue, setImagesSortValue] = useState("Newest");
  const [addImgModalIsOpen, setAddImgModalIsOpen] = useState(false);
  const [isShowAll, setIsShowAll] = useState(false);
  const [savedImages, setSavedImages] = useState({});
  const model = useSelector((state) => state.model.model);
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const curVersion = useSelector((state) => state.model.curVersion);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const versionsListRef = useRef(null);
  const versionsItemRef = useRef(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (model?.id && model.id === savedImagesData?.modelId) {
      setSavedImages(savedImagesData.data);
    } else {
      setSavedImages({});
    }
  }, [model?.id, savedImagesData]);

  useEffect(() => {
    const showAll =
      versionsListRef?.current?.offsetHeight >
      versionsItemRef?.current?.offsetHeight;

    setIsShowAll(showAll);
  }, [
    versionsListRef?.current?.offsetHeight,
    versionsItemRef?.current?.offsetHeight,
    curExampleImgsType,
  ]);

  useEffect(() => {
    if (curVersion?.id) setCurImagesModelVersionId(curVersion.id);
  }, [curVersion, customData]);

  const openSavedVersionImagesHandler = (e) => {
    if (+e.target.id === curImagesModelVersionId) return;
    setErrorMessage("");
    //Temp
    if (e.target.id === "unsorted") {
      setCurImagesModelVersionId(e.target.id);
      return;
    }
    if (e.target.id === "all-versions") {
      setCurImagesModelVersionId(e.target.id);
      return;
    }

    setCurImagesModelVersionId(+e.target.id);
  };
  const switchCurExamples = (e) => {
    if (curExampleImgsType === e.target.dataset.example) return;
    setErrorMessage("");
    setCurExampleImgsType(e.target.dataset.example);
  };

  useEffect(() => {
    if (curExampleImgsType === "all") return;

    if (!curImagesModelVersionId) return;
    if (!savedImages.hasOwnProperty(curImagesModelVersionId)) {
      const latesVersionId = Object.values(model.modelVersionsCustomData)
        .sort((a, b) => a?.index - b?.index)
        .find((version) =>
          savedImages.hasOwnProperty(version.versionId)
        )?.versionId;
      if (latesVersionId) {
        setCurImagesModelVersionId(latesVersionId);
      }
    }
  }, [
    curImagesModelVersionId,
    curExampleImgsType,
    model,
    errorMessage,
    savedImages,
  ]);

  const modelImageVersionsHtml =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => a?.index - b?.index)
      .flatMap((version, i) => {
        const isSaved =
          savedImages &&
          Object.keys(savedImages).includes(`${version.versionId}`);
        const versionIsSaved = version.downloadStatus;

        if (curExampleImgsType === "saved" && !isSaved) {
          return [];
        }
        return (
          <li
            key={i}
            ref={versionsItemRef}
            id={version.versionId}
            data-version={i}
            onClick={openSavedVersionImagesHandler}
            className={`${classes.version} ${
              curImagesModelVersionId === version.versionId
                ? classes["version--active"]
                : ""
            }
        ${versionIsSaved ? classes["version--downloaded"] : ""}`}
          >
            {version.name}
          </li>
        );
      });

  const addImgByIdHandler = () => {
    setAddImgModalIsOpen(true);
  };

  const showAllVersionsHandler = () => {
    setShowAllVersions((prevState) => !prevState);
  };

  return (
    <div className={classes.container}>
      <div className={classes["controls"]}>
        <div className={classes["mode-switch"]}>
          <span
            className={`${classes["btn-mode"]} ${classes["btn-mode--left"]} ${
              curExampleImgsType === "saved" ? classes["btn-mode--active"] : ""
            }`}
            data-example="saved"
            onClick={switchCurExamples}
          >
            Saved
          </span>
          <span
            className={`${classes["btn-mode"]} ${classes["btn-mode--right"]} ${
              curExampleImgsType === "all" ? classes["btn-mode--active"] : ""
            }`}
            data-example="all"
            onClick={switchCurExamples}
          >
            All
          </span>
        </div>
        <Buttton className={classes["button-add"]} onClick={addImgByIdHandler}>
          Add Image by ID
        </Buttton>
      </div>
      <div
        className={classes["versions"]}
        style={{
          maxHeight: showAllVersions
            ? `${versionsListRef?.current?.offsetHeight + 2}px`
            : `${versionsItemRef?.current?.offsetHeight + 2}px`,
        }}
      >
        <ul ref={versionsListRef} className={classes["versions__list"]}>
          {modelImageVersionsHtml}
        </ul>
      </div>
      {isShowAll && (
        <ButtonTertiary
          onClick={showAllVersionsHandler}
          className={classes["btn-all"]}
        >
          {showAllVersions ? "Hide" : "Show All"}
        </ButtonTertiary>
      )}
      <div
        className={`${classes["images-container"]} ${
          guideIsActive && guideStep === GUIDE_STEP_GENERATED_IMAGES
            ? classes["images-container--guide"]
            : ""
        }`}
      >
        <GeneratedImagesGuide />
        <div className={classes.images}>
          {curExampleImgsType === "all" && (
            <ExternalImages
              modelId={model.id}
              curImagesModelVersionId={curImagesModelVersionId}
              sortBy={imagesSortValue}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
          {curExampleImgsType === "saved" && (
            <SavedImages
              modelId={model.id}
              curImagesModelVersionId={curImagesModelVersionId}
              sortBy={imagesSortValue}
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
            title="Add images by ID"
            onClose={() => {
              setAddImgModalIsOpen(false);
            }}
          >
            <SaveImageForm
              modelData={model}
              curVersion={curImagesModelVersionId}
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
