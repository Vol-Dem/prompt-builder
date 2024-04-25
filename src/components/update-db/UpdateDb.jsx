import // arrayUnion,
// collection,
// doc,
// getDoc,
// getDocs,
// getFirestore,
// runTransaction,
// setDoc,
"firebase/firestore";
import React, { useState } from "react";
// import firebaseApp from "../../firebase-config";
// import { useSelector } from "react-redux";
// import { get, ref } from "firebase/database";
// import { clearObjectKeys } from "../../utils/generalUtils";
// import { makeBatchRequest } from "../../utils/fetchUtils";
import UpdateDbElement from "./UpdateDbElement";

// const firestore = getFirestore(firebaseApp);

const UpdateDb = () => {
  // const [modelIsSaving, setModelIsSaving] = useState(false);
  const [updateIsOpen, setUpdateIsOpen] = useState(false);
  // const [modelsAmount, setModelsAmount] = useState(0);
  // const [updatedModelsAmount, setUpdatedModelsAmount] = useState(0);
  // const [updatedModelsId, setUpdatedModelsId] = useState([]);
  // const [modelsToUpdate, setModelsToUpdate] = useState([]);
  // const uid = useSelector((state) => state.auth.user.uid);

  // const runUpdateDbFireBase = async () => {
  //   try {
  //     setModelIsSaving(true);

  //     const modelsRDRef = ref(db, "savedImages/11888");
  //     const snapshot = await get(modelsRDRef);

  //     if (snapshot.exists()) {
  //       const curData = await snapshot.val();
  //       console.log(curData);
  //       // setModelsToUpdate(Object.values(curData));
  //       setModelsToUpdate(curData);
  //       // setModelsToUpdate([curData]);
  //     }
  //     setModelIsSaving(false);
  //   } catch (err) {
  //     console.log(err);
  //     setModelIsSaving(false);
  //   }
  // };

  // const retryFbUpdateHandler = async () => {
  //   const notUpdated = modelsToUpdate.filter(
  //     (model) => !updatedModelsId.some((modelId) => modelId === model.id)
  //   );
  //   console.log(notUpdated.length);
  //   // await makeBatchRequest(notUpdated, updateDbFireBase, 1, false);
  // };

  //TEMP
  // const updateDb = async (prevData) => {
  //   console.log(prevData);
  //   const modelsRef = doc(firestore, "users", uid, "models", prevData.id + "");
  //   const modelsPrevRef = doc(
  //     firestore,
  //     "users",
  //     uid,
  //     "preview",
  //     prevData.id + ""
  //   );
  //   // const oldModelsPrevRef = doc(
  //   //   firestore,
  //   //   "users",
  //   //   uid,
  //   //   "models preview",
  //   //   prevData.id + ""
  //   // );

  //   try {
  //     await runTransaction(firestore, async (transaction) => {
  //       const sfDoc = await transaction.get(modelsRef);
  //       if (!sfDoc.exists()) {
  //         throw "Document does not exist!";
  //       }
  //       const curDataDoc = sfDoc.data();

  //       let weight = null;
  //       let minWeight = null;
  //       let maxWeight = null;

  //       if (curDataDoc?.data?.weight) {
  //         const weightArr = curDataDoc.data.weight.split("-");
  //         if (weightArr?.length > 1) {
  //           minWeight = +weightArr[0].trim();
  //           maxWeight = +weightArr[1].trim();
  //         } else {
  //           weight = +curDataDoc.data.weight || null;
  //         }
  //       }

  //       let modelTypeName;
  //       switch (curDataDoc?.data?.type) {
  //         case "LORA":
  //           modelTypeName = "lora";
  //           break;
  //         case "Checkpoint":
  //           modelTypeName = "checkpoint";
  //           break;
  //         case "TextualInversion":
  //           modelTypeName = "embedding";
  //           break;
  //         default:
  //           modelTypeName = "lora";
  //       }

  //       const data = {
  //         id: curDataDoc?.data.id,
  //         description: curDataDoc?.data?.description || "",
  //         modelVersions: curDataDoc?.data?.modelVersions || [],
  //         name: curDataDoc?.data?.name || "",
  //         nsfw: curDataDoc?.data?.nsfw || false,
  //         nsfwLevel: curDataDoc?.data?.nsfwLevel || null,
  //         poi: curDataDoc?.data?.poi || false,
  //         tags: curDataDoc?.data?.tags || [],
  //         type: curDataDoc?.data?.type || "",
  //       };

  //       const fileNames =
  //         curDataDoc?.data?.modelVersions?.flatMap((version) => {
  //           // version.files.map((file) => file.name)
  //           if (version.hasOwnProperty("files")) {
  //             return version?.files[0].name;
  //           }
  //           return [];
  //         }) || [];

  //       const newModelData = {
  //         id: curDataDoc?.id,
  //         modelType: modelTypeName || "",
  //         data: data,
  //         main: curDataDoc?.main || "",
  //         mainTag: curDataDoc?.mainTag || "",
  //         name: curDataDoc?.data.name || "",
  //         fileName: curDataDoc?.fileName || "",
  //         src: "civitai.com",
  //         savedImages: curDataDoc?.savedImages || {},
  //         sub: curDataDoc?.sub || [],
  //         defaultCustomData: {
  //           description: curDataDoc?.data.description || "",
  //           helperTags: curDataDoc?.helperTags || [],
  //           negativeTags: curDataDoc?.negativeTags || [],
  //           tagSetsData: curDataDoc?.tagSetsData || [],
  //           weight,
  //           minWeight,
  //           maxWeight,
  //           size: curDataDoc?.size || "",
  //           vae: curDataDoc?.vae || "",
  //           sampler: curDataDoc?.sampler || "",
  //           cfgScale: curDataDoc?.cfgScale || "",
  //           steps: curDataDoc?.steps || "",
  //           hiresUpscaler: curDataDoc?.hiresUpscaler || "",
  //           hiresUpscaleBy: curDataDoc?.hiresUpscaleBy || "",
  //           hiresUpscaleSteps: curDataDoc?.hiresUpscaleSteps || "",
  //           denoisingStrength: curDataDoc?.denoisingStrength || "",
  //         },
  //         modelVersionsCustomData: curDataDoc?.modelVersionsCustomData || {},
  //         nsfw: curDataDoc?.nsfw || false,
  //         nsfwLevel: curDataDoc?.nsfwLevel || null,
  //         poi: curDataDoc?.poi || false,
  //         createdAt: curDataDoc?.createdAt || "",
  //         updatedAt: curDataDoc?.updatedAt || "",
  //       };

  //       //TEMP TO EDIT
  //       // const modelPrevData = {
  //       //   id: curDataDoc?.id,
  //       //   modelType: modelTypeName || "",
  //       //   src: "civitai.com",
  //       //   main: curDataDoc?.main || "",
  //       //   sub: curDataDoc?.sub || [],
  //       //   name: curDataDoc?.data.name || "",
  //       //   imgUrl: previewImg || "",
  //       //   type: data.type,
  //       //   nsfw: data?.nsfw || "",
  //       //   nsfwLevel: data?.nsfwLevel || "",
  //       //   baseModel: data.modelVersions[0].baseModel,
  //       //   baseModels: [...baseModels],
  //       //   mainTag,
  //       //   fileName,
  //       //   fileNames,
  //       //   weight,
  //       //   minWeight,
  //       //   maxWeight,
  //       //   size,
  //       //   tags: data.modelVersions[0].trainedWords || "",
  //       //   authorTags: data.tags || [],
  //       //   tagSetsData,
  //       //   helperTags,
  //       //   modelVersionsCustomData,
  //       //   updatedAt: new Date().toISOString(),
  //       //   createdAt: modelData?.downloadedAt || Date.now(),
  //       // };
  //       // const sfPrevDoc = await transaction.get(oldModelsPrevRef);
  //       // if (!sfPrevDoc.exists()) {
  //       //   throw "Document does not exist!";
  //       // }
  //       // const curPrevDataDoc = sfPrevDoc.data();

  //       const newModelPrevData = {
  //         ...prevData,
  //         modelType: modelTypeName || "",
  //         fileNames,
  //         weight,
  //         minWeight,
  //         maxWeight,
  //       };
  //       console.log(newModelData);
  //       console.log(newModelPrevData);

  //       transaction.update(modelsRef, newModelData);
  //       transaction.set(modelsPrevRef, newModelPrevData);
  //     });
  //     return "done";
  //     // console.log("Transaction successfully committed!");
  //     // setModelIsSaving(false);
  //   } catch (err) {
  //     console.log("Transaction failed: ", err);
  //     // setModelIsSaving(false);
  //   }
  // };

  // const startUpdateHandler = async () => {
  //   setModelIsSaving(true);
  //   const querySnapshot = await getDocs(
  //     collection(firestore, "users", uid, "checkpoints preview")
  //   );
  //   const oldPrevs = [];
  //   querySnapshot.forEach(async (doc) => {
  //     // doc.data() is never undefined for query doc snapshots
  //     // console.log(doc.id, " => ", doc.data());
  //     // oldPrevs.push(doc.data());
  //     await updateDb(doc.data());
  //   });
  //   // console.log(oldPrevs);
  //   // await makeBatchRequest(oldPrevs, updateDb);
  //   setModelIsSaving(false);
  // };

  const openUpdateHandler = () => {
    setUpdateIsOpen((prevState) => !prevState);
  };

  return (
    <div>
      {/* <button onClick={startUpdateHandler}>Update FR</button> */}
      {/* <button onClick={runUpdateDbFireBase}>Update FB</button>
      <button onClick={retryFbUpdateHandler}>retry</button>
      <div>
        {modelsAmount} / {updatedModelsAmount}
      </div>
      <div>{modelIsSaving ? "Saving..." : "Done"}</div> */}
      {/* <button onClick={runUpdateDbFireBase}>Load models</button> */}
      {/* <div>{modelIsSaving ? "Loading" : "Done"}</div> */}
      {/* <div>All models: {modelsToUpdate.length}</div> */}
      <button onClick={openUpdateHandler}>Open Update</button>
      {updateIsOpen && (
        <UpdateDbElement
        // allFirebaseModels={modelsToUpdate}
        />
      )}
    </div>
  );
};

export default UpdateDb;
