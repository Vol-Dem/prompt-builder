import React, { useEffect, useState } from "react";
import classes from "./Model.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase-config";
import { onValue, ref } from "firebase/database";
import { useSelector } from "react-redux";
import ImageCard from "../image-card/ImageCard";
import TagList from "../tag-list/TagList";
import Tag from "../tag/Tag";
import Carousel from "../carousel/Carousel";

const Model = () => {
  const [model, setModel] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { modelId } = useParams();
  const currCategory = useSelector((state) => state.tabs.currCategory);
  // console.log(currCategory);

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await fetch(
  //         "https://civitai.com/api/v1/models/126026"
  //       );
  //       const data = await response.json();
  //       console.log(data);
  //       setModelData(data);
  //       setIsLoading(false);
  //       // console.log(modelData.modelVersions[0].images[0].url);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   getData();
  // }, []);

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://civitai.com/api/v1/images?postId=351636"
  //       );
  //       const data = await response.json();
  //       console.log(data);

  //       // console.log(modelData.modelVersions[0].images[0].url);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   getData();
  // }, []);

  useEffect(() => {
    setIsLoading(true);
    const modelRef = ref(db, `models/` + modelId);

    onValue(modelRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      setModel(data);
      setIsLoading(false);
    });
  }, [modelId]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const modelImagesHtml = model?.data?.modelVersions.map((version, i) => {
    return <Carousel key={i} images={version.images} />;
  });

  const examplesHtml = model?.examplesData?.map((item, i) => {
    return <Carousel key={i} images={item.items} visibleAmount="1" />;
    // return item.items.map((example, i) => {
    //   return <ImageCard key={i} imageData={example} />;
    // });
  });

  const modelVersionsHrml = model?.data?.modelVersions.map((version, i) => {
    return <div key={i}>{version.name}</div>;
  });

  return (
    <div className={classes.model}>
      {!isLoading && (
        <>
          <button onClick={backHandler}>Back</button>
          <div className={classes.title}> {model?.data.name}</div>
          {modelVersionsHrml}
          {!isLoading && modelImagesHtml}
          <div className={classes["info-container"]}>
            <div className={classes.info}>
              <div>{model?.data.type}</div>
              <div>Base model: {model?.data.modelVersions[0].baseModel}</div>
              <div>Size: {model?.size}</div>
              <div>Weight: {model?.weight}</div>
              <div>Version: {model?.data.modelVersions[0].name}</div>
              {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
            </div>
            <div className={classes["tags"]}>
              <div>Main tag:</div>
              <ul className={classes["main-tag"]}>
                <Tag tag={model?.mainTag} />
              </ul>
              {model?.data.modelVersions[0].trainedWords && (
                <>
                  <div>Trigger Words:</div>
                  <TagList subcat={model?.data.modelVersions[0].trainedWords} />
                </>
              )}
              {model?.helperTags && (
                <>
                  <div>Helper Words:</div>
                  <TagList subcat={model?.helperTags} />
                </>
              )}
              {model?.negativeTags && (
                <>
                  <div>Negative Words:</div>
                  <TagList subcat={model?.negativeTags} />
                </>
              )}
            </div>
          </div>

          <div>{model?.data.description?.replace(/(<([^>]+)>)/gi, "")}</div>
          <div>Exapmles:</div>
          <div className={classes.images}>{examplesHtml}</div>
        </>
      )}
    </div>
  );
};

export default Model;
