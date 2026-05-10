import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import Button from "../../ui/buttons/Button";
import FieldCategory from "../../ui/forms/FieldCategory";
import Fieldset from "../../ui/forms/Fieldset";
import classes from "./VersionStatusForm.module.scss";
import Checkbox from "../../ui/forms/Checkbox";
import firebaseApp from "../../../firebase-config";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
} from "../../../variables/constants";
import Spinner from "../../ui/Spinner";
import { handleErrors, normalizeError } from "../../../utils/generalUtils";
import type { ModelData } from "../../../types/models.types";
import { useAppSelector } from "../../../store/hooks/hooks";

const firestore = getFirestore(firebaseApp);

type VersionStatusFormProps = { modelData: ModelData };

type StatusCheckbox = {
  type: string;
  id: string;
  name: string;
  label: string;
  value: boolean;
};

/**
 * Version status form component.
 *
 * Provides editing flow for version download status.
 *
 * Responsibilities:
 * - Displays error messages.
 *
 * Side effects:
 * - Calls updateDoc to persist version status.
 *
 * @component
 *
 * @param props
 * @param props.modelData - Model data.
 * @returns Version status form.
 */
const VersionStatusForm = ({ modelData }: VersionStatusFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [versionsDownloadStatus, setVersionsDownloadStatus] = useState<
    StatusCheckbox[]
  >([]);

  const uid = useAppSelector((state) => state.auth.user.uid);

  useEffect(() => {
    if (!modelData) return;
    const versionStatusInputData = Object.values(
      modelData?.modelVersionsCustomData,
    )
      ?.sort((a, b) => {
        if (a?.index && b?.index) {
          return a?.index - b?.index;
        }
        return 0;
      })
      .map((version) => {
        return {
          type: "checkbox",
          id: version.versionId + "in",
          name: version.versionName || "",
          label: version.name || "",
          value: !!version.downloadStatus,
        };
      });

    setVersionsDownloadStatus(versionStatusInputData || []);
  }, [modelData]);

  const saveModelHandler = async (e: SubmitEvent) => {
    try {
      e.preventDefault();
      setIsSaving(true);
      seteErrorMessage("");
      seteSuccessMessage("");

      if (!navigator?.onLine) {
        throw new Error(ERROR_MESSAGE_OFFLINE);
      }

      const updatedVersionData = { ...modelData.modelVersionsCustomData };
      versionsDownloadStatus.forEach((version) => {
        const id = parseInt(version.id);
        updatedVersionData[id] = {
          ...updatedVersionData[id],
          downloadStatus: version.value,
        };
      });

      const activePreviewId = modelData.data?.modelVersions.find((version) => {
        return updatedVersionData[version.id]?.downloadStatus === true;
      })?.id;
      const activePreviewImg =
        (activePreviewId &&
          modelData.data &&
          modelData.data?.modelVersions
            ?.find((version) => version.id === activePreviewId)
            ?.images?.filter((img) => img.type === "image")[0]?.url) ||
        "";

      const previewImgDefault =
        modelData.data?.modelVersions[0].images?.filter(
          (img) => img.type === "image",
        )[0]?.url || "";

      const previewImg = activePreviewImg || previewImgDefault;

      const modelsRef = doc(
        firestore,
        "users",
        uid,
        "models",
        modelData.id + "",
      );
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelData.id + "",
      );

      await updateDoc(modelsRef, {
        modelVersionsCustomData: updatedVersionData,
      });

      await updateDoc(modelsPrevRef, {
        imgUrl: previewImg,
        modelVersionsCustomData: updatedVersionData,
      });
      seteSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setIsSaving(false);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      seteErrorMessage(errorMessage);
      setIsSaving(false);
    }
  };

  const versionStatusChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setVersionsDownloadStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex(
        (version) => version.id === e.target.id,
      );

      newState[curIndex].value = e.target.checked;
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
      <Button type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : <Spinner size="small" />}
      </Button>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </form>
  );
};

export default VersionStatusForm;
