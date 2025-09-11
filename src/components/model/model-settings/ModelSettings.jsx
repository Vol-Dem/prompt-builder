import { useDispatch, useSelector } from "react-redux";
import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import VersionForm from "../../forms/version-form/VersionForm";
import classes from "./ModelSettings.module.scss";
import { useEffect, useState } from "react";
import Buttton from "../../ui/Button";
import VersionStatusForm from "../../forms/version-status-form/VersionStatusForm";
import { deleteModelDoc } from "../../../utils/fetchUtils";
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useNavigate } from "react-router-dom";
import DeleteRequest from "../../ui/DeleteRequest";
import { clearFileExtension } from "../../../utils/generalUtils";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import Spinner from "../../ui/Spinner";
import {
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_EDIT_UPD_DEL,
  ERROR_MESSAGE_OFFLINE,
  URL_CF_UPDATE_MODEL,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
} from "../../../variables/constants";
import { modelActions } from "../../../store/model";
import { tabActions } from "../../../store/tabs";
import EditPageGuide from "../../ui/guide/edit/EditPageGuide";
import { AnimatePresence, motion } from "framer-motion";
import LeftSidebar from "../../layout/left-sidebar/LeftSidebar";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import H1 from "../../ui/text/H1";

const firestore = getFirestore(firebaseApp);

const ModelSettings = () => {
  const [curTab, setCurTab] = useState("general");
  const [curVersionData, setCurVersionData] = useState(null);
  const [curVersionDefData, setCurVersionDefData] = useState(null);
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const uid = useSelector((state) => state.auth.user.uid);
  const curBaseModels = useSelector((state) => state.tabs.baseModels);
  const guideHomeState = useSelector((state) => state.guide.edit);
  const guideIsActive = useSelector((state) => state.guide.active);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const DEFAULT_VERSION_ID = "def-ver";

  useEffect(() => {
    const customData =
      curTab === DEFAULT_VERSION_ID
        ? model.defaultCustomData
        : model.modelVersionsCustomData[curTab];

    const defData =
      curTab === DEFAULT_VERSION_ID
        ? model.defaultCustomData
        : model.data?.modelVersions?.find((version) => version.id === +curTab);

    if (customData) {
      setCurVersionData(customData);
      setCurVersionDefData(defData);
    } else {
      setCurVersionData(null);
      setCurVersionDefData(null);
    }
  }, [curTab, model]);

  const switchTabHandler = (e) => {
    setCurTab(e.target.id);
    setMobileMenuIsOpen(false);
  };

  const updateModelHandler = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      seteSuccessMessage("");

      if (!navigator.onLine) {
        throw new Error(ERROR_MESSAGE_OFFLINE);
      }

      const updateModelRes = await fetch(
        `${URL_CF_UPDATE_MODEL}/updateModel?modelId=${model.id}`
      );
      const updateModelResData = await updateModelRes.json();

      if (!updateModelResData?.modelId) {
        throw new Error("Failed to update");
      }

      let newModelData;

      const modelDefDataRef = doc(firestore, "models", `${model.id}`);

      const docSnap = await getDoc(modelDefDataRef);

      if (docSnap.exists()) {
        newModelData = docSnap.data();
      }

      const newVersions = newModelData?.modelVersions?.filter(
        (version) =>
          !Object.values(model?.modelVersionsCustomData)?.some(
            (oldVersions) => version?.id === oldVersions?.versionId
          )
      );

      if (!newVersions.length) {
        seteSuccessMessage("No new versions found");
        setIsLoading(false);
        return;
      }

      const newVersionsCustomData = {};

      newVersions.forEach((version, i) => {
        version.modelId = model.id;

        let fileName;
        if (version.hasOwnProperty("files") && version?.files) {
          fileName = clearFileExtension(
            version.files.find((file) => file?.primary).name
          ).toLowerCase();
        }

        newVersionsCustomData[version.id] = {
          versionId: version.id,
          name: version.name,
          versionName: version.name,
          baseModel: version.baseModel,
          index: version.index,
          defFileName: fileName || "",
          versionImageUrl:
            version.images?.filter((img, i) => img.type === "image")[0]?.url ||
            "",
          downloadStatus: false,
        };
      });
      const modelVersionsCustomData = { ...newVersionsCustomData };

      Object.values(model?.modelVersionsCustomData).forEach((customVersion) => {
        modelVersionsCustomData[customVersion.versionId] = {
          ...customVersion,
          index: newModelData?.modelVersions?.find(
            (version) => version.id === customVersion.versionId
          )?.index,
        };
      });

      const fileNames = newModelData.modelVersions?.flatMap((version) => {
        if (version.hasOwnProperty("files") && version?.files) {
          return clearFileExtension(
            version.files.find((file) => file?.primary).name
          ).toLowerCase();
        }
        return [];
      });

      const hashes = newModelData.modelVersions
        ?.flatMap((version) => {
          if (version.hasOwnProperty("files") && version?.files) {
            const primaryFileHashes = version?.files.find(
              (file) => file?.primary
            )?.hashes;
            if (primaryFileHashes) {
              return Object.values(primaryFileHashes)?.map((hash) =>
                hash.toLowerCase()
              );
            }
          }
          return [];
        })
        .filter(Boolean);

      const versionIds =
        newModelData.modelVersions?.map((version) => version.id) || [];

      const baseModels = new Set(
        newModelData.modelVersions?.flatMap(
          (version) => version?.baseModel || []
        )
      );

      let newBaseModel = false;

      if (curBaseModels?.length) {
        baseModels?.forEach((baseModel) => {
          const exists = curBaseModels?.some(
            (curBaseModel) => curBaseModel === baseModel
          );
          if (!exists) {
            newBaseModel = true;
          }
        });
      }

      const modelsRef = doc(firestore, "users", uid, "models", model?.id + "");
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        model?.id + ""
      );
      const userRef = doc(firestore, "users", uid);

      if (newBaseModel) {
        await updateDoc(
          userRef,
          {
            baseModels: arrayUnion(...baseModels),
          },
          { merge: true }
        );
      }

      await updateDoc(
        modelsRef,
        {
          modelVersionsCustomData: modelVersionsCustomData,
        },
        { merge: true }
      );
      await updateDoc(
        modelsPrevRef,
        {
          modelVersionsCustomData: modelVersionsCustomData,
          fileNames,
          hashes,
          versionIds,
          tags: newModelData.tags,
          baseModels: arrayUnion(...baseModels),
        },
        { merge: true }
      );

      dispatch(
        modelActions.setModelData({
          data: newModelData,
        })
      );
      seteSuccessMessage("Updated");
      setIsLoading(false);
    } catch (err) {
      setErrorMessage(ERROR_MESSAGE_DEFAULT);
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
      await deleteModelDoc(uid, model);
      setIsDeleting(false);
      dispatch(modelActions.resetModelData());
      dispatch(tabActions.resetModelsData());
      dispatch(tabActions.resetActiveTabs());
      navigate("/");
    } catch (err) {
      console.error(err.message);
      setErrorMessage(ERROR_MESSAGE_DEFAULT);
    }
  };

  const modelVersionsHtml = Object.values(model?.modelVersionsCustomData)
    ?.sort((a, b) => a?.index - b?.index)
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
          id={version.versionId}
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
    // navigate(-1);
    navigate(`/models/${model.id}`);
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
        <div
          className={`${classes["update"]} ${
            guideIsActive &&
            guideHomeState?.active &&
            guideHomeState?.step === GUIDE_STEP_EDIT_UPD_DEL
              ? classes["update--guide"]
              : ""
          }`}
        >
          <Buttton
            type="button"
            onClick={backHandler}
            className={classes["btn-back"]}
          >
            <ArrowUturnLeftIcon />
            <span className={classes["btn-back__text"]}>Back</span>
          </Buttton>
          <Buttton
            type="button"
            onClick={updateModelHandler}
            className={classes["btn-update"]}
            disabled={isLoading}
          >
            {!isLoading ? "Check for updates" : <Spinner size="small" />}
          </Buttton>

          <Buttton
            type="button"
            onClick={showDeleteReqeustHandler}
            className={classes["btn-del"]}
            disabled={isLoading}
          >
            <TrashIcon />
            <span className={classes["btn-del__text"]}>Delete</span>
          </Buttton>
        </div>
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
            <UpdateModelForm modelData={model} />
            {guideIsActive && guideHomeState?.active && <EditPageGuide />}
          </motion.div>
        )}
        {curTab === "versions" && (
          <motion.div
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
          >
            <H1 className={classes.title}>Version settings</H1>
            <VersionStatusForm modelData={model} />
          </motion.div>
        )}
        {curVersionData && (
          <motion.div
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
