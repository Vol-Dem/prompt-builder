import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import classes from "./ImageResourcesItem.module.scss";
import Tooltip from "../../ui/Tooltip";
import LinkA from "../../ui/LinkA";
import Modal from "../../ui/Modal";
import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import ImageResourcesItemName from "./image-resources-item-name/ImageResourcesItemName";
import ImageResourcesItemButton from "./image-resources-item-button/ImageResourcesItemButton";
import ImageResourcesItemVersion from "./image-resources-item-version/ImageResourcesItemVersion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../variables/constants";

const ImageResourcesItem = ({
  resource,
  version,
  versionName,
  modelType,
  versionIsSaved,
  civConnectionError,
  onReset,
  onUpdateResources,
}) => {
  const [fromIsOpen, setFormIsOpen] = useState(false);

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

  return (
    <>
      <motion.li
        // Temporarily disabled due to framer-motion animation bug
        // variants={{
        //   hidden: { opacity: 0, y: 30 },
        //   visible: { opacity: 1, y: 0 },
        // }}
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        className={classes["resource"]}
      >
        <ImageResourcesItemName
          resource={resource}
          version={version}
          versionName={versionName}
          onReset={onReset}
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
                href={`https://civitai.com/models/${resource?.modelId}${
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
              id="resources-form"
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
