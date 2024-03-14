import { useDispatch, useSelector } from "react-redux";
// import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import VersionForm from "../../forms/version-form/VersionForm";
import classes from "./ModelSettings.module.scss";
import { useEffect, useState } from "react";
import Buttton from "../../ui/Button";
import VersionStatusForm from "../../forms/version-status-form/VersionStatusForm";
import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import { updateModel } from "../../../store/model";
import { getModelData } from "../../../utils/fetchUtils";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";

const firestore = getFirestore(firebaseApp);

const ModelSettings = () => {
  const [curTab, setCurTab] = useState("general");
  const [curVersionData, setCurVersionData] = useState(null);
  const [curVersionDefData, setCurVersionDefData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const model = useSelector((state) => state.model.model);
  const uid = useSelector((state) => state.auth.user.uid);
  const dispatch = useDispatch();

  useEffect(() => {
    const customData = model.modelVersionsCustomData[curTab];
    const defData = model.data.modelVersions.find(
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
  };

  const updateModelHandler = async () => {
    try {
      setIsLoading(true);
      seteErrorMessage("");
      seteSuccessMessage("");
      console.log("UPD");
      const newModelData = await getModelData(model.id);

      const newVerison = newModelData.modelVersions.filter(
        (version) =>
          !model.data.modelVersions.some(
            (oldVersions) => version.id === oldVersions.id
          )
      );
      console.log(newVerison);
      if (!newVerison.length) {
        console.log("NO UPDATEDS");
        seteSuccessMessage("No new wersion found");
        setIsLoading(false);
        return;
      }

      newModelData.modelVersions = [...newVerison, ...model.data.modelVersions];
      console.log(newModelData);

      const newVersionsCustomData = {};

      newVerison.forEach((version, i) => {
        newVersionsCustomData[version.id] = {
          versionId: version.id,
          versionName: version.name,
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
        },
        { merge: true }
      );
      seteSuccessMessage("Updated");
      setIsLoading(false);
    } catch (err) {
      seteErrorMessage(err.message);
      setIsLoading(false);
      console.log(err);
    }
  };

  const modelVersionsHtml = model?.data?.modelVersions.flatMap((version, i) => {
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
  });

  return (
    <div className={classes.wrap}>
      <ul className={classes["menu"]}>
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
      <div className={classes.content}>
        {curTab === "general" && (
          <div>
            <div className={classes['update']}>
              <Buttton
                type="button"
                onClick={updateModelHandler}
                disabled={isLoading}
              >
                {!isLoading ? "Update" : "L..."}
              </Buttton>
              {successMessage && <span>{successMessage}</span>}
              {errorMessage && <span>{errorMessage}</span>}
            </div>

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
      <SaveImageForm modelData={model} />
    </div>
  );
};

export default ModelSettings;
