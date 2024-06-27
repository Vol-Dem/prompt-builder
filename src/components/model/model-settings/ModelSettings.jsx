import { useDispatch, useSelector } from "react-redux";
// import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import VersionForm from "../../forms/version-form/VersionForm";
import classes from "./ModelSettings.module.scss";
import { useEffect, useState } from "react";
import Buttton from "../../ui/Button";
import VersionStatusForm from "../../forms/version-status-form/VersionStatusForm";
import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
// import { updateModel } from "../../../store/model";
import {
  deleteModelDoc,
  getModelData,
  makeBatchRequest,
  saveVersionImages,
} from "../../../utils/fetchUtils";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { deleteModel } from "../../../store/model";
// import Modal from "../../ui/Modal";
import { useNavigate } from "react-router-dom";
import DeleteRequest from "../../ui/DeleteRequest";
import { clearFileExtension } from "../../../utils/generalUtils";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import ButtonTertiary from "../../ui/ButtonTertiary";
import Spinner from "../../ui/Spinner";

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
  const dispatch = useDispatch();
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
      console.log("UPD");
      const newModelData = await getModelData(
        model.id,
        model.data.modelVersions
      );

      const newVersions = newModelData.modelVersions.filter(
        (version) =>
          !model?.data?.modelVersions?.some(
            (oldVersions) => version?.id === oldVersions?.id
          )
      );

      // newVersions.forEach((version) => {
      //   version.images.forEach((image) => {
      //     const metaArr = Object.entries(image?.meta).filter(
      //       (entry) => !!entry[0]
      //     );
      //     image.meta = Object.fromEntries(metaArr);
      //   });
      // });
      // console.log(newVersions);
      // setIsLoading(false);
      // return;
      if (!newVersions.length) {
        console.log("NO UPDATEDS");
        seteSuccessMessage("No new wersion found");
        setIsLoading(false);
        return;
      }

      console.log("ONE", newVersions[newVersions.length - 1]);

      newModelData.modelVersions = [
        ...newVersions,
        // newVersions[newVersions.length - 1],
        ...(model?.data?.modelVersions || []),
      ].filter(Boolean);
      console.log(newModelData);

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
          versionName: version.name,
          baseModel: version.baseModel,
          defFileName: fileName || "",
          versionImageUrl:
            version.images?.filter((img, i) => img.type === "image")[0]?.url ||
            "",
          downloadStatus: false,
        };
      });
      const modelVersionsCustomData = {
        ...newVersionsCustomData,
        ...model?.modelVersionsCustomData,
      };
      console.log(modelVersionsCustomData);

      const fileNames = newModelData.modelVersions?.flatMap((version) => {
        // version.files.map((file) => file.name)
        if (version.hasOwnProperty("files") && version?.files) {
          return clearFileExtension(
            version.files.find((file) => file?.primary).name
          ).toLowerCase();
        }
        return [];
      });

      const hashes = newModelData.modelVersions
        ?.flatMap((version) => {
          // version.files.map((file) => file.name)
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

      const modelsRef = doc(firestore, "users", uid, "models", model?.id + "");
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        model?.id + ""
      );

      await updateDoc(
        modelsRef,
        {
          data: newModelData,
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
        },
        { merge: true }
      );

      if (newModelData?.creator?.username && !!newVersions.length) {
        const versionsWithUserName = newModelData?.modelVersions?.map(
          (version) => {
            return {
              ...version,
              modelId: newModelData.id,
              username: newModelData.creator.username,
            };
          }
        );

        await makeBatchRequest(versionsWithUserName, saveVersionImages);
      }

      seteSuccessMessage("Updated");
      setIsLoading(false);
    } catch (err) {
      seteErrorMessage(err.message);
      setIsLoading(false);
      console.log(err);
    }
  };

  const showDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(true);
  };

  const closeDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(false);
  };

  const deleteModelHandler = async () => {
    console.log("DEL");
    setIsDeleting(true);
    // dispatch(deleteModel());
    await deleteModelDoc(uid, model);
    setIsDeleting(false);
    navigate("/");
  };

  const modelVersionsHtml = model?.data?.modelVersions?.flatMap(
    (version, i) => {
      const versionIsSaved =
        model.modelVersionsCustomData[version.id]?.downloadStatus;
      const modelName = model.modelVersionsCustomData[version.id]?.name;

      if (!versionIsSaved) {
        return [];
      }
      return (
        <li
          key={i}
          id={version.id}
          data-version={i}
          onClick={switchTabHandler}
          className={`${classes["menu-item"]} ${
            curTab === version.id + "" ? classes["menu-item--active"] : ""
          }`}
        >
          {modelName || version.name}
        </li>
      );
    }
  );

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
        {/* <SaveImageForm modelData={model} /> */}
      </div>
      {deleteRequestIsOpen && (
        <DeleteRequest
          message="Are you sure that you want to delete this resource? This action
        can't be reverted"
          onSubmit={deleteModelHandler}
          onClose={closeDeleteReqeustHandler}
          isDeleting={isDeleting}
        />
        // <Modal onClose={closeDeleteReqeustHandler}>
        //   <div className={classes["del-request"]}>
        //     <div className={classes["del-request__message"]}>
        //       Are you sure that you want to delete this resource? This action
        //       can't be reverted
        //     </div>
        //     <div className={classes["del-request__btn-container"]}>
        //       <Buttton
        //         className={classes["btn-del"]}
        //         onClick={deleteModelHandler}
        //       >
        //         Delete
        //       </Buttton>
        //       <Buttton onClick={closeDeleteReqeustHandler}>Cancel</Buttton>
        //     </div>
        //   </div>
        // </Modal>
      )}
    </div>
  );
};

export default ModelSettings;
