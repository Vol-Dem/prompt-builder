import classes from "./ImageCard.module.scss";
import TagList from "../tag-list/TagList";
import { useEffect, useState } from "react";
import { getImageInfo } from "../../utils/fetchUtils";
import Spinner from "../ui/Spinner";
// import { useDispatch } from "react-redux";
// import { promptActions } from "../../store/prompt";

const ImageCard = ({ imageData, closeImg, curImgId, isOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageResources, setImageResources] = useState([]);
  // const dispatch = useDispatch();

  useEffect(() => {
    console.log("START FETCH");
    const loadResoursesInfo = async () => {
      try {
        setIsLoading(true);
        console.log(imageData);
        console.log(isOpen);
        const imageWithResInfo = await getImageInfo(imageData);
        console.log(imageWithResInfo);
        const imageResourcesInfo =
          imageWithResInfo.meta?.civitaiResources ||
          imageWithResInfo.meta?.resources;
        console.log(imageResourcesInfo);
        setImageResources(imageResourcesInfo);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setErrorMessage(err.message);
        setIsLoading(false);
      }
    };
    loadResoursesInfo();

    return () => {
      console.log("CLEAN");
    };
  }, [imageData]);

  const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  const positiveWordsArr = imageData.meta?.prompt
    ?.split(splitRegEx)
    ?.flatMap((tag) => tag.trim() || []);
  const negativeWordsArr = imageData.meta?.negativePrompt
    ?.split(splitRegEx)
    ?.flatMap((tag) => tag.trim() || []);

  const resourcesHtml = imageResources?.map((resource, i) => (
    <li key={i} className={classes["resource"]}>
      {resource?.modelId && (
        <>
          <a
            href={`https://civitai.com/models/${resource?.modelId}${
              resource?.versionId
                ? `?modelVersionId=${resource?.versionId}`
                : ""
            }`}
            target="blank"
            className={classes["resource__name"]}
          >
            {resource?.name || resource.modelVersionId}
          </a>
          {" / "}
          <a
            href={`/model/${resource?.modelId}`}
            target="blank"
            className={classes["resource__name"]}
          >
            In my collection
          </a>
        </>
      )}
      {!resource?.modelId && (
        <div>{resource?.name || resource.modelVersionId}</div>
      )}
      <div>{resource?.versionName}</div>
      <div className={classes["resource__info"]}>
        <div className={classes["resource__type"]}>{resource.type}</div>
        {resource?.weight && <div>weight: {resource?.weight || ""}</div>}
      </div>
    </li>
  ));

  // const copyAllPromptHandler = (e) => {
  //   const promt = imageData.meta[e.target.id];
  //   navigator.clipboard.writeText(promt);
  // };

  // const addAllPromptHandler = (e) => {
  //   // const prompt = imageData.meta[e.target.id];
  //   const prompt =
  //     e.target.dataset.type === "positive"
  //       ? positiveWordsArr
  //       : negativeWordsArr;

  //   dispatch(
  //     promptActions.addAllTagsToPrompt({
  //       type: e.target.dataset.type,
  //       value: prompt,
  //     })
  //   );
  // };

  // const removeAllPromptHandler = (e) => {
  //   const prompt =
  //     e.target.dataset.type === "positive"
  //       ? positiveWordsArr
  //       : negativeWordsArr;

  //   dispatch(
  //     promptActions.removeAllTags({
  //       type: e.target.dataset.type,
  //       value: prompt,
  //     })
  //   );
  // };

  const copyHandler = (e) => {
    navigator.clipboard.writeText(e.target.innerText);
  };

  return (
    <>
      <div className={classes.example}>
        <div className={classes["example__info"]}>
          <>
            <div className={classes["example__prompt"]}>
              <TagList
                name="Positive prompt"
                tags={positiveWordsArr}
                promptType="positive"
                className={classes["tags__list"]}
              />
              <TagList
                name="Negative prompt"
                tags={negativeWordsArr}
                promptType="negative"
                className={classes["tags__list"]}
              />
            </div>
            <div className={classes["example__config"]}>
              {/* <button onClick={closeImg}>Close</button> */}
              <div className={classes["btn__close"]} onClick={closeImg}>
                <span className={classes["btn__cross"]}></span>
              </div>

              <div>Post ID: {imageData?.postId}</div>
              <div>Image ID: {imageData?.id}</div>
              <div>CFG scale: {imageData.meta?.cfgScale}</div>
              <div>Steps : {imageData.meta?.steps}</div>
              <div>Sampler : {imageData.meta?.sampler}</div>
              <div>
                Seed :
                <span className={classes.seed} onClick={copyHandler}>
                  {imageData.meta?.seed}
                </span>
              </div>
              <div className={classes["config__name"]}>
                Checkpoint : {!imageData.meta?.modelId && imageData.meta?.Model}
                {imageData.meta?.modelId && (
                  <a
                    href={`https://civitai.com/models/${
                      imageData.meta?.modelId
                    }${
                      imageData.meta?.versionId
                        ? `?modelVersionId=${imageData.meta?.versionId}`
                        : ""
                    }`}
                    target="blank"
                    className={classes["resource__name"]}
                  >
                    {imageData.meta?.modelName || imageData.meta.modelVersionId}
                  </a>
                )}
              </div>
              <div>Size: {imageData.meta?.Size}</div>
              <div>Clip Skip: {imageData.meta?.clipSkip}</div>
              <div>
                <a
                  target="blank"
                  href={`https://civitai.com/images/${imageData.id}`}
                  className={classes.link}
                >
                  Show on civitai.com
                </a>
              </div>
              {isLoading && (
                <div className={classes["spiner-container"]}>
                  <Spinner size="medium" />
                </div>
              )}

              {!isLoading && (
                <div>
                  Resourses:
                  <ul className={classes["example__resourses"]}>
                    {resourcesHtml}
                  </ul>
                </div>
              )}
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default ImageCard;
