import classes from "./ImageResources.module.scss";
import ErrorMessage from "../../ui/ErrorMessage";
import ImageCardResourcesGuide from "../../ui/guide/model/ImageCardResourcesGuide";
import { GUIDE_STEP_IMAGE_RESOURCES } from "../../../variables/constants";
import { motion } from "framer-motion";
import ImageResourcesItem from "../image-resources-item/ImageResourcesItem";
import { useEffect, useRef, useState } from "react";
import {
  clearFileExtension,
  filterDuplicates,
} from "../../../utils/generalUtils";
import Spinner from "../../ui/Spinner";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoResources from "../../ui/guide/info/InfoResources";
import { useSelector } from "react-redux";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { parseModelIds } from "../../../utils/modelUtils";
import { getImageInfo } from "../../../utils/fetch/fetchImages";

const firestore = getFirestore(firebaseApp);
const timeoutDelay = 1000;

const ImageResources = ({ imageData, onReset }) => {
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const [imageResources, setImageResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [civConnectionError, setCivConnectionError] = useState(false);
  const uid = useSelector((state) => state.auth.user.uid);
  const timeoutRef = useRef(null);
  const resourcesRef = useRef(null);

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

    return (
      <ImageResourcesItem
        key={i}
        resource={resource}
        version={version}
        versionName={versionName}
        modelType={modelType}
        versionIsSaved={versionIsSaved}
        civConnectionError={civConnectionError}
        onReset={onReset}
        onUpdateResources={updateImageResources}
      />
    );
  });

  useEffect(() => {
    setImageResources([]);
  }, [imageData]);

  useEffect(() => {
    if (imageData?.url) {
      setErrorMessage("");

      let imageResources = [];

      if (imageData.meta?.resources) {
        imageResources = [...imageResources, ...imageData.meta?.resources];
      }
      if (imageData.meta?.additionalResources) {
        imageResources = [
          ...imageResources,
          ...imageData.meta?.additionalResources.map((res) => {
            const [modelId, modelVersionId] = parseModelIds(res.name);
            return {
              ...res,
              modelId,
              modelVersionId,
            };
          }),
        ];
      }
      if (imageData.meta?.civitaiResources) {
        imageResources = [
          ...imageResources,
          ...imageData.meta?.civitaiResources,
        ];
      }

      const uniqImageResources = filterDuplicates(
        imageResources,
        "modelVersionId"
      );

      const loadResourcesInfoFromCiv = async (curImageData) => {
        try {
          setIsLoading(true);
          setCivConnectionError(false);
          const resourcesInfoCiv = await getImageInfo(
            uniqImageResources,
            curImageData
          );

          await loadResourcesInfoFromDB(resourcesInfoCiv, curImageData);
        } catch (err) {
          console.log(err);
          setCivConnectionError(true);
          await loadResourcesInfoFromDB(uniqImageResources, curImageData);
        }
      };

      const loadResourcesInfoFromDB = async (
        resourcesInfoCiv,
        curImageData
      ) => {
        try {
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
          } else if (curImageData?.meta?.Model?.includes("urn:air")) {
            const [modelId] = parseModelIds(curImageData.meta.Model);
            modelQ = query(
              collection(firestore, "users", uid, `preview`),
              where("id", "==", modelId)
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

          let modelsIds = [];
          let modelsVersionIds = [];
          let modelsHashes = [];
          let modelsNames = [];
          let allModelsPreviews = [];

          resourcesInfoCiv?.forEach((resource) => {
            if (resource?.modelId) {
              modelsIds.push(resource?.modelId);
            } else if (resource?.versionId || resource?.modelVersionId) {
              modelsVersionIds.push(
                resource?.versionId || resource?.modelVersionId
              );
            } else if (resource?.hash) {
              modelsHashes.push(resource?.hash);
            } else if (resource?.name) {
              modelsNames.push(
                clearFileExtension(resource?.name).toLowerCase()
              );
            }
          });

          if (!!modelsIds.length) {
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

            allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewById];
          }

          if (!!modelsVersionIds.length) {
            const q = query(
              collection(firestore, "users", uid, `preview`),
              where("versionIds", "array-contains-any", modelsVersionIds)
            );
            const querySnapshot = await getDocs(q);

            const modelsPrewiewByVersionId = querySnapshot.docs.map((doc) => {
              // doc.data() is never undefined for query doc snapshots
              return doc.data();
            });
            allModelsPreviews = [
              ...allModelsPreviews,
              ...modelsPrewiewByVersionId,
            ];
          }

          if (!!modelsHashes.length) {
            const q = query(
              collection(firestore, "users", uid, `preview`),
              where("hashes", "array-contains-any", modelsHashes)
            );
            const querySnapshot = await getDocs(q);

            const modelsPrewiewByHash = querySnapshot.docs.map((doc) => {
              // doc.data() is never undefined for query doc snapshots
              return doc.data();
            });
            allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewByHash];
          }

          if (!!modelsNames.length) {
            const uniqModelsNames = modelsNames.filter(
              (name) =>
                !allModelsPreviews.find((model) => {
                  const nameArr = name.split("-");
                  if (Number.isFinite(+nameArr[nameArr?.length - 1])) {
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
              allModelsPreviews = [
                ...allModelsPreviews,
                ...modelsPrewiewByName,
              ];
            }
          }

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

            if (preview) {
              return {
                ...resource,
                preview,
              };
            }
            return resource;
          });

          //Remove not uniq items from the end of array//////
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
              } else if (!!obj1?.name) {
                //filters duplicate models that only have names that match the file name
                const arrIndex = arr.findIndex(
                  (obj2) => obj1?.name === obj2?.fileName
                );
                return arrIndex === i || arrIndex < 0;
              } else {
                return true;
              }
            })
            ?.filter((resource) => {
              if (resource?.name && resource.name?.includes("urn:air:")) {
                return false;
              } else {
                return true;
              }
            })
            .sort((a, b) => {
              if (!a?.versionId && b?.versionId) {
                return 1;
              }
              if (a?.versionId && !b?.versionId) {
                return -1;
              }
              return 0;
            });
          ////////////////////////////////////////////////////

          // if (!!modelInfoData?.length) {
          //   setModelInfo(modelInfoData[0]);
          // }

          if (curImageData?.id === imageData?.id) {
            setImageResources(filteredNewResult || []);
          }
          const checkpointInfo = filteredNewResult.find(
            (resource) => resource.type === "Checkpoint"
          );

          // if (checkpointInfo) {
          //   setModelInfoCiv(checkpointInfo);
          // }
        } catch (err) {
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      };

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        loadResourcesInfoFromCiv(imageData);
      }, timeoutDelay);
    }
  }, [imageData, uid]);

  return (
    <>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
      {!isLoading && !!resourcesHtml?.length && (
        <div ref={resourcesRef}>
          <div className={classes["title-container"]}>
            <h4 className={classes["h4"]}>Resources:</h4>
            <ButtonInfo className={classes["info-btn"]}>
              <InfoResources />
            </ButtonInfo>
          </div>
          <motion.ul
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className={`${classes["example__resources"]} ${
              guideIsActive && guideStep === GUIDE_STEP_IMAGE_RESOURCES
                ? classes["example__resources--guide"]
                : ""
            }`}
          >
            {resourcesHtml}
            <ImageCardResourcesGuide />
          </motion.ul>
        </div>
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </>
  );
};

export default ImageResources;
