import React, { useEffect, useState } from "react";
import classes from "./Model.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase-config";
import { onValue, ref } from "firebase/database";
// import { useSelector } from "react-redux";
// import ImageCard from "../image-card/ImageCard";
import TagList from "../tag-list/TagList";
import Tag from "../tag/Tag";
import Carousel from "../carousel/Carousel";
// import Tab from "../ui/tab/Tab";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
// import LoraForm from "../forms/lora/LoraForm";

const Model = () => {
  const [model, setModel] = useState({});
  const [modelPreview, setModelPreview] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [curVersion, setCurVersion] = useState(null);
  const { modelId } = useParams();

  useEffect(() => {
    setIsLoading(true);
    const modelRef = ref(db, `models/` + modelId);

    onValue(modelRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      // const modelPreviewData = {
      //   id: data.id,
      //   src: data.src,
      //   main: data.main,
      //   sub: data.sub,
      //   title: data.data.name,
      //   imgUrl: curVersion?.images[0]?.url,
      //   type: data.data.type,
      //   baseModel: curVersion.baseModel,
      //   mainTag: data.mainTag,
      //   weight: data.weight,
      //   size: data.size,
      //   tags: data.tags,
      //   helperTags: data.helperTags,
      //   updatedAt: data.updatedAt,
      // };
      setModel(data);
      // setModelPreview(modelPreviewData);
      setCurVersion(data?.data?.modelVersions[0]);
      setIsLoading(false);
    });
  }, [modelId]);

  useEffect(() => {
    const modelPreviewData = {
      id: model?.id,
      src: model?.src,
      main: model?.main,
      sub: model?.sub,
      title: model?.data?.name,
      imgUrl: curVersion?.images[0]?.url,
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
  }, [model, curVersion]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    console.log(id);
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );

    setCurVersion(curVer);
  };

  const modelImagesHtml = (
    <div id={curVersion?.name}>
      <Carousel images={curVersion?.images} />
    </div>
  );

  const examplesHtml = model?.examplesData?.map((item, i) => {
    return <Carousel key={i} images={item.items} visibleImgAmount={1} />;
  });

  const modelVersionsHrml = model?.data?.modelVersions.map((version, i) => {
    return (
      <div
        key={i}
        id={version.id}
        onClick={openVersionHandler}
        className={`${classes.version} ${
          curVersion.id === version.id ? classes["version--active"] : ""
        }`}
      >
        {version.name}
      </div>
    );
  });

  const subCatsHtml = model?.sub?.map((sub, i) => <li key={i}>{sub}</li>);

  const openEditHandler = () => {
    setEditIsOpen((prevState) => !prevState);
  };

  return (
    <div className={classes.model}>
      {!isLoading && (
        <>
          <div className={classes["panel"]}>
            <button className={classes["btn-back"]} onClick={backHandler}>
              Back
            </button>
            <div className={classes.categories}>
              {model.main}
              <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
            </div>
            <button className={classes["btn-edit"]} onClick={openEditHandler}>
              Edit
            </button>
          </div>
          {editIsOpen && <UpdateModelForm modelData={model} />}

          <div className={classes.title}> {model?.data.name}</div>
          <ul className={classes.versions}>{modelVersionsHrml}</ul>
          {!isLoading && modelImagesHtml}
          <div className={classes["info-container"]}>
            <div className={classes.info}>
              <div>{model?.data.type}</div>
              <div>Base model: {curVersion.baseModel}</div>
              <div>Size: {model?.size}</div>
              <div>Weight: {model?.weight}</div>
              <div>Version: {curVersion.name}</div>
              {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
              <a href={`https://${model?.src}/models/${model?.id}`}>Link</a>
            </div>
            <div className={classes["tags"]}>
              <div>Main tag:</div>
              <ul className={classes["main-tag"]}>
                <Tag
                  tag={model?.mainTag}
                  promptType="positive"
                  modelData={modelPreview}
                />
              </ul>
              {curVersion.trainedWords && (
                <>
                  <div>Trigger Words:</div>
                  <TagList
                    tags={curVersion.trainedWords}
                    promptType="positive"
                  />
                </>
              )}
              {model?.helperTags && (
                <>
                  <div>Helper Words:</div>
                  <TagList tags={model?.helperTags} promptType="positive" />
                </>
              )}
              {model?.negativeTags && (
                <>
                  <div>Negative Words:</div>
                  <TagList tags={model?.negativeTags} promptType="negative" />
                </>
              )}
            </div>
          </div>
          {curVersion?.description && (
            <>
              <h3>Version description:</h3>
              <div>{curVersion.description?.replace(/(<([^>]+)>)/gi, "")}</div>
            </>
          )}
          <h3>Description:</h3>
          <div>{model?.data.description?.replace(/(<([^>]+)>)/gi, "")}</div>
          {model?.examplesData && (
            <>
              <div>Exapmles:</div>
              <div className={classes.images}>{examplesHtml}</div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Model;
