import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import VersionForm from "../../forms/version-form/VersionForm";
import classes from "./ModelSettings.module.scss";
import Button from "../../ui/buttons/Button";
import VersionStatusForm from "../../forms/version-status-form/VersionStatusForm";
import DeleteRequest from "../../ui/DeleteRequest";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import Spinner from "../../ui/Spinner";
import {
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_EDIT_UPD_DEL,
  ERROR_MESSAGE_OFFLINE,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
  ERROR_MESSAGE_INVALID_DATA,
} from "../../../variables/constants";
import { modelActions } from "../../../store/model";
import { tabActions } from "../../../store/tabs";
import EditPageGuide from "../../general-elements/guide/edit/EditPageGuide";
import LeftSidebar from "../../layout/left-sidebar/LeftSidebar";
import H1 from "../../ui/text/H1";
import { filterNewModelVersions } from "../../../utils/modelUtils";
import {
  deleteModelDoc,
  fetchModelUpdates,
  updateUserCustomModelData,
} from "../../../utils/fetch/fetchModel";
import {
  AppError,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Model settings.
 *
 * Displays model settings and version-specific configuration.
 *
 * Responsibilities:
 * - Displays model and version settings.
 * - Allows switching between settings sections and model versions.
 * - Checks for and applies model updates.
 * - Handles model deletion and navigates away on success.
 * - Supports mobile sidebar navigation.
 *
 * Update behavior:
 * - Fetches the latest model data from the external source.
 * - Detects newly added versions by comparing against the current model.
 * - Merges only new versions into the user's custom model data.
 * - Updates Redux state with the refreshed base model data.
 *
 * Navigation behavior:
 * - Uses a collapsible left sidebar on small screens.
 * - Automatically closes the menu after selecting a section.
 * - Provides a back button to return to the model page.
 *
 * @component
 *
 * @returns {JSX.Element} Model settings component.
 */
const ModelSettings = () => {
  const [curTab, setCurTab] = useState("general");
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const model = useAppSelector((state) => state.model.model);
  const uid = useAppSelector((state) => state.auth.user.uid);
  const curBaseModels = useAppSelector((state) => state.tabs.baseModels);
  const guideHomeState = useAppSelector((state) => state.guide.edit);
  const guideIsActive = useAppSelector((state) => state.guide.active);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const DEFAULT_VERSION_ID = "def-ver";

  let curVersionData = null;
  let curVersionDefData = null;

  if (model?.id) {
    const customData =
      curTab === DEFAULT_VERSION_ID
        ? model.defaultCustomData
        : model.modelVersionsCustomData[curTab];

    const defData =
      curTab === DEFAULT_VERSION_ID && model.defaultCustomData
        ? model.defaultCustomData
        : model.data?.modelVersions?.find((version) => version.id === +curTab);

    if (customData) {
      curVersionData = customData;
      curVersionDefData = defData;
    }
  }

  const switchTabHandler = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement)) return;

    setCurTab(e.target.id);
    setMobileMenuIsOpen(false);
  };

  const updateModelHandler = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      seteSuccessMessage("");

      if (!navigator.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
      }

      if (!model) {
        throw new AppError(ERROR_MESSAGE_INVALID_DATA);
      }

      const newModelData = await fetchModelUpdates(model.id);

      if (!newModelData) {
        throw new AppError(ERROR_MESSAGE_INVALID_DATA);
      }

      const newVersions = filterNewModelVersions(newModelData, model);

      if (!newVersions?.length) {
        seteSuccessMessage("No new versions found");
        setIsLoading(false);
        return;
      }

      await updateUserCustomModelData(
        newModelData,
        newVersions,
        model,
        curBaseModels,
      );

      dispatch(
        modelActions.updateModelDataField({
          data: newModelData,
        }),
      );
      seteSuccessMessage("Updated");
      setIsLoading(false);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const showDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(true);
  };

  const closeDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(false);
  };

  const deleteModelHandler = async () => {
    try {
      setIsDeleting(true);

      if (!model) {
        throw new AppError(ERROR_MESSAGE_DEFAULT);
      }

      await deleteModelDoc(uid, model);
      dispatch(modelActions.resetModelData());
      dispatch(tabActions.resetModelsData());
      dispatch(tabActions.resetActiveTabs());
      navigate("/");
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const modelVersionsHtml =
    model?.id &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => {
        if (a?.index && b?.index) {
          return a?.index - b?.index;
        }
        return 0;
      })
      .flatMap((version, i) => {
        if (!version.downloadStatus) {
          return [];
        }
        return (
          <motion.li
            key={i}
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
            id={version.versionId + ""}
            data-version={i}
            onClick={switchTabHandler}
            className={`${classes["menu-item"]} ${
              curTab === version.versionId + ""
                ? classes["menu-item--active"]
                : ""
            }`}
          >
            {version.name}
          </motion.li>
        );
      });

  const openMenuHandler = () => {
    setMobileMenuIsOpen(true);
  };

  const closeMenuHandler = () => {
    setMobileMenuIsOpen(false);
  };

  const backHandler = () => {
    if (model) navigate(`/models/${model.id}`);
  };

  return (
    <div className={classes.wrap}>
      <LeftSidebar
        isOpen={mobileMenuIsOpen}
        onClose={closeMenuHandler}
        onOpen={openMenuHandler}
      >
        <ul className={`${classes["menu"]} `}>
          <motion.li
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            className={`${classes["menu-item"]} ${
              curTab === "general" ? classes["menu-item--active"] : ""
            }`}
            id="general"
            onClick={switchTabHandler}
          >
            General settings
          </motion.li>
          <motion.li
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            className={`${classes["menu-item"]} ${
              curTab === "versions" ? classes["menu-item--active"] : ""
            }`}
            id="versions"
            onClick={switchTabHandler}
          >
            Version settings
          </motion.li>
          <li>
            <AnimatePresence>
              <ul className={classes.versions}>
                <motion.li
                  initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
                  animate={ANIMATIONS_FM_SLIDEIN}
                  exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
                  id={DEFAULT_VERSION_ID}
                  data-version="def"
                  onClick={switchTabHandler}
                  className={`${classes["menu-item"]} ${
                    curTab === DEFAULT_VERSION_ID
                      ? classes["menu-item--active"]
                      : ""
                  }`}
                >
                  Default for All
                </motion.li>
                {modelVersionsHtml}
              </ul>
            </AnimatePresence>
          </li>
        </ul>
      </LeftSidebar>
      <div className={classes.content}>
        <motion.div
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          className={`${classes["update"]} ${
            guideIsActive &&
            guideHomeState?.active &&
            guideHomeState?.step === GUIDE_STEP_EDIT_UPD_DEL
              ? classes["update--guide"]
              : ""
          }`}
        >
          <Button
            type="button"
            onClick={backHandler}
            className={classes["btn-back"]}
          >
            <ArrowUturnLeftIcon />
            <span className={classes["btn-back__text"]}>Back</span>
          </Button>
          <Button
            type="button"
            onClick={updateModelHandler}
            className={classes["btn-update"]}
            disabled={isLoading}
          >
            {!isLoading ? "Check for updates" : <Spinner size="small" />}
          </Button>

          <Button
            type="button"
            onClick={showDeleteReqeustHandler}
            className={classes["btn-del"]}
            disabled={isLoading}
          >
            <TrashIcon />
            <span className={classes["btn-del__text"]}>Delete</span>
          </Button>
        </motion.div>
        {curTab === "general" && (
          <motion.div
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
          >
            <H1 className={classes.title}>General settings</H1>
            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {!!model?.id && <UpdateModelForm modelData={model} />}
            {guideIsActive && guideHomeState?.active && <EditPageGuide />}
          </motion.div>
        )}
        {curTab === "versions" && model && (
          <motion.div
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
          >
            <H1 className={classes.title}>Version settings</H1>
            <VersionStatusForm modelData={model} />
          </motion.div>
        )}
        {(curVersionData || curTab === DEFAULT_VERSION_ID) && model && (
          <motion.div
            key={curTab}
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
          >
            <H1 className={classes.title}>
              {curVersionData?.name &&
                `Version settings: ${curVersionData.name}`}
              {!curVersionData?.name && "Default for All"}
            </H1>
            <VersionForm
              versionData={curVersionData}
              defaultData={curVersionDefData}
              modelId={model.id}
              modelType={model.modelType}
              isDefault={curTab === DEFAULT_VERSION_ID}
            />
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {deleteRequestIsOpen && (
          <DeleteRequest
            message="Are you sure you want to delete this resource? This action
        can't be undone"
            onSubmit={deleteModelHandler}
            onClose={closeDeleteReqeustHandler}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSettings;
