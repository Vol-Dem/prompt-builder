import React, { useEffect, useState, version } from "react";
import classes from "./Model.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase-config";
import { onValue, ref } from "firebase/database";
import { useSelector } from "react-redux";
import ImageCard from "../image-card/ImageCard";
import TagList from "../tag-list/TagList";
import Tag from "../tag/Tag";
import Carousel from "../carousel/Carousel";
import Tab from "../ui/tab/Tab";

const Model = () => {
  const [model, setModel] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [curVersion, setCurVersion] = useState(null);
  const { modelId } = useParams();

  useEffect(() => {
    setIsLoading(true);
    const modelRef = ref(db, `models/` + modelId);

    onValue(modelRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      setModel(data);
      setCurVersion(data?.data?.modelVersions[0]);
      setIsLoading(false);
    });
  }, [modelId]);

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
    return <Carousel key={i} images={item.items} visibleAmount={1} />;
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

  return (
    <div className={classes.model}>
      {!isLoading && (
        <>
          <button onClick={backHandler}>Back</button>
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
            </div>
            <div className={classes["tags"]}>
              <div>Main tag:</div>
              <ul className={classes["main-tag"]}>
                <Tag tag={model?.mainTag} />
              </ul>
              {curVersion.trainedWords && (
                <>
                  <div>Trigger Words:</div>
                  <TagList tags={curVersion.trainedWords} />
                </>
              )}
              {model?.helperTags && (
                <>
                  <div>Helper Words:</div>
                  <TagList tags={model?.helperTags} />
                </>
              )}
              {model?.negativeTags && (
                <>
                  <div>Negative Words:</div>
                  <TagList tags={model?.negativeTags} />
                </>
              )}
            </div>
          </div>
          <h3>Version description:</h3>
          <div>{curVersion.description?.replace(/(<([^>]+)>)/gi, "")}</div>
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
