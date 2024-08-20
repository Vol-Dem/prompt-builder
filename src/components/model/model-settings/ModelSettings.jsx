import { useSelector } from "react-redux";
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
import ButtonTertiary from "../../ui/ButtonTertiary";
import Spinner from "../../ui/Spinner";
import { OFFLINE_ERROR_MESSAGE } from "../../../variables/constants";

const firestore = getFirestore(firebaseApp);

const ModelSettings = () => {
  const [curTab, setCurTab] = useState("general");
  const [curVersionData, setCurVersionData] = useState(null);
  const [curVersionDefData, setCurVersionDefData] = useState(null);
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const uid = useSelector((state) => state.auth.user.uid);
  const curBaseModels = useSelector((state) => state.tabs.baseModels);
  const navigate = useNavigate();

  useEffect(() => {
    const customData = model.modelVersionsCustomData[curTab];
    const defData = model.data?.modelVersions?.find(
      (version) => version.id === +curTab
    );

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
      seteErrorMessage("");
      seteSuccessMessage("");

      if (!navigator.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }

      const updateModelRes = await fetch(
        `http://127.0.0.1:5001/aide-tools/us-central1/updateModel?modelId=${model.id}`
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

      seteSuccessMessage("Updated");
      setIsLoading(false);
    } catch (err) {
      seteErrorMessage(err.message);
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
      navigate("/");
    } catch (err) {
      console.error(err.message);
    }
  };

  const modelVersionsHtml = Object.values(model?.modelVersionsCustomData)
    ?.sort((a, b) => a?.index - b?.index)
    .flatMap((version, i) => {
      if (!version.downloadStatus) {
        return [];
      }
      return (
        <li
          key={i}
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
        </li>
      );
    });

  const openMenuHandler = () => {
    setMobileMenuIsOpen((prevState) => !prevState);
  };

  return (
    <div className={classes.wrap}>
      <ButtonTertiary className={classes["btn-menu"]} onClick={openMenuHandler}>
        {!mobileMenuIsOpen ? "Menu" : "Close"}
      </ButtonTertiary>
      <ul
        className={`${classes["menu"]} ${
          !mobileMenuIsOpen ? classes["menu--hidden"] : ""
        }`}
      >
        <li
          className={`${classes["menu-item"]} ${
            curTab === "general" ? classes["menu-item--active"] : ""
          }`}
          id="general"
          onClick={switchTabHandler}
        >
          General settings
        </li>
        <li
          className={`${classes["menu-item"]} ${
            curTab === "versions" ? classes["menu-item--active"] : ""
          }`}
          id="versions"
          onClick={switchTabHandler}
        >
          Version settings
        </li>
        <li>
          <ul className={classes.versions}>{modelVersionsHtml}</ul>
        </li>
      </ul>
      {mobileMenuIsOpen && (
        <div
          className={classes["menu-overlay"]}
          onClick={openMenuHandler}
        ></div>
      )}
      <div className={classes.content}>
        {curTab === "general" && (
          <div>
            <div className={classes["update"]}>
              <Buttton
                type="button"
                onClick={updateModelHandler}
                className={classes["btn-update"]}
                disabled={isLoading}
              >
                {!isLoading ? "Update" : <Spinner size="small" />}
              </Buttton>

              <Buttton
                type="button"
                onClick={showDeleteReqeustHandler}
                className={classes["btn-del"]}
                disabled={isLoading}
              >
                Delete
              </Buttton>
            </div>
            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            <UpdateModelForm modelData={model} />
          </div>
        )}
        {curTab === "versions" && (
          <div>
            <VersionStatusForm modelData={model} />
          </div>
        )}
        {curVersionData && (
          <div>
            <VersionForm
              versionData={curVersionData}
              defaultData={curVersionDefData}
              modelId={model.id}
              modelType={model.modelType}
            />
          </div>
        )}
      </div>
      {deleteRequestIsOpen && (
        <DeleteRequest
          message="Are you sure you want to delete this resource? This action
        can't be undone"
          onSubmit={deleteModelHandler}
          onClose={closeDeleteReqeustHandler}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default ModelSettings;
