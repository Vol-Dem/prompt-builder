import React, { useState } from "react";
import Input from "../../ui/Input";
import { TITLE_MAX_LENGTH } from "../../../variables/constants";
import Buttton from "../../ui/Button";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";

const firestore = getFirestore(firebaseApp);

const ArchiveForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [modelIdInput, setModelIdInput] = useState({
    value: "",
    isValid: true,
  });
  const [modelVersionIdInput, setModelVersionIdInput] = useState({
    value: "",
    isValid: true,
  });
  const [nameInput, setNameInput] = useState({
    value: "",
    isValid: true,
  });
  const [versionNameInput, setVersionNameInput] = useState({
    value: "",
    isValid: true,
  });
  const [baseModelInput, setBaseModelInput] = useState({
    value: "",
    isValid: true,
  });

  const uid = useSelector((state) => state.auth.user.uid);

  const saveModelHandler = async (e) => {
    e.preventDefault();
    console.log(modelIdInput.value);
    console.log(modelVersionIdInput.value);
    const modelId = +modelIdInput.value;
    const modelVersionId = +modelVersionIdInput.value;
    const modelName = nameInput.value;
    const versionName = versionNameInput.value;
    const baseModel = baseModelInput.value;

    const modelData = {
      createdAt: Date.now(),
      data: {
        description: "",
        id: modelId,
        modelVersions: [
          {
            id: modelVersionId,
            baseModel: baseModel,
            name: versionName,
            files: [
              {
                hashes: {
                  AutoV3: "",
                },
                primary: true,
                name: "",
              },
            ],
            images: [],
            trainedWords: [],
          },
        ],
        name: modelName,
        nsfw: false,
        type: "LORA",
      },
      defaultCustomData: {
        description: "",
      },
      id: modelId,
      main: "archive",
      modelType: "lora",
      modelVersionsCustomData: {
        [modelVersionId]: {
          baseModel: baseModel,
          downloadStatus: true,
          trainedWords: [],
          versionId: modelVersionId,
          versionImageUrl: "",
          versionName: versionName,
        },
      },
      name: modelName,
      src: "civitai.com",
      sub: ["archive"],
      updatedAt: new Date().toISOString(),
      versionIds: [modelVersionId],
    };

    const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
    console.log(modelData);
    await setDoc(modelsRef, modelData);
  };

  return (
    <div>
      <Buttton
        onClick={() => {
          setShowForm((prevState) => !prevState);
        }}
      >
        Add Archived Model
      </Buttton>
      {showForm && (
        <form onSubmit={saveModelHandler}>
          <Input
            name="id"
            label="Model ID"
            type="text"
            placeholder="Model ID"
            value={modelIdInput.value}
            onChange={(e, isValid) => {
              setModelIdInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Input
            name="versionId"
            label="Model Version ID"
            type="text"
            placeholder="Model Version ID"
            value={modelVersionIdInput.value}
            onChange={(e, isValid) => {
              setModelVersionIdInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Input
            name="nameInput"
            label="Model Name"
            type="text"
            placeholder="Model Name"
            value={nameInput.value}
            onChange={(e, isValid) => {
              setNameInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Input
            name="versionNameInput"
            label="Model Version Name"
            type="text"
            placeholder="Model Version Name"
            value={versionNameInput.value}
            onChange={(e, isValid) => {
              setVersionNameInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Input
            name="baseModelInput"
            label="baseModel"
            type="text"
            placeholder="baseModel"
            value={baseModelInput.value}
            onChange={(e, isValid) => {
              setBaseModelInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Buttton>Save</Buttton>
        </form>
      )}
    </div>
  );
};

export default ArchiveForm;
