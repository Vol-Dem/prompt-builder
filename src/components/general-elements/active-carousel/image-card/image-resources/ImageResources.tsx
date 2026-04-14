import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import classes from "./ImageResources.module.scss";
import ErrorMessage from "../../../../ui/ErrorMessage";
import ImageCardResourcesGuide from "../../../guide/model/ImageCardResourcesGuide";
import { GUIDE_STEP_IMAGE_RESOURCES } from "../../../../../variables/constants";
import ImageResourcesItem from "../image-resources-item/ImageResourcesItem";
import {
  handleErrors,
  normalizeError,
} from "../../../../../utils/generalUtils";
import Spinner from "../../../../ui/Spinner";
import ButtonInfo from "../../../../ui/buttons/ButtonInfo";
import InfoResources from "../../../info/InfoResources";
import { parseMoelType } from "../../../../../utils/modelUtils";
import { getImageInfo } from "../../../../../utils/fetch/fetchImages";
import { fetchResourcesInfoFromDB } from "../../../../../utils/fetch/fetchImages";
import { clearFileExtension } from "../../../../../../shared/utils";
import type { Image } from "../../../../../../shared/types/image";
import { useAppSelector } from "../../../../../store/hooks/hooks";
import type { ImageResourceData } from "../../../../../types/images.types";
import type { ModelPreviewDoc } from "../../../../../../shared/types/firestore";

const timeoutDelay = 1000;

type ImageResourcesProps = { imageData: Image };

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
const ImageResources = ({ imageData }: ImageResourcesProps) => {
  const [imageResources, setImageResources] = useState<ImageResourceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [civConnectionError, setCivConnectionError] = useState(false);
  const guideIsActive = useAppSelector((state) => state.guide.active);
  const guideStep = useAppSelector((state) => state.guide.model.step);
  const uid = useAppSelector((state) => state.auth.user.uid);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateImageResources = (previewData: ModelPreviewDoc) => {
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

    let versionIsSaved: boolean = false;
    let versionName: string | null = null;
    let versionIdByName: number | null = null;
    let modelType: string | null = null;

    if (resource?.type?.includes("{")) {
      modelType = parseMoelType(resource.type);
    } else {
      modelType = resource.type || null;
    }

    if (
      versiondId &&
      resource?.preview?.modelVersionsCustomData &&
      Object.hasOwn(resource.preview.modelVersionsCustomData, `${versiondId}`)
    ) {
      versionIsSaved =
        !!resource.preview.modelVersionsCustomData[versiondId].downloadStatus;
      versionName =
        resource.preview.modelVersionsCustomData[versiondId]?.versionName ||
        null;
    } else {
      const curVersion =
        resource?.preview?.modelVersionsCustomData &&
        Object.values(resource?.preview?.modelVersionsCustomData).find(
          (version) =>
            version?.defFileName &&
            resource?.name &&
            clearFileExtension(version.defFileName) ===
              clearFileExtension(resource.name)?.toLowerCase(),
        );
      versionIsSaved = !!curVersion?.downloadStatus;
      versionName = curVersion?.versionName || null;
      versionIdByName = curVersion?.id || null;
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

      const fetchResourcesInfo = async (curImageData: Image) => {
        let resourcesInfo: ImageResourceData[] = [];

        setIsLoading(true);
        setCivConnectionError(false);

        try {
          // Fetches data for all image resources from Civitai API and app DB
          resourcesInfo = await getImageInfo(curImageData);
        } catch (err) {
          handleErrors(normalizeError(err));
          setCivConnectionError(true);
          try {
            // Fetches data for all image resources only from app DB
            resourcesInfo = await fetchResourcesInfoFromDB(curImageData);
          } catch (err) {
            handleErrors(normalizeError(err));
          }
        }

        if (curImageData?.id === imageData?.id) {
          setImageResources(resourcesInfo);
        }

        setIsLoading(false);
      };

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

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
