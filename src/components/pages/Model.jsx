import React, { useEffect, useState } from "react";
import classes from "./Model.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import Carousel from "../carousel/Carousel";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import { useDispatch, useSelector } from "react-redux";
import { getModel, modelActions } from "../../store/model";
import VersionForm from "../forms/version-form/VersionForm";
import SaveImageForm from "../forms/save-image-form/SaveImageForm";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";

const Model = () => {
  const [modelPreview, setModelPreview] = useState({});
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [currVersionIndex, setCurrVersionIndex] = useState(null);
  const [curCustomVersionData, setCurCustomVersionData] = useState({});
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState();
  const { modelId } = useParams();
  const model = useSelector((state) => state.model.model);
  const isLoading = useSelector((state) => state.model.isLoading);
  const curVersion = useSelector((state) => state.model.curVersion);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const dispatch = useDispatch();
  console.log(curVersion);

  useEffect(() => {
    // resetExamples();
    if (!isAuth) return;
    dispatch(getModel(modelId));
    setCurCustomVersionData({});
    return () => {
      // resetExamples();
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
    };
  }, [modelId, isAuth, dispatch]);

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
    console.log(curCustomVersion);
    setCurCustomVersionData(curCustomVersion);

    if (!curImagesModelVersionId)
      setCurImagesModelVersionId(curCustomVersion?.versionId || curVersion.id);
  }, [model, curVersion, curImagesModelVersionId]);

  useEffect(() => {
    if (currVersionIndex === null) return;
    dispatch(
      modelActions.setCurVersion(model?.data?.modelVersions[currVersionIndex])
    );
  }, [model, currVersionIndex, dispatch]);

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
    setCurrVersionIndex(e.target.dataset.version);
    // setCurImagesModelVersionId(curVer.id);
    // setCurVersion(curVer);
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
    Object.values(model.modelVersionsCustomData).flatMap((version, i) => {
      if (!version.downloadStatus) return [];
      return (
        <div key={i}>
          <div>{version.versionName}</div>
          <VersionForm
            versionData={version}
            modelId={model.id}
            // mainCat={model.main}
            modelType={model.data.type}
          />
        </div>
      );
    });

  return (
    <div className={classes.model}>
      {!isLoading && (
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
          {!isLoading && modelImagesHtml}
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
              <div>{curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}</div>
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
