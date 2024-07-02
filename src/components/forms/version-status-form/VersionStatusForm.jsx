import { useEffect, useState } from "react";
import Buttton from "../../ui/Button";
import FieldCategory from "../../ui/FieldCategory";
import Fieldset from "../../ui/Fieldset";
import classes from "./VersionStatusForm.module.scss";
import Checkbox from "../../ui/Checkbox";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  OFFLINE_ERROR_MESSAGE,
  SAVED_SUCCESS_MESSAGE,
} from "../../../variables/constants";
import { useOnlineStatus } from "../../../hooks/use-online-status";

const firestore = getFirestore(firebaseApp);

const VersionStatusForm = ({ modelData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [versionsDownloadStatus, setVersionsDownloadStatus] = useState([]);

  const uid = useSelector((state) => state.auth.user.uid);

  useEffect(() => {
    if (!modelData) return;
    const versionStatusInputData = modelData.data.modelVersions.map(
      (version, i) => {
        if (modelData?.modelVersionsCustomData.hasOwnProperty(version.id)) {
          const versionsCustomData =
            modelData?.modelVersionsCustomData[version.id];
          return {
            type: "checkbox",
            id: versionsCustomData.versionId + "in",
            name: versionsCustomData.versionName,
            label: versionsCustomData.versionName,
            value: versionsCustomData.downloadStatus,
          };
        } else {
          return {
            type: "checkbox",
            id: version.id + "in",
            name: version.id,
            label: version.name,
            value: false,
          };
        }
      }
    );

    setVersionsDownloadStatus(versionStatusInputData || []);
  }, [modelData]);

  const saveModelHandler = async (e) => {
    try {
      e.preventDefault();
      setIsSaving(true);
      seteErrorMessage("");
      seteSuccessMessage("");

      if (!navigator?.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }

      const updatedVersionData = { ...modelData.modelVersionsCustomData };
      versionsDownloadStatus.forEach((version) => {
        const id = parseInt(version.id);
        updatedVersionData[id] = {
          ...updatedVersionData[id],
          downloadStatus: version.value,
        };
      });

      const activePreviewId = modelData.data.modelVersions.find(
        (version) => updatedVersionData[version.id].downloadStatus === true
      )?.id;
      const activePreviewImg =
        (activePreviewId &&
          modelData.data.modelVersions
            ?.find((version) => version.id === activePreviewId)
            .images?.filter((img, i) => img.type === "image")[0]?.url) ||
        "";

      const previewImgDefault =
        modelData.data.modelVersions[0].images?.filter(
          (img, i) => img.type === "image"
        )[0]?.url || "";

      const previewImg = activePreviewImg || previewImgDefault;

      const modelsRef = doc(
        firestore,
        "users",
        uid,
        "models",
        modelData.id + ""
      );
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelData.id + ""
      );

      await updateDoc(
        modelsRef,
        {
          modelVersionsCustomData: updatedVersionData,
        },
        { merge: true }
      );

      await updateDoc(
        modelsPrevRef,
        {
          imgUrl: previewImg,
          modelVersionsCustomData: updatedVersionData,
        },
        { merge: true }
      );
      seteSuccessMessage(SAVED_SUCCESS_MESSAGE);
      setIsSaving(false);
    } catch (err) {
      console.log(err.message);
      seteErrorMessage(err.message);
      setIsSaving(false);
    }
  };

  const versionStatusChangeHandler = (e) => {
    setVersionsDownloadStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex(
        (version) => version.id === e.target.id
      );
      // console.log(e.target.checked);

      newState[curIndex].value = e.target.checked;
      // console.log(newState);
      return newState;
    });
  };

  const versionStatusHtml = versionsDownloadStatus?.map((version) => {
    return (
      <div className={classes["example-field"]} key={version.id}>
        <Checkbox
          id={version.id}
          name={version.name}
          checked={version.value}
          label={version.label}
          onChange={versionStatusChangeHandler}
        />
      </div>
    );
  });

  return (
    <form onSubmit={saveModelHandler} className={classes["form"]}>
      <div className={classes.fields}>
        <FieldCategory>
          {modelData && (
            <Fieldset legend="Model versions" className={classes.versions}>
              {versionStatusHtml}
            </Fieldset>
          )}
        </FieldCategory>
      </div>
      <Buttton type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : "Saving..."}
      </Buttton>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </form>
  );
};

export default VersionStatusForm;
