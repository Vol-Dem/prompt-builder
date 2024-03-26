import React, { useEffect, useRef, useState } from "react";
import classes from "./Model.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import Carousel from "../carousel/Carousel";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
// import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
// import VersionForm from "../forms/version-form/VersionForm";
// import SaveImageForm from "../forms/save-image-form/SaveImageForm";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import ModelSettings from "../model/model-settings/ModelSettings";
import TagSets from "../model/tag-sets/TagSets";
import { usedModelsActions } from "../../store/usedModels";

const firestore = getFirestore(firebaseApp);

const minDescriptionHeight = 200;

const Model = () => {
  const [modelPreview, setModelPreview] = useState({});
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
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
  const descriptionRef = useRef();
  // const descriptionHeight = useRef()

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
    const curVersionCustomData = model.modelVersionsCustomData[curVersion.id];
    const modelPreviewData = {
      id: model?.id,
      src: model?.src,
      main: model?.main,
      sub: model?.sub,
      title: model.name || model.title || model?.data?.name,
      versionName: curVersionCustomData?.name,
      imgUrl: curVersion?.images ? curVersion?.images[0]?.url : "",
      type: model?.data?.type,
      baseModel: curVersion?.baseModel,
      mainTag: curVersionCustomData?.mainTag || model?.mainTag,
      weight: curVersionCustomData?.weight || model?.defaultCustomData.weight,
      minWeight:
        curVersionCustomData?.minWeight || model?.defaultCustomData.minWeight,
      maxWeight:
        curVersionCustomData?.maxWeight || model?.defaultCustomData.maxWeight,
      size: curVersionCustomData?.size || model?.defaultCustomData.size,
      tags: curVersionCustomData?.trainedWords || curVersion?.trainedWords,
      helperTags:
        curVersionCustomData?.helperTags || model?.defaultCustomData.helperTags,
      updatedAt: model?.updatedAt,
    };
    console.log(curVersionCustomData);
    console.log(modelPreviewData);

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
    console.log(curVer);
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

  const openDescriptionHandler = () => {
    setDescriptionIsOpen((prevState) => !prevState);
  };

  const addToSidePanelHandler = () => {
    dispatch(usedModelsActions.addModelToPanel(modelPreview));
  };

  return (
    <div className={classes.model}>
      {isLoading && <div>Loading...</div>}
      {!isLoading && errorMessage && <div>{errorMessage}</div>}
      {!isLoading && !errorMessage && model?.id && (
        <>
          <div className={classes["panel"]}>
            <button className={classes["btn-back"]} onClick={backHandler}>
              Back
            </button>
            <div className={classes.categories}>
              {model?.main}
              <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
            </div>
            <button
              className={`${classes["btn-edit"]} ${
                editIsOpen ? classes["btn-edit--active"] : ""
              }`}
              onClick={openEditHandler}
            >
              Edit
            </button>
          </div>
          {editIsOpen && <ModelSettings />}
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>
              {model?.name || model?.data?.name}
            </h1>
            <button
              onClick={addToSidePanelHandler}
              className={classes["btn-add"]}
            >
              +
            </button>
          </div>
          <ul className={classes.versions}>{modelVersionsHtml}</ul>
          {modelImagesHtml}
          <div className={classes["info-container"]}>
            <ModelInfo customData={curCustomVersionData} />
            <ModelTags
              customData={curCustomVersionData}
              modelPreview={modelPreview}
            />
          </div>
          <TagSets
            customData={curCustomVersionData?.tagSetsData}
            defaultData={model?.defaultCustomData?.tagSetsData}
          />
          {curVersion?.description && (
            <>
              <h2 className="h2">Version description:</h2>
              <div className={classes.description}>
                {curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}
              </div>
            </>
          )}
          <h2 className="h2">Description:</h2>
          <div
            className={`${classes.description} ${
              descriptionIsOpen ? classes["description--open"] : ""
            }`}
            style={{
              maxHeight: `${
                descriptionIsOpen
                  ? descriptionRef.current.offsetHeight
                  : minDescriptionHeight
              }px`,
            }}
          >
            <div ref={descriptionRef}>
              {model?.defaultCustomData?.description ||
                model?.data?.description?.replace(/(<([^>]+)>)/gi, "")}
            </div>
          </div>
          {descriptionRef?.current?.offsetHeight > minDescriptionHeight && (
            <span
              className={classes["description__btn-show"]}
              onClick={openDescriptionHandler}
            >
              Read more
            </span>
          )}

          <h2 className="h2">Exapmles:</h2>
          <GeneratedImages customData={curCustomVersionData} />
        </>
      )}
    </div>
  );
};

export default Model;
