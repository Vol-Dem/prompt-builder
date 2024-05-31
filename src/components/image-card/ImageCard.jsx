import classes from "./ImageCard.module.scss";
import TagList from "../tag-list/TagList";
import { useEffect, useState } from "react";
import { getImageInfo, getModelInfo } from "../../utils/fetchUtils";
import Spinner from "../ui/Spinner";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addModelToPanel } from "../../store/usedModels";
import ButtonAdd from "../ui/ButtonAdd";
import { Link } from "react-router-dom";
import { modelActions } from "../../store/model";
import LinkA from "../ui/LinkA";
// import { promptActions } from "../../store/prompt";

const firestore = getFirestore(firebaseApp);

const ImageCard = ({ currImgNum }) => {
  const [imageData, setImageData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageResources, setImageResources] = useState([]);
  const [modelInfoCiv, setModelInfoCiv] = useState({});
  const [modelInfo, setModelInfo] = useState({});
  const uid = useSelector((state) => state.auth.user.uid);
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!!activeCarouselData?.images?.length) {
      // console.log(activeCarouselData?.images[activeCarouselData.currImgNum]);
      console.log(
        activeCarouselData?.images[activeCarouselData?.currImgNum || 0]
      );
      setImageData(
        activeCarouselData?.images[activeCarouselData?.currImgNum || 0]
      );
    } else {
      setImageData({});
    }
  }, [activeCarouselData]);

  useEffect(() => {
    console.log("IMGCARD");
    setImageResources([]);
    setModelInfoCiv({});
    setModelInfo({});
  }, [imageData]);

  useEffect(() => {
    // console.log(imageData);
    // console.log(activeCarouselData);
    // console.log(currImgNum);

    if (imageData?.url) {
      console.log("START FETCH");
      setIsLoading(true);
      const loadResoursesInfo = async () => {
        try {
          let modelHash = "";
          if (imageData?.meta?.hasOwnProperty("Model hash")) {
            modelHash = imageData?.meta["Model hash"];
          } else if (imageData?.meta?.hasOwnProperty("Modelhash")) {
            modelHash = imageData?.meta["Modelhash"];
          }

          const modelQ = query(
            collection(firestore, "users", uid, `preview`),
            where("hashes", "array-contains", modelHash)
          );

          const modelQuerySnapshot = await getDocs(modelQ);

          const modelInfoData = modelQuerySnapshot.docs.map((doc) => {
            // doc.data() is never undefined for query doc snapshots
            return doc.data();
          });
          console.log(modelHash);
          console.log(modelInfoData);

          const modelData = await getModelInfo(imageData?.meta);
          console.log(modelData);

          const curImgResources =
            imageData?.meta?.civitaiResources || imageData?.meta?.resources;

          const modelVersionIds = curImgResources
            ?.map((resource) => resource?.modelVersionId || resource?.versionId)
            ?.filter(Boolean);

          const modelHashes = curImgResources
            ?.map((resource) => resource?.hash)
            ?.filter(Boolean);

          const modelNames = curImgResources
            ?.flatMap((resource) => {
              if (
                !resource?.modelVersionId &&
                !resource?.versionId &&
                !resource?.hash
              ) {
                return resource?.name;
              }
              return [];
            })
            ?.filter(Boolean);

          console.log(curImgResources);
          console.log(modelVersionIds);

          if (!!modelVersionIds?.length || !!modelHashes?.length) {
            console.log(imageData);
            const imageWithResCiv = await getImageInfo(imageData);
            console.log(imageWithResCiv);
            const resourcesInfoCiv =
              imageWithResCiv.meta?.civitaiResources ||
              imageWithResCiv.meta?.resources;
            console.log(resourcesInfoCiv);

            let q;

            let modelsPrewiewByFileNames = [];

            if (!!modelVersionIds.length) {
              q = query(
                collection(firestore, "users", uid, `preview`),
                where("versionIds", "array-contains-any", modelVersionIds)
              );
            } else if (!!modelHashes.length) {
              q = query(
                collection(firestore, "users", uid, `preview`),
                where("hashes", "array-contains-any", modelHashes)
              );
            }
            if (!!modelNames.length) {
              const qFileNames = query(
                collection(firestore, "users", uid, `preview`),
                where("fileNames", "array-contains-any", modelNames)
              );

              const queryFileNamesSnapshot = await getDocs(qFileNames);

              modelsPrewiewByFileNames = queryFileNamesSnapshot.docs.map(
                (doc) => {
                  // doc.data() is never undefined for query doc snapshots
                  return doc.data();
                }
              );
            }

            // const q = query(
            //   collection(firestore, "users", uid, `preview`),
            //   // where("versionIds", "array-contains-any", modelVersionIds),
            //   where("hashes", "array-contains-any", modelHashes)
            // );
            const querySnapshot = await getDocs(q);

            const modelsPrewiew = querySnapshot.docs.map((doc) => {
              // doc.data() is never undefined for query doc snapshots
              return doc.data();
            });
            console.log(modelsPrewiew);

            const allModelsPrewiew = [
              ...modelsPrewiew,
              ...modelsPrewiewByFileNames,
            ];

            const resources = resourcesInfoCiv.map((resource) => {
              const versionId = resource?.modelVersionId || resource?.versionId;
              const preview = allModelsPrewiew.find(
                (preview) =>
                  preview?.versionIds?.includes(versionId) ||
                  preview?.hashes?.includes(resource.hash) ||
                  preview?.fileNames?.includes(resource.name)
              );

              if (preview) {
                return {
                  ...resource,
                  preview,
                };
              }
              return resource;
            });

            console.log(resources);

            if (!!modelInfoData?.length) {
              setModelInfo(modelInfoData[0]);
            }
            setModelInfoCiv(modelData);
            setImageResources(resources);
          } else {
            setImageResources(curImgResources);
          }
          setIsLoading(false);
        } catch (err) {
          console.log(err);
          setErrorMessage(err);
          setIsLoading(false);
        }
      };
      loadResoursesInfo();
    }
    return () => {
      console.log("CLEAN");
    };
  }, [imageData, uid]);

  const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  const positiveWordsArr = imageData?.meta?.prompt
    ?.split(splitRegEx)
    ?.flatMap((tag) => tag.trim() || []);
  const negativeWordsArr = imageData?.meta?.negativePrompt
    ?.split(splitRegEx)
    ?.flatMap((tag) => tag.trim() || []);

  const addToSidePanelHandler = (e) => {
    const modelId = e.target.closest(`.${classes["resource__add"]}`)?.dataset
      ?.id;
    console.log(modelId);
    const previewData = imageResources.find(
      (resource) => resource?.preview?.id === +modelId
    )?.preview;
    let curVersionData =
      previewData?.modelVersionsCustomData &&
      Object.values(previewData.modelVersionsCustomData)
        .filter((data) => data.downloadStatus)
        .toSorted((a, b) => b.versionId - a.versionId)[0];

    const sidePanelData = {
      id: previewData?.id,
      src: previewData?.src,
      main: previewData?.main,
      sub: previewData?.sub,
      title: previewData?.name || previewData.title,
      versionName: curVersionData?.name,
      imgUrl: previewData?.imgUrl,
      nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl,
      type: previewData?.modelType,
      baseModel: curVersionData?.baseModel || previewData?.baseModel,
      mainTag: curVersionData?.mainTag || previewData?.mainTag,
      weight: curVersionData?.weight || previewData?.weight,
      minWeight: curVersionData?.minWeight || previewData?.minWeight,
      maxWeight: curVersionData?.maxWeight || previewData?.maxWeight,
      size: curVersionData?.size || previewData?.size,
      tags: curVersionData?.trainedWords || curVersionData?.trainedWords,
      helperTags: curVersionData?.helperTags || previewData?.helperTags,
      updatedAt: previewData?.updatedAt,
    };
    dispatch(addModelToPanel(sidePanelData));
  };

  const resourcesHtml = imageResources?.map((resource, i) => {
    const versiondId = resource?.modelVersionId || resource?.versionId;

    let versionIsSaved;
    let versionName;
    let versionIdByName;
    const version = versiondId || versionIdByName;

    if (
      versiondId &&
      resource?.preview?.modelVersionsCustomData?.hasOwnProperty(
        `${versiondId}`
      )
    ) {
      versionIsSaved =
        resource.preview.modelVersionsCustomData[versiondId].downloadStatus;
    } else {
      const curVersion =
        resource?.preview?.modelVersionsCustomData &&
        Object.values(resource?.preview?.modelVersionsCustomData).find(
          (version) => version.defFileName === resource.name
        );
      versionIsSaved = curVersion?.downloadStatus;
      versionName = curVersion?.versionName;
      versionIdByName = curVersion?.id;
    }

    return (
      <li key={i} className={classes["resource"]}>
        {resource?.preview && (
          <>
            <Link
              // href={`/model/${resource?.modelId}`}
              to={`/model/${resource?.preview?.id}`}
              state={{ versionId: version }}
              // title={resource.preview.name}
              className={`${classes["resource__link"]} ${classes["resource__name"]}`}
            >
              {resource.preview.name}
            </Link>
            {/* <div
            className={classes["resource__add"]}
            data-id={resource.preview.id}
            onClick={addToSidePanelHandler}
          >
            <span className={classes["plus"]}></span>
          </div> */}
            <ButtonAdd
              previewData={{
                ...resource.preview,
                versionName: resource?.versionName || versionName,
              }}
              versionId={version}
              className={classes["resource__add"]}
            />
          </>
        )}
        {!resource?.preview && resource?.modelId && (
          <div
            className={classes["resource__name"]}
            title={resource?.name || resource.modelVersionId}
          >
            {resource?.name || resource.modelVersionId}
          </div>
        )}
        {resource?.modelId && (
          <div className={classes["resource__field"]}>
            Source:{" "}
            <LinkA
              external={true}
              href={`https://civitai.com/models/${resource?.modelId}${
                resource?.versionId
                  ? `?modelVersionId=${resource?.versionId}`
                  : ""
              }`}
              // className={`${classes["resource__link"]} ${classes["resource__source"]}`}
            >
              {/* {resource?.name || resource.modelVersionId} */}
              civitai
            </LinkA>
          </div>
        )}
        {!resource?.modelId && !versionName && (
          <div
            className={classes["resource__name"]}
            title={resource?.name || resource.modelVersionId}
          >
            {resource?.name || resource.modelVersionId}
          </div>
        )}
        <div className={classes["resource__version"]}>
          {versionIsSaved && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          )}{" "}
          <span className={classes["resource__version-name"]}>
            {versionName || resource?.versionName}
          </span>
        </div>
        <div className={classes["resource__info"]}>
          <div className={classes["resource__type"]}>{resource.type}</div>
          {resource?.weight && <div>weight: {resource?.weight || ""}</div>}
        </div>
      </li>
    );
  });

  // const copyAllPromptHandler = (e) => {
  //   const promt = imageData?.meta[e.target.id];
  //   navigator.clipboard.writeText(promt);
  // };

  // const addAllPromptHandler = (e) => {
  //   // const prompt = imageData?.meta[e.target.id];
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
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <>
      {imageData?.url && (
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
                <div
                  className={classes["btn__close"]}
                  onClick={() => {
                    dispatch(modelActions.setActiveCarouselData({}));
                  }}
                >
                  {/* <span className={classes["btn__cross"]}></span> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                <div>
                  <span className={classes["example__info-name"]}>
                    Post ID:
                  </span>
                  {imageData?.postId}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>
                    Image ID:
                  </span>
                  {imageData?.id}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>
                    CFG scale:
                  </span>
                  {imageData?.meta?.cfgScale}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>Steps:</span>
                  {imageData?.meta?.steps}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>
                    Sampler:
                  </span>
                  {imageData?.meta?.sampler}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>Seed:</span>
                  {imageData?.meta?.seed && (
                    <span className={classes.seed} onClick={copyHandler}>
                      {imageData?.meta?.seed}
                      {!copied && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                          />
                        </svg>
                      )}
                      {copied && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                          />
                        </svg>
                      )}
                      {/* {copied && (
                      <span className={classes["seed__copied"]}>Copied</span>
                    )} */}
                    </span>
                  )}
                </div>
                <div className={classes["config__name"]}>
                  <span className={classes["example__info-name"]}>
                    Checkpoint:
                  </span>
                  {!modelInfo?.id &&
                    !!modelInfoCiv?.modelName &&
                    modelInfoCiv?.modelName}
                  {!modelInfo?.id &&
                    !modelInfoCiv?.modelName &&
                    imageData?.meta?.Model}
                  {!!modelInfo?.id && (
                    <>
                      <Link
                        to={`/model/${modelInfo?.id}`}
                        className={classes["resource__link"]}
                      >
                        {modelInfo?.name}
                      </Link>
                    </>
                  )}{" "}
                  {!!modelInfoCiv?.modelId && (
                    <span className={classes["resource__checkpoint-lk"]}>
                      {"("}
                      <LinkA
                        external={true}
                        href={`https://civitai.com/models/${
                          modelInfoCiv?.modelId
                        }${
                          modelInfoCiv?.versionId
                            ? `?modelVersionId=${modelInfoCiv?.versionId}`
                            : ""
                        }`}
                        // target="blank"
                        // className={classes["resource__link"]}
                      >
                        {/* {modelInfoCiv?.modelName || modelInfoCiv?.modelVersionId} */}
                        civitai
                      </LinkA>
                      {")"}
                    </span>
                  )}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>Size:</span>{" "}
                  {imageData?.meta?.Size}
                </div>
                <div>
                  <span className={classes["example__info-name"]}>
                    Clip Skip:
                  </span>
                  {imageData?.meta?.clipSkip}
                </div>
                <div className={classes["resource__field"]}>
                  <span className={classes["example__info-name"]}>
                    Image source:
                  </span>
                  <LinkA
                    external={true}
                    // target="blank"
                    href={`https://civitai.com/images/${imageData?.id}`}
                    // className={`${classes["resource__link"]} ${classes["resource__source"]}`}
                  >
                    civitai
                  </LinkA>
                </div>
                {isLoading && (
                  <div className={classes["spiner-container"]}>
                    <Spinner size="medium" />
                  </div>
                )}

                {!isLoading && !!resourcesHtml?.length && (
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
      )}
    </>
  );
};

export default ImageCard;
