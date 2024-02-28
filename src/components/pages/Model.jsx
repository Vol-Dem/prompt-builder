import React, { useEffect, useState } from "react";
import classes from "./Model.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import Carousel from "../carousel/Carousel";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import VersionForm from "../forms/version-form/VersionForm";
import SaveImageForm from "../forms/save-image-form/SaveImageForm";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";

const firestore = getFirestore(firebaseApp);

const Model = () => {
  const [modelPreview, setModelPreview] = useState({});
  const [editIsOpen, setEditIsOpen] = useState(false);
  // const [currVersionIndex, setCurrVersionIndex] = useState(null);
  const [curCustomVersionData, setCurCustomVersionData] = useState({});
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { modelId } = useParams();
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const uid = useSelector((state) => state.auth.user.uid);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuth) return;

    setIsLoading(true);

    const unsub = onSnapshot(
      doc(firestore, "users", uid, "models", modelId),
      (doc) => {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source);
        const data = doc.data();
        console.log(data);
        if (!data) {
          setErrorMessage("Failed to load model");
          setIsLoading(false);
          return;
        }
        dispatch(modelActions.setModelData(data));
        dispatch(modelActions.setModelPreview({}));
        setIsLoading(false);
      }
    );

    return () => {
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
      unsub();
    };
  }, [modelId, isAuth, dispatch, uid]);

  useEffect(() => {
    if (!Object.keys(model).length) return;
    const curVersionId = model.data.modelVersions.find(
      (version) =>
        model?.modelVersionsCustomData.hasOwnProperty(version.id) &&
        model.modelVersionsCustomData[version.id].downloadStatus
    )?.id;
    const curVersionData = curVersionId
      ? model.data.modelVersions.find((version) => version.id === curVersionId)
      : model.data.modelVersions[0];

    if (model.data.id !== curVersion.modelId)
      dispatch(modelActions.setCurVersion(curVersionData));
  }, [model, dispatch, curVersion.modelId]);

  useEffect(() => {
    if (!curVersion?.baseModel) return;
    const modelPreviewData = {
      id: model?.id,
      src: model?.src,
      main: model?.main,
      sub: model?.sub,
      title: model?.data?.name,
      imgUrl: curVersion?.images ? curVersion?.images[0]?.url : "",
      type: model?.data?.type,
      baseModel: curVersion?.baseModel,
      mainTag: model?.mainTag,
      weight: model?.weight,
      size: model?.size,
      tags: curVersion?.trainedWords,
      helperTags: model?.helperTags,
      updatedAt: model?.updatedAt,
    };

    setModelPreview(modelPreviewData);
    const curCustomVersion = model.modelVersionsCustomData[curVersion.id];
    setCurCustomVersionData(curCustomVersion);

    if (!curImagesModelVersionId)
      setCurImagesModelVersionId(curCustomVersion?.versionId || curVersion.id);
  }, [model, curVersion, curImagesModelVersionId]);

  // useEffect(() => {
  //   if (currVersionIndex === null) return;
  //   dispatch(
  //     modelActions.setCurVersion(model?.data?.modelVersions[currVersionIndex])
  //   );
  // }, [model, currVersionIndex, dispatch]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );

    // resetExamples();
    dispatch(modelActions.setCurVersion(curVer));
    // setCurrVersionIndex(e.target.dataset.version);
  };

  const modelImagesHtml = (
    <div id={curVersion?.name}>
      <Carousel images={curVersion?.images} />
    </div>
  );

  const modelVersionsHtml = model?.data?.modelVersions.map((version, i) => {
    const isSaved = model.modelVersionsCustomData[version.id]?.downloadStatus;
    return (
      <div
        key={i}
        id={version.id}
        data-version={i}
        onClick={openVersionHandler}
        className={`${classes.version} ${
          curVersion?.id === version.id ? classes["version--active"] : ""
        }
        ${isSaved ? classes["version--downloaded"] : ""}`}
      >
        {version.name}
      </div>
    );
  });

  const subCatsHtml = model?.sub?.map((sub, i) => <li key={i}>{sub}</li>);

  const openEditHandler = () => {
    setEditIsOpen((prevState) => !prevState);
  };

  const versionFormsHtml =
    model?.modelVersionsCustomData &&
    model.data.modelVersions.flatMap((version, i) => {
      const customData = model.modelVersionsCustomData[version.id];
      if (!customData?.downloadStatus) return [];
      return (
        <div key={i}>
          <div>{customData.versionName}</div>
          <VersionForm
            versionData={customData}
            modelId={model.id}
            modelType={model.data.type}
          />
        </div>
      );
    });

  return (
    <div className={classes.model}>
      {isLoading && <div>Loading...</div>}
      {!isLoading && errorMessage && <div>{errorMessage}</div>}
      {!isLoading && !errorMessage && (
        <>
          <div className={classes["panel"]}>
            <button className={classes["btn-back"]} onClick={backHandler}>
              Back
            </button>
            <div className={classes.categories}>
              {model?.main}
              <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
            </div>
            <button className={classes["btn-edit"]} onClick={openEditHandler}>
              Edit
            </button>
          </div>
          {editIsOpen && model.data.type !== "Checkpoint" && (
            <UpdateModelForm modelData={model} />
          )}
          {editIsOpen && model.data.type === "Checkpoint" && (
            <UpdateModelForm modelData={model} formType="Checkpoint" />
          )}
          {editIsOpen && versionFormsHtml}
          {editIsOpen && <SaveImageForm modelData={model} />}

          <div className={classes.title}> {model?.data?.name}</div>
          <ul className={classes.versions}>{modelVersionsHtml}</ul>
          {modelImagesHtml}
          <div className={classes["info-container"]}>
            <ModelInfo customData={curCustomVersionData} />
            <ModelTags
              customData={curCustomVersionData}
              modelPreview={modelPreview}
            />
          </div>
          {curVersion?.description && (
            <>
              <h3>Version description:</h3>
              <div className={classes.description}>
                {curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}
              </div>
            </>
          )}
          <h3>Description:</h3>
          <div>{model?.data?.description?.replace(/(<([^>]+)>)/gi, "")}</div>

          <div>Exapmles:</div>
          <GeneratedImages customData={curCustomVersionData} />
        </>
      )}
    </div>
  );
};

export default Model;
