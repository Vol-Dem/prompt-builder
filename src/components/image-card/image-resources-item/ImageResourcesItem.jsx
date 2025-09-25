import { AnimatePresence, motion } from "framer-motion";
import classes from "./ImageResourcesItem.module.scss";
import { Link } from "react-router-dom";
import ButtonAdd from "../../ui/ButtonSquareAdd";
import ButtonSquareSave from "../../ui/ButtonSquareSave";
import Tooltip from "../../ui/Tooltip";
import LinkA from "../../ui/LinkA";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ButtonSquare from "../../ui/ButtonSquare";
import Modal from "../../ui/Modal";
import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import { useState } from "react";

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

  return (
    <>
      <motion.li
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        className={classes["resource"]}
      >
        {resource?.preview && (
          <>
            <Link
              to={`/models/${resource?.preview?.id}${
                version ? `?versionId=${version}` : ""
              }`}
              state={{ versionId: version }}
              className={`${classes["resource__link"]} ${classes["resource__name"]}`}
              onClick={onReset}
              data-id={resource?.preview?.id}
            >
              {resource.preview.name}
            </Link>
            <ButtonAdd
              previewData={{
                ...resource.preview,
                versionName: resource?.versionName || versionName,
                versionId: resource?.versionId || null,
              }}
              versionId={version}
              className={classes["resource__add"]}
            />
          </>
        )}
        {!resource?.preview && !versionName && (
          <div
            className={classes["resource__name"]}
            title={resource?.name || resource.modelVersionId}
          >
            {resource?.name ||
              resource?.modelVersionName ||
              resource?.modelVersionId ||
              resource?.hash}
            {resource?.modelId &&
              (resource?.modelVersionId || resource?.versionId) && (
                <ButtonSquareSave
                  // modelId={resource?.modelId}
                  // versionId={resource?.modelVersionId}
                  className={classes["resource__add"]}
                  onClick={openFormHandler.bind(
                    null,
                    resource?.modelId,
                    resource?.modelVersionId || resource?.versionId,
                    resource?.type
                  )}
                />
              )}
            {civConnectionError && (
              <ButtonSquare
                className={`${classes["resource__add"]} ${classes["resource__unavailable"]}`}
              >
                <Tooltip
                  className={`${classes["tooltip"]} ${classes["tooltip--centered"]}`}
                  defSide="left"
                  content={
                    <div className={classes["resource__version-tooltip"]}>
                      <p>Failed to conect to Civitai API.</p>
                      <p>
                        There may be heavy load or maintenance at the moment.
                      </p>
                    </div>
                  }
                >
                  <ExclamationTriangleIcon />{" "}
                </Tooltip>
              </ButtonSquare>
            )}
          </div>
        )}
        <Tooltip
          className={classes["tooltip--align-left"]}
          defSide="left"
          content={
            <div className={classes["resource__version-tooltip"]}>
              {`${
                versionIsSaved ? "Version downloaded" : "Version not downloaded"
              }`}
            </div>
          }
        >
          <div className={classes["resource__version"]}>
            {!versionIsSaved && !!resource?.preview && (
              <ExclamationCircleIcon
                className={classes["resource__version-svg"]}
              />
            )}
            {versionIsSaved && (
              <CheckCircleIcon
                className={`${classes["resource__version-svg"]} ${classes["resource__version-svg--saved"]}`}
              />
            )}{" "}
            <span className={classes["resource__version-name"]}>
              {versionName || resource?.versionName}
            </span>
          </div>
        </Tooltip>
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
                content={
                  <div className={classes["resource__version-tooltip"]}>
                    <p>Failed to conect to Civitai API.</p>
                    <p>There may be heavy load or maintenance at the moment.</p>
                  </div>
                }
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
