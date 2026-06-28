import { AnimatePresence, motion } from "framer-motion";
import { useState, type MouseEvent } from "react";

import classes from "./ImageResourcesItem.module.scss";
import Tooltip from "../../../../ui/Tooltip";
import LinkA from "../../../../ui/LinkA";
import Modal from "../../../../ui/Modal";
import UpdateModelForm from "../../../../forms/update-model-form/UpdateModelForm";
import ImageResourcesItemName from "./image-resources-item-name/ImageResourcesItemName";
import ImageResourcesItemButton from "./image-resources-item-button/ImageResourcesItemButton";
import ImageResourcesItemVersion from "./image-resources-item-version/ImageResourcesItemVersion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  URL_CIV_DEF,
  URL_CIV_RED,
} from "../../../../../variables/constants";
import { modelActions } from "../../../../../store/model";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../store/hooks/hooks";
import type { ImageResourceData } from "../../../../../types/images.types";
import type { ModelPreviewDoc } from "../../../../../../shared/types/firestore";

type ImageResourcesItemProps = {
  resource: ImageResourceData;
  version?: number | null;
  versionName?: string | null;
  modelType?: string | null;
  versionIsSaved: boolean;
  civConnectionError: boolean;
  onUpdateResources: (previewData: ModelPreviewDoc) => void;
};

/**
 * Image resource item component.
 *
 * Renders a single resource card for an image, including model metadata,
 * links to the model on Civitai and inside the application, and controls
 * to save the model or add it to the sidebar if it is already saved.
 *
 * When the user chooses to save a model, this component displays a popup
 * with the model save / edit form and reports successful updates back to
 * the parent resource list.
 *
 * Responsibilities:
 * - Displays resource model information and version details.
 * - Provides links to the model on Civitai and within the app.
 * - Allows saving a model or adding it to the sidebar.
 * - Notifies parent component when resource preview data changes.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.resource - Raw resource data extracted from image metadata.
 * @param {number|string} props.version - Model version ID resolved from metadata or filename.
 * @param {string} [props.versionName] - Human-readable model version name.
 * @param {string} props.modelType - Model type (e.g. "checkpoint", "lora", etc.).
 * @param {boolean} props.versionIsSaved - Whether the current model version is already saved.
 * @param {boolean} props.civConnectionError - Indicates that the Civitai API is currently unavailable.
 * @param {(preview: object) => void} props.onUpdateResources - Callback triggered when resource data is updated.
 *
 * @returns {JSX.Element} Image resource item card.
 */
const ImageResourcesItem = ({
  resource,
  version,
  versionName,
  modelType,
  versionIsSaved,
  civConnectionError,
  onUpdateResources,
}: ImageResourcesItemProps) => {
  const [fromIsOpen, setFormIsOpen] = useState(false);
  const modelId = useAppSelector((state) => state.model.model?.id);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const dispatch = useAppDispatch();

  const openFormHandler = () => {
    setFormIsOpen(true);
  };

  const closeFormHandler = () => {
    setFormIsOpen(false);
  };

  const civitaiConnectionErrorHtml = (
    <div className={classes["resource__version-tooltip"]}>
      <p>Failed to conect to Civitai API.</p>
      <p>There may be heavy load or maintenance at the moment.</p>
    </div>
  );

  const resetModelData = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.dataset.id && +e.target.dataset.id !== modelId) {
      dispatch(modelActions.resetModelData());
      dispatch(modelActions.setActiveCarouselData(null));
    }
  };

  return (
    <>
      <motion.li
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        className={classes["resource"]}
      >
        <ImageResourcesItemName
          resource={resource}
          version={version}
          versionName={versionName}
          onClick={resetModelData}
        />
        <ImageResourcesItemButton
          resource={resource}
          version={version}
          versionName={versionName}
          onOpen={openFormHandler}
          errorMessage={civConnectionError ? civitaiConnectionErrorHtml : ""}
        />
        <ImageResourcesItemVersion
          resource={resource}
          versionName={versionName}
          versionIsSaved={versionIsSaved}
        />
        {(resource?.modelId || civConnectionError) && (
          <div className={classes["resource__field"]}>
            Source:{" "}
            {!civConnectionError && (
              <LinkA
                external={true}
                href={`${nsfwMode ? URL_CIV_RED : URL_CIV_DEF}/models/${resource?.modelId}${
                  resource?.versionId
                    ? `?modelVersionId=${resource?.versionId}`
                    : ""
                }`}
              >
                civitai
              </LinkA>
            )}
            {civConnectionError && (
              <Tooltip
                className={classes["tooltip--align-left"]}
                defSide="left"
                content={civitaiConnectionErrorHtml}
              >
                <span className={classes["resource__connection-error"]}>
                  Unavailable
                </span>
              </Tooltip>
            )}
          </div>
        )}
        <div className={classes["resource__info"]}>
          <div className={classes["resource__type"]}>
            {modelType || resource?.type}
          </div>
          {resource?.weight && (
            <div>weight: {Math.round(resource?.weight * 100) / 100 || ""}</div>
          )}
        </div>
      </motion.li>
      <AnimatePresence>
        {fromIsOpen && (
          <Modal title="Add new resource" onClose={closeFormHandler}>
            <UpdateModelForm
              newModelId={resource?.modelId}
              newModelVersionId={
                resource?.modelVersionId || resource?.versionId
              }
              onSave={onUpdateResources}
              newModelType={resource?.type || null}
              className={classes.form}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageResourcesItem;
