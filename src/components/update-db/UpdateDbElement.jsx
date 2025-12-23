import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { get, ref } from "firebase/database";

import firebaseApp, { db } from "../../firebase-config";
import { clearObjectKeys } from "../../utils/generalUtils";
import { makeBatchRequest } from "../../utils/fetchUtils";

const firestore = getFirestore(firebaseApp);

const UpdateDbElement = ({ allFirebaseModels }) => {
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [modelsAmount, setModelsAmount] = useState(0);
  const [updatedModelsAmount, setUpdatedModelsAmount] = useState(0);
  //   const [updatedModelsId, setUpdatedModelsId] = useState([]);
  const [modelsToUpdate, setModelsToUpdate] = useState([]);
  const uid = useSelector((state) => state.auth.user.uid);
  const modelId = useSelector((state) => state.model.model.id);
  //   const categories = useSelector((state) => state.tabs.categoriesData);

  const updateDbFireBase = async (curData) => {
    try {
      /////////////////////////////////////////////////////////////////////
      //MODELS PORT
      /////////////////////////////////////////////

      await Promise.all(
        curData.map(async (model) => {
          const modelsFrRef = doc(
            firestore,
            "users",
            uid,
            "models",
            model.id + ""
          );
          const modelsPrevFrRef = doc(
            firestore,
            "users",
            uid,
            "preview",
            model.id + ""
          );
          const userRef = doc(firestore, "users", uid);
          console.log(model.id);
          //   const rejectTimeout = setTimeout(() => {
          //     return Promise.reject("Timeout");
          //   }, 10000);

          const existedModelSnap = await getDoc(modelsFrRef);

          if (existedModelSnap.exists()) {
            //   console.log("Document data:", existedModelSnap.data());

            const existedModelData = existedModelSnap.data();

            let modelTypeName;
            switch (model?.data?.type) {
              case "LORA":
                modelTypeName = "lora";
                break;
              case "Checkpoint":
                modelTypeName = "checkpoint";
                break;
              case "TextualInversion":
                modelTypeName = "embedding";
                break;
              default:
                modelTypeName = "lora";
            }

            let weight = null;
            let minWeight = null;
            let maxWeight = null;

            if (existedModelData?.weight) {
              const weightArr = existedModelData.weight.split("-");
              if (weightArr?.length > 1) {
                minWeight = +weightArr[0].trim();
                maxWeight = +weightArr[1].trim();
              } else {
                weight = +existedModelData.weight || null;
              }
            }

            const existedData = { ...existedModelData.data };

            model.data.modelVersions.forEach((version) => {
              const curVer = existedData.modelVersions.find(
                (existedVersion) => existedVersion.id === version.id
              );
              if (curVer)
                curVer.files =
                  version?.files?.map((file) => {
                    return {
                      hashes: file?.hashes || "",
                      name: file?.name || "",
                      primary: file?.primary || "",
                      type: file?.type || "",
                      id: file?.id || "",
                    };
                  }) || [];
            });

            const newModelData = {
              id: model.id,
              modelType: modelTypeName || "",
              type: model?.data?.type || "",
              data: existedData,
              main: existedModelData.main,
              mainTag: existedModelData?.mainTag || "",
              name: model?.data?.name || "",
              fileName: existedModelData?.fileName || "",
              src: "civitai.com",
              savedImages: existedModelData?.savedImages || {},
              sub: existedModelData.sub,
              defaultCustomData: {
                description: existedModelData?.data.description || "",
                helperTags: existedModelData?.helperTags || [],
                negativeTags: existedModelData?.negativeTags || [],
                tagSetsData: existedModelData?.tagSetsData || [],
                weight,
                minWeight,
                maxWeight,
                size: model?.size || "",
                vae: model?.vae || "",
                sampler: model?.sampler || "",
                cfgScale: model?.cfgScale || "",
                steps: model?.steps || "",
                hiresUpscaler: model?.hiresUpscaler || "",
                hiresUpscaleBy: model?.hiresUpscale || "",
                hiresUpscaleSteps: model?.hiresUpscaleSteps || "",
                denoisingStrength: model?.denoisingStrength || "",
              },
              modelVersionsCustomData:
                existedModelData.modelVersionsCustomData || {},
              nsfw: model?.data?.nsfw || false,
              nsfwLevel: model?.data?.nsfwLevel || null,
              poi: model?.data?.poi || false,
              createdAt: model?.createdAt || "",
              updatedAt: model?.updatedAt || "",
            };

            console.log(newModelData);

            const fileNames =
              existedData?.modelVersions?.flatMap((version) => {
                // version.files.map((file) => file.name)
                if (version.hasOwnProperty("files") && version?.files) {
                  console.log("WTF", version?.files);
                  return (
                    version.files.find((file) => file?.primary)?.name || []
                  );
                }
                return [];
              }) || [];

            const activePreviewId =
              existedModelData?.modelVersionsCustomData &&
              existedData.modelVersions?.find(
                (version) =>
                  existedModelData?.modelVersionsCustomData[version.id]
                    ?.downloadStatus === true
              )?.id;
            //   console.log(activePreviewId);
            const activePreviewImg =
              (activePreviewId &&
                existedModelData.data.modelVersions
                  ?.find((version) => version.id === activePreviewId)
                  .images?.filter((img, i) => img.type === "image")[0]?.url) ||
              "";
            //   console.log(existedModelData);
            const previewImgDefault =
              existedModelData.data.modelVersions[0].images?.filter(
                (img, i) => img.type === "image"
              )[0]?.url || "";

            const previewImg = activePreviewImg || previewImgDefault;

            const baseModels = new Set(
              existedModelData.data.modelVersions?.flatMap(
                (version) => version?.baseModel || []
              )
            );

            const loraPrevData = {
              id: model.id,
              modelType: modelTypeName || "",
              src: "civitai.com",
              main: existedModelData.main,
              sub: existedModelData.sub,
              name: model?.data?.name || "",
              imgUrl: previewImg || "",
              type: model?.data?.type || "",
              nsfw: model?.data?.nsfw || false,
              nsfwLevel: model?.data?.nsfwLevel || null,
              baseModel: model?.data?.modelVersions[0].baseModel || "",
              baseModels: [...baseModels],
              mainTag: existedModelData?.mainTag || "",
              fileName: existedModelData?.fileName || "",
              fileNames,
              weight,
              minWeight,
              maxWeight,
              size: existedModelData?.size || "",
              tags:
                existedModelData?.data?.modelVersions[0]?.trainedWords || [],
              authorTags: existedModelData?.data?.tags || [],
              helperTags: existedModelData?.helperTags || [],
              modelVersionsCustomData:
                existedModelData.modelVersionsCustomData || {},
              updatedAt: new Date().toISOString(),
              createdAt: model?.downloadedAt || model?.createdAt || Date.now(),
            };
            console.log(loraPrevData);
            await setDoc(modelsPrevFrRef, loraPrevData);
            setUpdatedModelsAmount((prevSatet) => prevSatet + 1);
            // setUpdatedModelsId((prevState) => {
            //   return [...prevState, model.id];
            // });
            // await setDoc(
            //   userRef,
            //   {
            //     updatedModels: arrayUnion(model.id),
            //   },
            //   { merge: true }
            // );
            // clearTimeout(rejectTimeout);
            return setDoc(modelsFrRef, newModelData);
          } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");

            //   return Promise.reject("Skip");
            const modelVersions = model.data.modelVersions.map((version) => {
              const images =
                version?.images?.map((img) => {
                  const nImg = { ...img };
                  nImg.meta = nImg?.meta ? clearObjectKeys(nImg.meta) : {};
                  nImg.meta.comfy = null;
                  return nImg;
                }) || [];

              const files = version?.files?.map((file) => {
                return {
                  hashes: file.hashes,
                  name: file.name,
                  primary: file.primary,
                  type: file.type,
                  id: file.id,
                };
              });
              return {
                baseModel: version.baseModel || "",
                baseModelType: version.baseModelType || "",
                createdAt: version.createdAt || "",
                description: version.description || "",
                id: version.id,
                modelId: version.modelId,
                name: version.name,
                trainedWords: version.trainedWords || null,
                updatedAt: version.updatedAt || "",
                vaeId: version.vaeId || null,
                files,
                images,
              };
            });
            const cleanedModelData = {
              id: model.data.id,
              name: model.data.name,
              description: model.data?.description || "",
              nsfw: model.data?.nsfw || false,
              nsfwLevel: model?.data?.nsfwLevel || null,
              poi: model?.data?.poi || false,
              tags: model?.data?.tags || [],
              type: model.data?.type || "",
              modelVersions,
            };

            const modelVersionsCustomDataConverted = {};
            model?.modelVersionsCustomData?.forEach((mvcd) => {
              modelVersionsCustomDataConverted[mvcd.versionId] = mvcd;
            });
            let cleanedSavedImages = {};
            if (model?.savedImages)
              Object.keys(model?.savedImages).forEach((key) => {
                cleanedSavedImages[key] =
                  model?.savedImages[key].filter(Boolean);
              });

            // const cleanedData = {
            //   //   weight: model?.weight || "",
            //   //   imgUrl: model?.imgUrl || "",
            //   //   baseModel: model?.baseModel || "",
            //   //   tags: model?.tags || [],
            // };

            let modelTypeName;
            switch (model?.data?.type) {
              case "LORA":
                modelTypeName = "lora";
                break;
              case "Checkpoint":
                modelTypeName = "checkpoint";
                break;
              case "TextualInversion":
                modelTypeName = "embedding";
                break;
              default:
                modelTypeName = "lora";
            }

            let weight = null;
            let minWeight = null;
            let maxWeight = null;

            if (model?.data?.weight) {
              const weightArr = model.data.weight.split("-");
              if (weightArr?.length > 1) {
                minWeight = +weightArr[0].trim();
                maxWeight = +weightArr[1].trim();
              } else {
                weight = +model.data.weight || null;
              }
            }

            const newModelData = {
              id: model.id,
              modelType: modelTypeName || "",
              type: model?.type || "",
              data: cleanedModelData,
              main: model.main,
              mainTag: model?.mainTag || "",
              name: model?.title || "",
              fileName: model?.fileName || "",
              src: "civitai.com",
              savedImages: cleanedSavedImages || {},
              sub: model.sub,
              defaultCustomData: {
                description: model?.data.description || "",
                helperTags: model?.helperTags || [],
                negativeTags: model?.negativeTags || [],
                tagSetsData: model?.tagSetsData || [],
                weight,
                minWeight,
                maxWeight,
                size: model?.size || "",
                vae: model?.vae || "",
                sampler: model?.sampler || "",
                cfgScale: model?.cfgScale || "",
                steps: model?.steps || "",
                hiresUpscaler: model?.hiresUpscaler || "",
                hiresUpscaleBy: model?.hiresUpscale || "",
                hiresUpscaleSteps: model?.hiresUpscaleSteps || "",
                denoisingStrength: model?.denoisingStrength || "",
              },
              modelVersionsCustomData: modelVersionsCustomDataConverted || {},
              nsfw: model?.nsfw || false,
              nsfwLevel: model?.nsfwLevel || null,
              poi: model?.poi || false,
              createdAt: model?.downloadedAt || model?.createdAt || Date.now(),
              updatedAt: model?.updatedAt || new Date().toISOString(),
            };
            // console.log(newModelData);
            //   const fileNames =
            //     existedData?.modelVersions?.flatMap((version) => {
            //       // version.files.map((file) => file.name)
            //       if (version.hasOwnProperty("files")) {
            //         return version?.files[0].name;
            //       }
            //       return [];
            //     }) || [];

            const fileNames =
              model?.data?.modelVersions?.flatMap((version) => {
                // version.files.map((file) => file.name)
                if (version.hasOwnProperty("files")) {
                  return version?.files[0].name;
                }
                return [];
              }) || [];

            const activePreviewId =
              model?.modelVersionsCustomData &&
              model.data.modelVersions?.find(
                (version) =>
                  model?.modelVersionsCustomData[version.id]?.downloadStatus ===
                  true
              )?.id;
            //   console.log(activePreviewId);
            const activePreviewImg =
              (activePreviewId &&
                model.data.modelVersions
                  ?.find((version) => version.id === activePreviewId)
                  .images?.filter((img, i) => img.type === "image")[0]?.url) ||
              "";
            //   console.log(existedModelData);
            const previewImgDefault =
              model.data.modelVersions[0].images?.filter(
                (img, i) => img.type === "image"
              )[0]?.url || "";

            const previewImg = activePreviewImg || previewImgDefault;

            const baseModels = new Set(
              model.data.modelVersions?.flatMap(
                (version) => version?.baseModel || []
              )
            );

            const loraPrevData = {
              id: model.id,
              modelType: modelTypeName || "",
              src: "civitai.com",
              main: model.main,
              sub: model.sub,
              name: model?.data?.name || "",
              imgUrl: previewImg || "",
              type: model?.data?.type || "",
              nsfw: model?.data?.nsfw || false,
              nsfwLevel: model?.data?.nsfwLevel || null,
              baseModel: model?.data?.modelVersions[0].baseModel || "",
              baseModels: [...baseModels],
              mainTag: model?.mainTag || "",
              fileName: model?.fileName || "",
              fileNames,
              weight,
              minWeight,
              maxWeight,
              size: model?.size || "",
              tags: model?.data?.modelVersions[0]?.trainedWords || [],
              authorTags: model?.data?.tags || [],
              helperTags: model?.helperTags || [],
              modelVersionsCustomData: model.modelVersionsCustomData || {},
              updatedAt: new Date().toISOString(),
              createdAt: model?.downloadedAt || model?.createdAt || Date.now(),
            };
            // console.log(newModelData);
            await setDoc(modelsPrevFrRef, loraPrevData);
            setUpdatedModelsAmount((prevSatet) => prevSatet + 1);
            // setUpdatedModelsId((prevState) => {
            //   return [...prevState, model.id];
            // });
            await setDoc(
              userRef,
              {
                updatedModels: arrayUnion(model.id),
              },
              { merge: true }
            );
            // clearTimeout(rejectTimeout);
            return setDoc(modelsFrRef, newModelData);
          }
        })
      );

      //////////////////////////////////////////////////////
      // PREV PORT
      //////////////////////////////////

      // const modelsRDRef = ref(db, "models preview");
      // const snapshot = await get(modelsRDRef);

      // if (snapshot.exists()) {
      //   const curData = await snapshot.val();
      //   const allprev = Object.values(curData).flat();
      //   let categories = {};
      //   allprev.forEach((prev) => {
      //     if (categories.hasOwnProperty(prev.main)) {
      //       categories[prev.main] = [
      //         ...new Set([...categories[prev.main], ...prev.sub]),
      //       ];
      //     } else {
      //       categories[prev.main] = prev.sub;
      //     }
      //   });
      //   console.log(categories);
      //   const categoryField = `categories.models`;
      //   await updateDoc(
      //     userRef,
      //     {
      //       [categoryField]: categories,
      //     },
      //     { merge: true }
      //   );

      //   await Promise.all(
      //     allprev.map((model) => {
      //       const modelsFrRef = doc(
      //         firestore,
      //         "users",
      //         uid,
      //         "models preview",
      //         model.id + ""
      //       );

      //       return setDoc(modelsFrRef, model);
      //     })
      //   );
      // }

      /////////////////////////////////////
    } catch (err) {
      console.log(err);
      setModelIsSaving(false);
    }
  };

  const runUpdateDbFireBase = async () => {
    try {
      setModelIsSaving(true);
      setModelsAmount(0);
      setModelsToUpdate([]);
      let updatedModelsId;
      const userRef = doc(firestore, "users", uid);
      const existedModelSnap = await getDoc(userRef);

      if (existedModelSnap.exists()) {
        //   console.log("Document data:", existedModelSnap.data());

        updatedModelsId = existedModelSnap.data()?.updatedModels || [];
      }

      const modelTuUpdateData =
        updatedModelsId &&
        allFirebaseModels.filter(
          (model) => !updatedModelsId.some((id) => id === model.id)
        );

      setModelsAmount(modelTuUpdateData?.length);
      setModelsToUpdate(modelTuUpdateData);

      await makeBatchRequest(modelTuUpdateData, updateDbFireBase, 1, false);

      setModelIsSaving(false);
    } catch (err) {
      console.log(err);
      setModelIsSaving(false);
    }
  };

  const retryFbUpdateHandler = async () => {
    setModelIsSaving(true);
    setUpdatedModelsAmount(0);
    let updatedModelsId;
    const userRef = doc(firestore, "users", uid);
    const existedModelSnap = await getDoc(userRef);

    if (existedModelSnap.exists()) {
      //   console.log("Document data:", existedModelSnap.data());

      updatedModelsId = existedModelSnap.data().updatedModels;
    }
    const notUpdated = modelsToUpdate.filter(
      (model) => !updatedModelsId.some((modelId) => modelId === model.id)
    );
    console.log(notUpdated.length);
    setModelsAmount(notUpdated.length);
    await makeBatchRequest(notUpdated, updateDbFireBase, 1, false);
  };

  //TEMP
  const updateDb = async (prevData) => {
    console.log(prevData);
    const modelsRef = doc(firestore, "users", uid, "models", prevData.id + "");
    const modelsPrevRef = doc(
      firestore,
      "users",
      uid,
      "preview",
      prevData.id + ""
    );
    // const oldModelsPrevRef = doc(
    //   firestore,
    //   "users",
    //   uid,
    //   "models preview",
    //   prevData.id + ""
    // );

    try {
      await runTransaction(firestore, async (transaction) => {
        const sfDoc = await transaction.get(modelsRef);
        if (!sfDoc.exists()) {
          throw new Error("Document does not exist!");
        }
        const curDataDoc = sfDoc.data();

        let weight = null;
        let minWeight = null;
        let maxWeight = null;

        if (curDataDoc?.data?.weight) {
          const weightArr = curDataDoc.data.weight.split("-");
          if (weightArr?.length > 1) {
            minWeight = +weightArr[0].trim();
            maxWeight = +weightArr[1].trim();
          } else {
            weight = +curDataDoc.data.weight || null;
          }
        }

        let modelTypeName;
        switch (curDataDoc?.data?.type) {
          case "LORA":
            modelTypeName = "lora";
            break;
          case "Checkpoint":
            modelTypeName = "checkpoint";
            break;
          case "TextualInversion":
            modelTypeName = "embedding";
            break;
          default:
            modelTypeName = "lora";
        }

        const data = {
          id: curDataDoc?.data.id,
          description: curDataDoc?.data?.description || "",
          modelVersions: curDataDoc?.data?.modelVersions || [],
          name: curDataDoc?.data?.name || "",
          nsfw: curDataDoc?.data?.nsfw || false,
          nsfwLevel: curDataDoc?.data?.nsfwLevel || null,
          poi: curDataDoc?.data?.poi || false,
          tags: curDataDoc?.data?.tags || [],
          type: curDataDoc?.data?.type || "",
        };

        const fileNames =
          curDataDoc?.data?.modelVersions?.flatMap((version) => {
            // version.files.map((file) => file.name)
            if (version.hasOwnProperty("files")) {
              return version?.files[0].name;
            }
            return [];
          }) || [];

        const newModelData = {
          id: curDataDoc?.id,
          modelType: modelTypeName || "",
          data: data,
          main: curDataDoc?.main || "",
          mainTag: curDataDoc?.mainTag || "",
          name: curDataDoc?.data.name || "",
          fileName: curDataDoc?.fileName || "",
          src: "civitai.com",
          savedImages: curDataDoc?.savedImages || {},
          sub: curDataDoc?.sub || [],
          defaultCustomData: {
            description: curDataDoc?.data.description || "",
            helperTags: curDataDoc?.helperTags || [],
            negativeTags: curDataDoc?.negativeTags || [],
            tagSetsData: curDataDoc?.tagSetsData || [],
            weight,
            minWeight,
            maxWeight,
            size: curDataDoc?.size || "",
            vae: curDataDoc?.vae || "",
            sampler: curDataDoc?.sampler || "",
            cfgScale: curDataDoc?.cfgScale || "",
            steps: curDataDoc?.steps || "",
            hiresUpscaler: curDataDoc?.hiresUpscaler || "",
            hiresUpscaleBy: curDataDoc?.hiresUpscaleBy || "",
            hiresUpscaleSteps: curDataDoc?.hiresUpscaleSteps || "",
            denoisingStrength: curDataDoc?.denoisingStrength || "",
          },
          modelVersionsCustomData: curDataDoc?.modelVersionsCustomData || {},
          nsfw: curDataDoc?.nsfw || false,
          nsfwLevel: curDataDoc?.nsfwLevel || null,
          poi: curDataDoc?.poi || false,
          createdAt: curDataDoc?.createdAt || "",
          updatedAt: curDataDoc?.updatedAt || "",
        };

        //TEMP TO EDIT
        // const modelPrevData = {
        //   id: curDataDoc?.id,
        //   modelType: modelTypeName || "",
        //   src: "civitai.com",
        //   main: curDataDoc?.main || "",
        //   sub: curDataDoc?.sub || [],
        //   name: curDataDoc?.data.name || "",
        //   imgUrl: previewImg || "",
        //   type: data.type,
        //   nsfw: data?.nsfw || "",
        //   nsfwLevel: data?.nsfwLevel || "",
        //   baseModel: data.modelVersions[0].baseModel,
        //   baseModels: [...baseModels],
        //   mainTag,
        //   fileName,
        //   fileNames,
        //   weight,
        //   minWeight,
        //   maxWeight,
        //   size,
        //   tags: data.modelVersions[0].trainedWords || "",
        //   authorTags: data.tags || [],
        //   tagSetsData,
        //   helperTags,
        //   modelVersionsCustomData,
        //   updatedAt: new Date().toISOString(),
        //   createdAt: modelData?.downloadedAt || Date.now(),
        // };
        // const sfPrevDoc = await transaction.get(oldModelsPrevRef);
        // if (!sfPrevDoc.exists()) {
        //   throw "Document does not exist!";
        // }
        // const curPrevDataDoc = sfPrevDoc.data();

        const newModelPrevData = {
          ...prevData,
          modelType: modelTypeName || "",
          fileNames,
          weight,
          minWeight,
          maxWeight,
        };
        console.log(newModelData);
        console.log(newModelPrevData);

        transaction.update(modelsRef, newModelData);
        transaction.set(modelsPrevRef, newModelPrevData);
      });
      return "done";
      // console.log("Transaction successfully committed!");
      // setModelIsSaving(false);
    } catch (err) {
      console.log("Transaction failed: ", err);
      // setModelIsSaving(false);
    }
  };

  const startUpdateHandler = async () => {
    setModelIsSaving(true);
    const querySnapshot = await getDocs(
      collection(firestore, "users", uid, "checkpoints preview")
    );
    // const oldPrevs = [];
    querySnapshot.forEach(async (doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      // oldPrevs.push(doc.data());
      await updateDb(doc.data());
    });
    // console.log(oldPrevs);
    // await makeBatchRequest(oldPrevs, updateDb);
    setModelIsSaving(false);
  };
  const updateCategories = async () => {
    const userRef = doc(firestore, "users", uid);
    const catSnap = await getDoc(userRef);
    if (catSnap.exists()) {
      //   console.log("Document data:", catSnap.data());

      const categoriesData = catSnap.data();
      console.log(categoriesData.categories);

      //   const newCatVerTemplate = {
      //     chekpoint: [
      //       {
      //         id: "merge",
      //         name: "merge",
      //         subcategories: [
      //           { id: "anime", name: "anime" },
      //           { id: "semireal", name: "semireal" },
      //         ],
      //       },
      //       {
      //         id: "trained",
      //         name: "trained",
      //         subcategories: [
      //           { id: "anime", name: "anime" },
      //           { id: "semireal", name: "semireal" },
      //         ],
      //       },
      //     ],
      //   };

      const newCatVer = {};

      Object.keys(categoriesData.categories).forEach((type) => {
        newCatVer[type] = Object.keys(categoriesData.categories[type]).map(
          (category) => {
            return {
              id: category,
              name: category,
              subcategories: categoriesData.categories[type][category].map(
                (subcat) => {
                  return {
                    id: subcat,
                    name: subcat,
                  };
                }
              ),
            };
          }
        );
      });
      console.log(newCatVer);
      const categoryField = `categoriesById`;

      await updateDoc(
        userRef,
        {
          [categoryField]: newCatVer,
        },
        { merge: true }
      );

      ///////////////////////////////////////////////////////////////////////////
      //   const updatedCategories = {
      //     checkpoint: { ...categoriesData.categories.checkpoint },
      //     lora: { ...categoriesData.categories.lora },
      //     embedding: categoriesData.categories.embedding,
      //   };
      //   Object.keys(categoriesData.categories.checkpoints).forEach(
      //     (subCatName) => {
      //       updatedCategories.checkpoint[subCatName] = [
      //         ...new Set([
      //           ...(categoriesData.categories.checkpoint[subCatName] || []),
      //           ...categoriesData.categories.checkpoints[subCatName],
      //         ]),
      //       ];
      //     }
      //   );
      //   Object.keys(categoriesData.categories.models).forEach((subCatName) => {
      //     updatedCategories.lora[subCatName] = [
      //       ...new Set([
      //         ...(categoriesData.categories.lora[subCatName] || []),
      //         ...categoriesData.categories.models[subCatName],
      //       ]),
      //     ];
      //   });

      //   const categoryField = `categories`;

      //   await updateDoc(
      //     userRef,
      //     {
      //       [categoryField]: updatedCategories,
      //     },
      //     { merge: true }
      //   );

      //   console.log(updatedCategories);
    }
    // const allCats = {};
    // Object.keys(allFirebaseModels).forEach((key) => {
    //   allCats[key] = [
    //     ...new Set(allFirebaseModels[key].flatMap((prev) => prev.sub)),
    //   ];
    // });
    // console.log(allCats);
    // let updatedCat;
    // if (categories && categories[modelType]?.hasOwnProperty(`${main}`)) {
    //   const newCat = new Set([...categories[modelType][`${main}`], ...sub]);
    //   updatedCat = {
    //     ...categories[modelType],
    //     [`${main}`]: [...newCat],
    //   };
    //   console.log("TEST", updatedCat);
    // } else if (categories) {
    //   updatedCat = {
    //     ...categories[modelType],
    //     [`${modelData?.main || main}`]: sub,
    //   };
    // } else {
    //   updatedCat = { [`${modelData?.main || main}`]: sub };
    // }
    // const categoryField = `categories.${modelType}`;

    // await updateDoc(
    //   userRef,
    //   {
    //     [categoryField]: updatedCat,
    //   },
    //   { merge: true }
    // );
  };

  const transferSavedImages = async () => {
    try {
      setModelIsSaving(true);

      const modelsRDRef = ref(db, "savedImages/" + modelId);
      const snapshot = await get(modelsRDRef);

      const convertedImagesData = {};
      if (snapshot.exists()) {
        const curData = await snapshot.val();
        console.log(curData);
        Object.values(curData)
          .flat()
          .forEach((post) => {
            const postData = {
              items: post.items,
              versionId: post.versionId,
              createdAt: post.items[0].createdAt,
              nsfw: post.items.some((item) => item.nsfw === true),
              savedAt: new Date().toISOString(),
            };
            convertedImagesData[post.items[0].postId] = postData;
          });
      }
      console.log(convertedImagesData);

      Object.keys(convertedImagesData).forEach(async (postId) => {
        const modelImagesRef = doc(
          firestore,
          "users",
          uid,
          "models",
          modelId + "",
          "images",
          postId + ""
        );

        await setDoc(modelImagesRef, convertedImagesData[postId], {
          merge: true,
        });
      });

      setModelIsSaving(false);
    } catch (err) {
      console.log(err);
      setModelIsSaving(false);
    }
  };
  return (
    <div>
      {false && (
        <>
          <button onClick={startUpdateHandler}>Update FR</button>
          <button onClick={runUpdateDbFireBase}>Update FB</button>
          <button onClick={updateCategories}>Update cat</button>
          <button onClick={retryFbUpdateHandler}>retry</button>
          <div>
            {modelsAmount} / {updatedModelsAmount}
          </div>
        </>
      )}
      <button onClick={transferSavedImages}>transferSI</button>
      <div>{modelIsSaving ? "Saving..." : "Done"}</div>
    </div>
  );
};

export default UpdateDbElement;
