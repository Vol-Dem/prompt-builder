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
import { useDispatch, useSelector } from "react-redux";
import ButtonAdd from "../ui/ButtonSquareAdd";
import { Link } from "react-router-dom";
import LinkA from "../ui/LinkA";
import { clearFileExtension, splitTags } from "../../utils/generalUtils";
import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";
import CheckCircleSvg from "../../assets/CheckCircleSvg";
import ErrorMessage from "../ui/ErrorMessage";
import { modelActions } from "../../store/model";
import CopySvg from "../../assets/CopySvg";
import CopiedSvg from "../../assets/CopiedSvg";
import ImageCardGuide from "../ui/guide/model/ImageCardGuide";
import {
  GUIDE_STEP_ADD_TO_PROMPT,
  GUIDE_STEP_IMAGE_RESOURCES,
} from "../../variables/constants";
import { guideActions } from "../../store/guide";
import ImageCardResourcesGuide from "../ui/guide/model/ImageCardResourcesGuide";
import { AnimatePresence, motion } from "framer-motion";
import ButtonSquareSave from "../ui/ButtonSquareSave";
import Modal from "../ui/Modal";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import NotificationMessage from "../ui/NotificationMessage";

const firestore = getFirestore(firebaseApp);
const civitDefEmb = [250708, 250712, 106916];
const timeoutDelay = 1000;
const modelToSaveDefState = {
  modelId: null,
  modelVersionId: null,
};

const ImageCard = ({ activeImgNum }) => {
  const [fromIsOpen, setFormIsOpen] = useState(false);
  const [modelToSave, setModelToSave] = useState(modelToSaveDefState);
  const [imageData, setImageData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageResources, setImageResources] = useState([]);
  const [modelInfoCiv, setModelInfoCiv] = useState({});
  const [modelInfo, setModelInfo] = useState({});
  const uid = useSelector((state) => state.auth.user.uid);
  const modelId = useSelector((state) => state.model.model.id);
  const guideModelActive = useSelector((state) => state.guide.model.active);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();
  const resorcesRef = useRef(null);

  const openFormHandler = (newModelId, newModelVersionId, modelType) => {
    console.log(modelType);
    setModelToSave({
      modelId: newModelId,
      modelVersionId: newModelVersionId,
      modelType,
    });
    setFormIsOpen(true);
  };

  const closeFormHandler = () => {
    setModelToSave(modelToSaveDefState);
    setFormIsOpen(false);
  };

  const updateImageResources = (previewData) => {
    setImageResources((prevState) => {
      const updatedResourceIndex = prevState.findIndex(
        (resource) => resource.modelId === previewData.id
      );

      if (updatedResourceIndex < 0) return prevState;

      const updatedResource = [...prevState];
      prevState[updatedResourceIndex].preview = previewData;

      return updatedResource;
    });
  };

  useEffect(() => {
    if (
      imageData?.url &&
      guideIsActive &&
      guideStep &&
      guideStep < GUIDE_STEP_ADD_TO_PROMPT
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "model",
          value: GUIDE_STEP_ADD_TO_PROMPT,
        })
      );
    }

    // if (
    //   imageData?.url &&
    //   guideStep &&
    //   resorcesRef?.current &&
    //   guideStep === GUIDE_STEP_IMAGE_RESOURCES
    // ) {
    //   resorcesRef.current.scrollIntoView({
    //     behavior: "smooth",
    //     block: "nearest",
    //   });
    // }
  }, [guideStep, imageData?.url, dispatch, guideIsActive]);

  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );

  const resetModelData = (e) => {
    // console.log(modelId);
    // console.log(e.target.dataset.id);
    if (+e.target.dataset.id !== modelId) {
      dispatch(modelActions.resetModelData());
    }
  };

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

          // console.log(modelsIds);
          // console.log(modelsVersionIds);
          // console.log(modelsHashes);
          // console.log(modelsNames);
          // console.log(allModelsPreviews);

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
          // const reversedArr = resources.toReversed();
          // const ids = reversedArr
          // .map((resource) => resource?.preview?.id)
          // .filter(Boolean);
          // console.log(ids);

          const filteredNewResult = resources
            .filter((obj1, i, arr) => {
              if (!!obj1?.preview?.id) {
                return (
                  arr.findIndex(
                    (obj2) => obj2?.preview?.id === obj1?.preview?.id
                  ) === i
                );
              } else if (!!obj1?.modelId) {
                return (
                  arr.findIndex((obj2) => obj2?.modelId === obj1?.modelId) === i
                );
              } else {
                return true;
              }
            })
            ?.filter((resourse) => {
              if (resourse?.name && resourse.name?.includes("urn:air:")) {
                return false;
              } else {
                return true;
              }
            });
          // console.log(filteredNewResult);
          ////////////////////////////////////////////////////

          if (!!modelInfoData?.length) {
            setModelInfo(modelInfoData[0]);
          }
          // setImageResources(resources || []);
          if (curImageData?.id === imageData?.id) {
            // console.log(filteredNewResult);
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

  const positiveWordsArr = splitTags(imageData?.meta?.prompt);
  const negativeWordsArr = splitTags(imageData?.meta?.negativePrompt);

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
      <motion.li
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        key={i}
        className={classes["resource"]}
      >
        {resource?.preview && (
          <>
            <Link
              to={`/models/${resource?.preview?.id}`}
              state={{ versionId: version }}
              className={`${classes["resource__link"]} ${classes["resource__name"]}`}
              onClick={resetModelData}
              data-id={resource?.preview?.id}
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
            {resource?.modelId &&
              (resource?.modelVersionId || resource?.versionId) && (
                <ButtonSquareSave
                  // modelId={resource?.modelId}
                  // versionId={resource?.modelVersionId}
                  className={classes["resource__add"]}
                  onClick={openFormHandler.bind(
                    null,
                    resource?.modelId,
                    resource?.modelVersionId || resource?.versionId,
                    resource?.type
                  )}
                />
              )}
          </div>
        )}
        <div
          className={classes["resource__version"]}
          title={`${
            versionIsSaved ? "Version downloaded" : "Version not downloaded"
          }`}
        >
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
      </motion.li>
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
              <div
                className={`${classes["example__prompt"]} ${
                  guideModelActive &&
                  guideIsActive &&
                  guideStep === GUIDE_STEP_ADD_TO_PROMPT
                    ? classes["example__prompt--guide"]
                    : ""
                }`}
              >
                <ImageCardGuide />
                {!!positiveWordsArr?.length && (
                  <TagList
                    name="Positive prompt"
                    tags={positiveWordsArr}
                    promptType="positive"
                    className={classes["tags__list"]}
                  />
                )}
                {!positiveWordsArr?.length && (
                  <NotificationMessage type="notification">
                    Positive prompt is not avalible for this image
                  </NotificationMessage>
                )}
                {!!negativeWordsArr?.length && (
                  <TagList
                    name="Negative prompt"
                    tags={negativeWordsArr}
                    promptType="negative"
                    className={classes["tags__list"]}
                  />
                )}
                {!negativeWordsArr?.length && (
                  <NotificationMessage type="notification">
                    Negative prompt is not avalible for this image
                  </NotificationMessage>
                )}
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
                        <span
                          className={`${classes.seed} ${
                            copied ? classes["seed--copied"] : ""
                          }`}
                          onClick={copyHandler}
                        >
                          {imageData?.meta?.seed}
                          {!copied && <CopySvg />}
                          {copied && <CopiedSvg />}
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
                            to={`/models/${modelInfo?.id}`}
                            className={classes["resource__link"]}
                            onClick={resetModelData}
                            data-id={modelInfo?.id}
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
                  <div ref={resorcesRef}>
                    Resources:
                    <motion.ul
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                      }}
                      className={`${classes["example__resourses"]} ${
                        guideIsActive &&
                        guideStep === GUIDE_STEP_IMAGE_RESOURCES
                          ? classes["example__resourses--guide"]
                          : ""
                      }`}
                    >
                      {resourcesHtml}
                      <ImageCardResourcesGuide />
                    </motion.ul>
                  </div>
                )}
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
              </div>
            </>
          </div>
        </div>
      )}
      <AnimatePresence>
        {fromIsOpen && (
          <Modal title="Add new resource" onClose={closeFormHandler}>
            <UpdateModelForm
              id="resources-form"
              newModelId={modelToSave?.modelId}
              newModelVersionId={modelToSave?.modelVersionId}
              onSave={updateImageResources}
              newModelType={modelToSave?.modelType || null}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageCard;
