import classes from "./ImageCard.module.scss";
import TagList from "../tag-list/TagList";
import { useEffect, useRef, useState } from "react";
import { getImageInfo } from "../../utils/fetchUtils";
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
import ButtonAdd from "../ui/ButtonAdd";
import { Link } from "react-router-dom";
import LinkA from "../ui/LinkA";
import { clearFileExtension } from "../../utils/generalUtils";
import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";
import CheckCircleSvg from "../../assets/CheckCircleSvg";
import ErrorMessage from "../ui/ErrorMessage";

const firestore = getFirestore(firebaseApp);
const civitDefEmb = [250708, 250712, 106916];
const timeoutDelay = 1000;

const ImageCard = ({ activeImgNum }) => {
  const [imageData, setImageData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageResources, setImageResources] = useState([]);
  const [modelInfoCiv, setModelInfoCiv] = useState({});
  const [modelInfo, setModelInfo] = useState({});
  const uid = useSelector((state) => state.auth.user.uid);
  const timeoutRef = useRef(null);

  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );

  useEffect(() => {
    if (!!activeCarouselData?.images?.length) {
      setImageData(activeCarouselData?.images[activeImgNum || 0]);
    } else {
      setImageData({});
    }
  }, [activeCarouselData, activeImgNum]);

  useEffect(() => {
    setImageResources([]);
    setModelInfoCiv({});
    setModelInfo({});
  }, [imageData]);

  useEffect(() => {
    if (imageData?.url) {
      setErrorMessage("");

      const loadResoursesInfo = async (curImageData) => {
        try {
          setIsLoading(true);
          // console.log(curImageData);
          //MODEL
          let modelHash = "";
          if (curImageData?.meta?.hasOwnProperty("Model hash")) {
            modelHash = curImageData?.meta["Model hash"];
          } else if (curImageData?.meta?.hasOwnProperty("Modelhash")) {
            modelHash = curImageData?.meta["Modelhash"];
          }
          let modelQ;
          if (!!modelHash) {
            modelQ = query(
              collection(firestore, "users", uid, `preview`),
              where("hashes", "array-contains", modelHash)
            );
          } else {
            const modelName = curImageData?.meta?.Model || "";
            modelQ = query(
              collection(firestore, "users", uid, `preview`),
              where("fileNames", "array-contains", modelName?.toLowerCase())
            );
          }

          const modelQuerySnapshot = await getDocs(modelQ);

          const modelInfoData = modelQuerySnapshot.docs.map((doc) => {
            // doc.data() is never undefined for query doc snapshots
            return doc.data();
          });

          // console.log(modelInfoData);

          //RESOURCES
          const imageWithResCiv = await getImageInfo(curImageData);
          // console.log(imageWithResCiv);

          let resourcesInfoCiv = [];

          if (!!imageWithResCiv?.meta?.civitaiResources?.length) {
            resourcesInfoCiv = [
              ...resourcesInfoCiv,
              ...imageWithResCiv.meta.civitaiResources,
            ].filter(
              (resource) => !civitDefEmb.includes(resource.modelVersionId)
            );
          }

          if (!!imageWithResCiv?.meta?.resources?.length) {
            resourcesInfoCiv = [
              ...resourcesInfoCiv,
              ...imageWithResCiv.meta.resources,
            ];
          }

          if (!!imageWithResCiv?.meta?.additionalResources?.length) {
            resourcesInfoCiv = [
              ...resourcesInfoCiv,
              ...imageWithResCiv.meta.additionalResources,
            ];
          }

          if (!!imageWithResCiv?.meta?.hashResources?.length) {
            resourcesInfoCiv = [
              ...resourcesInfoCiv,
              ...imageWithResCiv.meta.hashResources,
            ];
          }

          // console.log(resourcesInfoCiv);

          let modelsIds = [];
          let modelsVersionIds = [];
          let modelsHashes = [];
          let modelsNames = [];
          let allModelsPreviews = [];

          resourcesInfoCiv?.forEach((resourse) => {
            if (resourse?.modelId) {
              modelsIds.push(resourse?.modelId);
            } else if (resourse?.versionId) {
              modelsVersionIds.push(resourse?.versionId);
            } else if (resourse?.hash) {
              modelsHashes.push(resourse?.hash);
            } else if (resourse?.name) {
              modelsNames.push(
                clearFileExtension(resourse?.name).toLowerCase()
              );
            }
          });

          if (!!modelsIds.length) {
            // console.log(modelsIds);

            const q = query(
              collection(firestore, "users", uid, `preview`),
              //firestore query limit 30
              where("id", "in", modelsIds.slice(0, 29))
            );
            const querySnapshot = await getDocs(q);

            const modelsPrewiewById = querySnapshot.docs.map((doc) => {
              // doc.data() is never undefined for query doc snapshots
              return doc.data();
            });
            // console.log(modelsPrewiewById);
            allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewById];
          }

          if (!!modelsVersionIds.length) {
            // console.log(modelsVersionIds);
            const q = query(
              collection(firestore, "users", uid, `preview`),
              where("versionIds", "array-contains-any", modelsVersionIds)
            );
            const querySnapshot = await getDocs(q);

            const modelsPrewiewByVersionId = querySnapshot.docs.map((doc) => {
              // doc.data() is never undefined for query doc snapshots
              return doc.data();
            });
            // console.log(modelsPrewiewByVersionId);
            allModelsPreviews = [
              ...allModelsPreviews,
              ...modelsPrewiewByVersionId,
            ];
          }

          if (!!modelsHashes.length) {
            // console.log(modelsHashes);
            const q = query(
              collection(firestore, "users", uid, `preview`),
              where("hashes", "array-contains-any", modelsHashes)
            );
            const querySnapshot = await getDocs(q);

            const modelsPrewiewByHash = querySnapshot.docs.map((doc) => {
              // doc.data() is never undefined for query doc snapshots
              return doc.data();
            });
            // console.log(allModelsPreviews);
            // console.log(modelsPrewiewByHash);
            allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewByHash];
          }

          if (!!modelsNames.length) {
            const uniqModelsNames = modelsNames.filter(
              (name) =>
                !allModelsPreviews.find((model) => {
                  const nameArr = name.split("-");
                  // console.log(nameArr);
                  if (Number.isFinite(+nameArr[nameArr?.length - 1])) {
                    // console.log(nameArr[nameArr?.length - 1]);
                    // console.log(
                    //   name
                    //     .replace(`-${nameArr[nameArr?.length - 1]}`, "")
                    //     .toLowerCase()
                    // );
                    // console.log(
                    //   model?.fileNames?.includes(
                    //     name
                    //       .replace(`-${nameArr[nameArr?.length - 1]}`, "")
                    //       .toLowerCase()
                    //   )
                    // );
                    return model?.fileNames?.includes(
                      name
                        .replace(`-${nameArr[nameArr?.length - 1]}`, "")
                        .toLowerCase()
                    );
                  } else {
                    return model?.fileNames?.includes(name.toLowerCase());
                  }
                })
            );

            if (!!uniqModelsNames.length) {
              const q = query(
                collection(firestore, "users", uid, `preview`),
                where("fileNames", "array-contains-any", uniqModelsNames)
              );
              const querySnapshot = await getDocs(q);

              const modelsPrewiewByName = querySnapshot.docs.map((doc) => {
                // doc.data() is never undefined for query doc snapshots
                return doc.data();
              });
              // console.log(modelsPrewiewByName);
              allModelsPreviews = [
                ...allModelsPreviews,
                ...modelsPrewiewByName,
              ];
            }
          }

          // console.log("All", allModelsPreviews);
          const resources = resourcesInfoCiv?.map((resource) => {
            const versionId = resource?.modelVersionId || resource?.versionId;
            const preview = allModelsPreviews.find(
              (preview) =>
                preview?.id === resource.modelId ||
                preview?.versionIds?.includes(versionId) ||
                preview?.hashes?.includes(resource.hash) ||
                preview?.fileNames?.includes(
                  clearFileExtension(resource.name)?.toLowerCase()
                )
            );
            // console.log(preview);
            if (preview) {
              return {
                ...resource,
                preview,
              };
            }
            return resource;
          });
          // console.log(resources);

          //Remove not uniq items from the end of array//////
          const reversedArr = resources.toReversed();
          const ids = reversedArr
            .map((resource) => resource?.preview?.id)
            .filter(Boolean);
          // console.log(ids);

          const filteredNewResult = resources.filter((obj1, i, arr) => {
            if (!obj1?.preview?.id) {
              return true;
            } else {
              return (
                arr.findIndex(
                  (obj2) => obj2?.preview?.id === obj1?.preview?.id
                ) === i
              );
            }
          });
          ////////////////////////////////////////////////////

          if (!!modelInfoData?.length) {
            setModelInfo(modelInfoData[0]);
          }
          // setImageResources(resources || []);
          if (curImageData?.id === imageData?.id) {
            setImageResources(filteredNewResult || []);
          }
          // setImageResources(filteredNewResult || []);
          // console.log(curImageData);
          setIsLoading(false);
        } catch (err) {
          const defResources = !!curImageData?.meta?.civitaiResources?.length
            ? curImageData.meta?.civitaiResources
            : curImageData.meta?.resources;
          if (curImageData?.id === imageData?.id) {
            setImageResources(defResources);
          }
          // console.log(err);
          // console.log(err.code);
          // setErrorMessage(err.message);
          setIsLoading(false);
        }
      };
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        loadResoursesInfo(imageData);
      }, timeoutDelay);
    }
  }, [imageData, uid]);

  const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  const positiveWordsArr = imageData?.meta?.prompt
    ?.split(splitRegEx)
    ?.flatMap((tag) => tag.trim() || []);
  const negativeWordsArr = imageData?.meta?.negativePrompt
    ?.split(splitRegEx)
    ?.flatMap((tag) => tag.trim() || []);

  const resourcesHtml = imageResources?.map((resource, i) => {
    const versiondId = resource?.modelVersionId || resource?.versionId;

    let versionIsSaved;
    let versionName;
    let versionIdByName;
    let modelType;

    if (resource?.type?.includes("{")) {
      modelType = resource.type
        .replace(/[{}]/g, "")
        .split(",")
        .find((field) => field.includes("Type"))
        .split("=")[1];
    } else {
      modelType = resource.type;
    }

    if (
      versiondId &&
      resource?.preview?.modelVersionsCustomData?.hasOwnProperty(
        `${versiondId}`
      )
    ) {
      versionIsSaved =
        resource.preview.modelVersionsCustomData[versiondId].downloadStatus;
      versionName =
        resource.preview.modelVersionsCustomData[versiondId]?.versionName;
    } else {
      const curVersion =
        resource?.preview?.modelVersionsCustomData &&
        Object.values(resource?.preview?.modelVersionsCustomData).find(
          (version) =>
            clearFileExtension(version.defFileName) ===
            clearFileExtension(resource?.name)?.toLowerCase()
        );
      versionIsSaved = curVersion?.downloadStatus;
      versionName = curVersion?.versionName;
      versionIdByName = curVersion?.id;
    }
    const version = versiondId || versionIdByName;

    return (
      <li key={i} className={classes["resource"]}>
        {resource?.preview && (
          <>
            <Link
              to={`/model/${resource?.preview?.id}`}
              state={{ versionId: version }}
              className={`${classes["resource__link"]} ${classes["resource__name"]}`}
            >
              {resource.preview.name}
            </Link>
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
        {!resource?.preview && !versionName && (
          <div
            className={classes["resource__name"]}
            title={resource?.name || resource.modelVersionId}
          >
            {resource?.name ||
              resource?.modelVersionName ||
              resource?.modelVersionId ||
              resource?.hash}
          </div>
        )}
        <div className={classes["resource__version"]}>
          {!versionIsSaved && !!resource?.preview && (
            <ExclamationCircleSvg
              className={classes["resource__version-svg"]}
            />
          )}
          {versionIsSaved && (
            <CheckCircleSvg
              className={`${classes["resource__version-svg"]} ${classes["resource__version-svg--saved"]}`}
            />
          )}{" "}
          <span className={classes["resource__version-name"]}>
            {versionName || resource?.versionName}
          </span>
        </div>
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
            >
              civitai
            </LinkA>
          </div>
        )}
        <div className={classes["resource__info"]}>
          <div className={classes["resource__type"]}>
            {modelType || resource?.type}
          </div>
          {resource?.weight && <div>weight: {resource?.weight || ""}</div>}
        </div>
      </li>
    );
  });

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
                <div className={classes["example__config-block"]}>
                  {!!imageData?.postId && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Post ID:
                      </span>
                      {imageData?.postId}
                    </div>
                  )}
                  {!!imageData?.id && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Image ID:
                      </span>
                      {imageData?.id}
                    </div>
                  )}
                  {!!imageData?.meta?.cfgScale && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        CFG scale:
                      </span>
                      {imageData?.meta?.cfgScale}
                    </div>
                  )}
                  {!!imageData?.meta?.steps && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Steps:
                      </span>
                      {imageData?.meta?.steps}
                    </div>
                  )}
                  {!!imageData?.meta?.sampler && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Sampler:
                      </span>
                      {imageData?.meta?.sampler}
                    </div>
                  )}
                  {!!imageData?.meta?.seed && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Seed:
                      </span>
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
                        </span>
                      )}
                    </div>
                  )}
                  {(modelInfo?.id ||
                    modelInfo?.id ||
                    modelInfoCiv?.modelId ||
                    modelInfoCiv?.modelName ||
                    imageData?.meta?.Model) && (
                    <div
                      className={`${classes["example__info-item"]} ${classes["config__name"]}`}
                    >
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
                          >
                            civitai
                          </LinkA>
                          {")"}
                        </span>
                      )}
                    </div>
                  )}
                  {!!imageData?.meta?.Size && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Size:
                      </span>{" "}
                      {imageData?.meta?.Size}
                    </div>
                  )}
                  {!!imageData?.meta?.clipSkip && (
                    <div className={classes["example__info-item"]}>
                      <span className={classes["example__info-name"]}>
                        Clip Skip:
                      </span>
                      {imageData?.meta?.clipSkip}
                    </div>
                  )}
                  {!!imageData?.id && (
                    <div
                      className={`${classes["example__info-item"]} ${classes["resource__field"]}`}
                    >
                      <span className={classes["example__info-name"]}>
                        Image source:
                      </span>
                      <LinkA
                        external={true}
                        href={`https://civitai.com/images/${imageData?.id}`}
                      >
                        civitai
                      </LinkA>
                    </div>
                  )}
                </div>
                {isLoading && (
                  <div className={classes["spiner-container"]}>
                    <Spinner size="medium" />
                  </div>
                )}
                {!isLoading && !!resourcesHtml?.length && (
                  <div>
                    Resources:
                    <ul className={classes["example__resourses"]}>
                      {resourcesHtml}
                    </ul>
                  </div>
                )}
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
              </div>
            </>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCard;
