import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import classes from "./ImageResources.module.scss";
import ErrorMessage from "../../../../ui/ErrorMessage";
import ImageCardResourcesGuide from "../../../guide/model/ImageCardResourcesGuide";
import { GUIDE_STEP_IMAGE_RESOURCES } from "../../../../../variables/constants";
import ImageResourcesItem from "../image-resources-item/ImageResourcesItem";
import {
  // clearFileExtension,
  handleErrors,
} from "../../../../../utils/generalUtils";
import Spinner from "../../../../ui/Spinner";
import ButtonInfo from "../../../../ui/buttons/ButtonInfo";
import InfoResources from "../../../info/InfoResources";
import { parseMoelType } from "../../../../../utils/modelUtils";
import { getImageInfo } from "../../../../../utils/fetch/fetchImages";
import { fetchResourcesInfoFromDB } from "../../../../../utils/fetch/fetchImages";
import { clearFileExtension } from "../../../../../../shared/utils";

const timeoutDelay = 1000;

/**
 * Image resources list component.
 *
 * Displays the list of resources (models, LoRAs, embeddings, etc.) that were used
 * to generate the currently active image.
 *
 * For each resource it tries to fetch extended metadata from the Civitai API and application database,
 * if the request fails, falls back to loading data only from the application database.
 * The component also tracks loading, error and connection states and updates
 * individual resource previews when they are modified.
 *
 * Responsibilities:
 * - Fetches resource metadata for the active image.
 * - Falls back to local database when Civitai API is unavailable.
 * - Resolves model version by ID or by filename match when version ID is missing.
 * - Displays loading state and error messages.
 * - Updates resource preview data when child items report changes.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.imageData - Metadata of the active image whose resources are displayed.
 * @returns {JSX.Element} Image resources list.
 */
const ImageResources = ({ imageData }) => {
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
        (resource) => resource.modelId === previewData.id,
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
      resource?.preview?.modelVersionsCustomData &&
      Object.hasOwn(resource.preview.modelVersionsCustomData, `${versiondId}`)
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
            clearFileExtension(resource?.name)?.toLowerCase(),
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
          // Fetches data for all image resources from Civitai API and app DB
          resourcesInfo = await getImageInfo(curImageData);
        } catch (err) {
          handleErrors(err);
          setCivConnectionError(true);
          try {
            // Fetches data for all image resources only from app DB
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
