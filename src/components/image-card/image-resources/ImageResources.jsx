import classes from "./ImageResources.module.scss";
import ErrorMessage from "../../ui/ErrorMessage";
import ImageCardResourcesGuide from "../../ui/guide/model/ImageCardResourcesGuide";
import { GUIDE_STEP_IMAGE_RESOURCES } from "../../../variables/constants";
import { motion } from "framer-motion";
import ImageResourcesItem from "../image-resources-item/ImageResourcesItem";
import { useEffect, useRef, useState } from "react";
import { clearFileExtension, handleErrors } from "../../../utils/generalUtils";
import Spinner from "../../ui/Spinner";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoResources from "../../ui/guide/info/InfoResources";
import { useSelector } from "react-redux";
import { parseMoelType } from "../../../utils/modelUtils";
import { getImageInfo } from "../../../utils/fetch/fetchImages";
import { fetchResourcesInfoFromDB } from "../../../utils/fetch/fetchImages";

const timeoutDelay = 1000;

const ImageResources = ({ imageData, onReset }) => {
  const [imageResources, setImageResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [civConnectionError, setCivConnectionError] = useState(false);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const uid = useSelector((state) => state.auth.user.uid);
  const resourcesRef = useRef(null);
  const timeoutRef = useRef(null);

  const updateImageResources = (previewData) => {
    setImageResources((prevState) => {
      const updatedResourceIndex = prevState.findIndex(
        (resource) => resource.modelId === previewData.id
      );

      if (updatedResourceIndex < 0) return prevState;

      const updatedResource = [...prevState];
      prevState[updatedResourceIndex].preview = previewData;

      return updatedResource;
    });
  };

  const resourcesHtml = imageResources?.map((resource, i) => {
    const versiondId = resource?.modelVersionId || resource?.versionId;

    let versionIsSaved;
    let versionName;
    let versionIdByName;
    let modelType;

    if (resource?.type?.includes("{")) {
      modelType = parseMoelType(resource.type);
    } else {
      modelType = resource.type;
    }

    if (
      versiondId &&
      resource?.preview?.modelVersionsCustomData?.hasOwnProperty(
        `${versiondId}`
      )
    ) {
      versionIsSaved =
        resource.preview.modelVersionsCustomData[versiondId].downloadStatus;
      versionName =
        resource.preview.modelVersionsCustomData[versiondId]?.versionName;
    } else {
      const curVersion =
        resource?.preview?.modelVersionsCustomData &&
        Object.values(resource?.preview?.modelVersionsCustomData).find(
          (version) =>
            clearFileExtension(version.defFileName) ===
            clearFileExtension(resource?.name)?.toLowerCase()
        );
      versionIsSaved = curVersion?.downloadStatus;
      versionName = curVersion?.versionName;
      versionIdByName = curVersion?.id;
    }
    const version = versiondId || versionIdByName;

    return (
      <ImageResourcesItem
        key={i}
        resource={resource}
        version={version}
        versionName={versionName}
        modelType={modelType}
        versionIsSaved={versionIsSaved}
        civConnectionError={civConnectionError}
        onReset={onReset}
        onUpdateResources={updateImageResources}
      />
    );
  });

  useEffect(() => {
    setImageResources([]);

    if (imageData?.url) {
      setErrorMessage("");

      const fetchResourcesInfo = async (curImageData) => {
        let resourcesInfo = [];

        setIsLoading(true);
        setCivConnectionError(false);

        try {
          resourcesInfo = await getImageInfo(curImageData);
        } catch (err) {
          handleErrors(err);
          setCivConnectionError(true);
          try {
            resourcesInfo = await fetchResourcesInfoFromDB(curImageData);
          } catch (err) {
            handleErrors(err);
          }
        }

        if (curImageData?.id === imageData?.id) {
          setImageResources(resourcesInfo);
        }

        setIsLoading(false);
      };

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fetchResourcesInfo(imageData);
      }, timeoutDelay);
    }
  }, [imageData, uid]);

  return (
    <>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
      {!isLoading && !!resourcesHtml?.length && (
        <div ref={resourcesRef}>
          <div className={classes["title-container"]}>
            <h4 className={classes["h4"]}>Resources:</h4>
            <ButtonInfo className={classes["info-btn"]}>
              <InfoResources />
            </ButtonInfo>
          </div>
          <motion.ul
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className={`${classes["example__resources"]} ${
              guideIsActive && guideStep === GUIDE_STEP_IMAGE_RESOURCES
                ? classes["example__resources--guide"]
                : ""
            }`}
          >
            {resourcesHtml}
            <ImageCardResourcesGuide />
          </motion.ul>
        </div>
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </>
  );
};

export default ImageResources;
