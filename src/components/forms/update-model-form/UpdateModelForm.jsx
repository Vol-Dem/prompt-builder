import React, { useEffect, useState } from "react";
import classes from "./UpdateModelForm.module.scss";
import {
  // getImagesInfo,
  getModelData,
  // makeBatchRequest,
} from "../../../utils/fetchUtils";
// import { clearObjectKeys } from "../../../utils/generalUtils";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";
import Input from "../../ui/Input";
import Buttton from "../../ui/Button";
import Textarea from "../../ui/Textarea";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Checkbox from "../../ui/Checkbox";
import Select from "../../ui/Select";
import Fieldset from "../../ui/Fieldset";
import FieldCategory from "../../ui/FieldCategory";

const firestore = getFirestore(firebaseApp);

const tagSetsDefData = [
  {
    type: "text",
    id: "set-name-def",
    name: "set-name",
    placeholder: "Set name",
    value: "",
  },
  {
    id: "set-value-def",
    name: "set-value",
    placeholder: "Triger words",
    value: "",
  },
];

const subCatsDefData = {
  type: "text",
  id: "subcat-def",
  name: "sub",
  placeholder: "Subcategory",
  value: "",
};

const modelTypes = [
  { name: "LoRa/LoCon", value: "lora" },
  { name: "Checkpoint", value: "checkpoint" },
  { name: "Embedding", value: "embedding" },
  { name: "Hypernetwork", value: "hypernetwork" },
  { name: "Wildcard", value: "wildcard" },
  { name: "Motion", value: "motionmodule" },
  { name: "Controlnet", value: "controlnet" },
  { name: "VAE", value: "vae" },
  { name: "Wildcards", value: "wildcards" },
  { name: "Other", value: "other" },
];

const UpdateModelForm = ({ modelData, id }) => {
  // const [updateInput, setUpdateInput] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [modelTypeInput, setModelTypeInput] = useState(
    modelData?.modelType || "lora"
  );
  const [srcInput, setSrcInput] = useState("civitai.com");
  const [titleInput, setTitleInput] = useState(modelData?.name || "");
  const [descriptionInput, setDescriptionInput] = useState(
    modelData?.data.description || ""
  );
  const [idInput, setIdInput] = useState(modelData?.id || "");
  const [trigerInput, setTrigerInput] = useState(
    modelData?.defaultCustomData?.trainedWords ||
      modelData?.data?.trainedWords ||
      []
  );
  const [mainInput, setMainInput] = useState(modelData?.main || "");
  const [mainTagInput, setMainTagInput] = useState(modelData?.mainTag || "");
  const [fileNameInput, setFileNameInput] = useState(modelData?.fileName || "");
  const [weightInput, setWeightInput] = useState(
    modelData?.defaultCustomData?.weight || ""
  );
  const [minWeightInput, setMinWeightInput] = useState(
    modelData?.defaultCustomData?.minWeight || ""
  );
  const [maxWeightInput, setMaxWeightInput] = useState(
    modelData?.defaultCustomData?.maxWeight || ""
  );
  const [sizetInput, setSizeInput] = useState(
    modelData?.defaultCustomData?.size || ""
  );
  const [versionsDownloadStatus, setVersionsDownloadStatus] = useState([]);
  const [vaeInput, setVaeInput] = useState(
    modelData?.defaultCustomData?.vae || ""
  );
  const [denoisingStrengthtInput, setDenoisingStrengthInput] = useState(
    modelData?.defaultCustomData?.denoisingStrength || ""
  );
  const [hiresUpscaleInput, setHiresUpscaleInput] = useState(
    modelData?.defaultCustomData?.hiresUpscaleBy || ""
  );
  const [hiresUpscaleStepsInput, setHiresUpscaleStepsInput] = useState(
    modelData?.defaultCustomData?.hiresUpscaleSteps || ""
  );
  const [hiresUpscalerInput, setHiresUpscalerInput] = useState(
    modelData?.defaultCustomData?.hiresUpscaler || ""
  );
  const [cfgScaleInput, setCfgScaleInput] = useState(
    modelData?.defaultCustomData?.cfgScale || ""
  );
  const [samplerInput, setSamplerInput] = useState(
    modelData?.defaultCustomData?.sampler || ""
  );
  const [stepsInput, setStepsInput] = useState(
    modelData?.defaultCustomData?.steps || ""
  );
  const [helperTagsInput, setHelperTagsInput] = useState(
    modelData?.defaultCustomData?.helperTags || []
  );
  const [negativeTagsInput, setNegativeTagsInput] = useState(
    modelData?.defaultCustomData?.negativeTags || []
  );
  const [subCatInputs, setSubCatInputs] = useState([subCatsDefData]);
  const [tagSetsInputs, setTagSetsInputs] = useState([tagSetsDefData]);
  // const [userTags, setUserTags] = useState(modelData?.data?.tags || []);

  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);

  useEffect(() => {
    if (!modelData) return;
    const versionStatusInputData = modelData.data.modelVersions.map(
      (version, i) => {
        if (modelData?.modelVersionsCustomData.hasOwnProperty(version.id)) {
          const versionsCustomData =
            modelData?.modelVersionsCustomData[version.id];
          return {
            type: "checkbox",
            id: versionsCustomData.versionId + "in",
            name: versionsCustomData.versionName,
            label: versionsCustomData.versionName,
            value: versionsCustomData.downloadStatus,
          };
        } else {
          return {
            type: "checkbox",
            id: version.id + "in",
            name: version.id,
            label: version.name,
            value: false,
          };
        }
      }
    );

    setVersionsDownloadStatus(versionStatusInputData || []);

    const subCats = modelData.sub.map((name, i) => {
      return {
        type: "text",
        id: `subcat-${i}`,
        name: subCatsDefData.name,
        placeholder: subCatsDefData.placeholder,
        value: name,
      };
    });
    setSubCatInputs(subCats);
    if (!modelData?.defaultCustomData?.tagSetsData?.length) return;
    const tagSets = modelData.defaultCustomData.tagSetsData.map((tagSet, i) => {
      console.log(tagSet);
      return [
        {
          type: "text",
          id: "set-name-" + i,
          name: tagSetsDefData[0].name,
          placeholder: tagSetsDefData[0].placeholder,
          value: tagSet.name,
        },
        {
          id: "set-value-" + i,
          name: tagSetsDefData[1].name,
          placeholder: tagSetsDefData[1].placeholder,
          value: tagSet.value,
        },
      ];
    });
    setTagSetsInputs(tagSets);
  }, [modelData]);

  // const saveModelHandlerData = () => {};

  const saveModelHandler = async (e, update) => {
    try {
      e.preventDefault();
      setModelIsSaving(true);
      seteErrorMessage("");
      seteSuccessMessage("");
      const formdata = new FormData(e.target);
      // for (const [key, value] of formdata) {
      //   formObj[key] = value;
      // }
      // console.log(formdata);

      // const src = formdata.get("src")?.trim().toLowerCase() || "";
      const modelType = modelTypeInput;
      const modelId = idInput;
      const modelName = titleInput.trim();
      const description = descriptionInput.trim();
      const main = formdata.get("main")?.trim().toLowerCase();
      const subData = formdata.getAll("sub").filter(Boolean);
      const sub = subData.map((el) => el?.trim());
      const mainTag = formdata.get("main-tag")?.trim() || "";
      const weight = +formdata.get("weight")?.trim() || "";
      const minWeight = minWeightInput;
      const maxWeight = maxWeightInput;
      const size = formdata.get("size")?.trim() || "";
      const fileName = formdata.get("file-name")?.trim() || "";
      const tagSetNames = formdata.getAll("set-name") || [];
      const tagSetsValues = formdata.getAll("set-value") || [];
      const sampler = formdata.get("sampler")?.trim().toLowerCase() || "";
      const cfgScale = formdata.get("cfgScale")?.trim().toLowerCase() || "";
      const hiresUpscaler =
        formdata.get("hiresUpscaler")?.trim().toLowerCase() || "";
      const hiresUpscaleBy =
        formdata.get("hiresUpscaleBy")?.trim().toLowerCase() || "";
      const hiresUpscaleSteps =
        formdata.get("hiresUpscaleSteps")?.trim().toLowerCase() || "";
      const denoisingStrength =
        formdata.get("denoisingStrength")?.trim().toLowerCase() || "";
      const vae = formdata.get("vae")?.trim().toLowerCase() || "";
      const steps = formdata.get("steps")?.trim() || "";

      const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

      const tagSetsData = tagSetNames.flatMap((setName, i) => {
        if (!setName && !tagSetsValues[i]) return [];
        return [{ name: setName, value: tagSetsValues[i] }];
      });

      const helperTags =
        formdata
          .get("helper-tags")
          ?.trim()
          .split(splitRegEx)
          .filter(Boolean)
          .map((tag) => tag.trim()) || [];
      const negativeTags =
        formdata
          .get("negative-tags")
          ?.trim()
          .split(splitRegEx)
          .filter(Boolean)
          .map((tag) => tag.trim()) || [];

      let data = {};

      if (!modelData || update) {
        // const response = await fetch(
        //   `https://civitai.com/api/v1/models/${modelData?.id || modelId}`
        // );
        // const responseData = await response.json();
        // console.log(response);
        // if (!response.ok) {
        //   throw new Error(`Error status (${response.status})`);
        // }
        // console.log(responseData);
        // responseData?.modelVersions?.forEach((version) => {
        //   version.images.forEach((image) => {
        //     if (image.meta) {
        //       image.meta.comfy = "";
        //       image.meta = clearObjectKeys(image.meta);
        //       if (image.meta.hashes)
        //         image.meta.hashes = clearObjectKeys(image.meta.hashes);
        //     }
        //   });
        // });
        // const imagesDataWithRes = await Promise.all(
        //   responseData.modelVersions.map(async (image) => {
        //     const updImg = await makeBatchRequest(image.images, getImagesInfo);
        //     //Temp
        //     image.images = updImg;
        //     return updImg;
        //   })
        // );
        // data = responseData;
        // console.log(data);
        // console.log(imagesDataWithRes);
        data = await getModelData(modelData?.id || modelId);
      } else {
        data = modelData.data;
      }

      if (modelData && update) {
        console.log(modelData, data);
        const newVerison = data.modelVersions.filter(
          (version) =>
            !modelData.data.modelVersions.some(
              (oldVersions) => version.id === oldVersions.id
            )
        );
        data.modelVersions = [...newVerison, ...modelData.data.modelVersions];
        console.log(data.modelVersions);
      }

      if (!data.id) return;

      let modelVersionsCustomData = modelData?.modelVersionsCustomData || {};

      console.log(versionsDownloadStatus);
      data.modelVersions.forEach((version, i) => {
        const isSingle = data.modelVersions.length === 1;
        const curVersionDlStatus = versionsDownloadStatus.find(
          (dlData) => Number.parseInt(dlData.id) === version.id
        )?.value;
        const dlStatus = versionsDownloadStatus.length
          ? !!curVersionDlStatus
          : false;
        const currVersionData = modelVersionsCustomData.hasOwnProperty(
          version.id
        )
          ? modelVersionsCustomData[version.id]
          : {};

        console.log(version.id, dlStatus, isSingle);
        modelVersionsCustomData = {
          ...modelVersionsCustomData,
          [version.id]: {
            versionId: version.id,
            versionName: version.name,
            versionImageUrl:
              version.images?.filter((img, i) => img.type === "image")[0]
                ?.url || "",
            ...currVersionData,
            downloadStatus: isSingle ? true : dlStatus,
          },
        };
      });

      console.log(modelVersionsCustomData);

      const activePreviewId = data.modelVersions.find(
        (version) => modelVersionsCustomData[version.id].downloadStatus === true
      )?.id;
      console.log(activePreviewId);
      const activePreviewImg =
        (activePreviewId &&
          data.modelVersions
            ?.find((version) => version.id === activePreviewId)
            .images?.filter((img, i) => img.type === "image")[0]?.url) ||
        "";

      const previewImgDefault =
        data.modelVersions[0].images?.filter(
          (img, i) => img.type === "image"
        )[0]?.url || "";

      const previewImg = activePreviewImg || previewImgDefault;

      const modelInfo = {
        ...modelData,
        id: modelData?.id || +modelId,
        modelType,
        main,
        sub,
        data,
        name: modelName || data.name,
        fileName,
        mainTag,
        src: "civitai.com",
        defaultCustomData: {
          description: description || data.description,
          tagSetsData,
          weight,
          minWeight,
          maxWeight,
          size,
          helperTags,
          negativeTags,
          ...(modelType === "checkpoint" && {
            steps,
            sampler,
            cfgScale,
            hiresUpscaler,
            hiresUpscaleBy,
            hiresUpscaleSteps,
            denoisingStrength,
            vae,
          }),
        },
        modelVersionsCustomData,
        updatedAt: new Date().toISOString(),
        createdAt: modelData?.savedAt || new Date().toISOString(),
      };

      const loraPrevData = {
        id: modelData?.id || modelId,
        modelType,
        src: "civitai.com",
        main,
        sub,
        name: modelName || data.name || "",
        imgUrl: previewImg || "",
        type: data.type,
        baseModel: data.modelVersions[0].baseModel,
        mainTag,
        fileName,
        weight,
        minWeight,
        maxWeight,
        size,
        tags: data.modelVersions[0].trainedWords || "",
        authorTags: data.tags || [],
        tagSetsData,
        helperTags,
        modelVersionsCustomData,
        updatedAt: new Date().toISOString(),
        createdAt: modelData?.downloadedAt || Date.now(),
      };
      console.log(loraPrevData);

      const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
      const userRef = doc(firestore, "users", uid);
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelId + ""
      );

      const modelSnap = await getDoc(modelsRef);
      const modelsPrevRefSnap = await getDoc(modelsPrevRef);
      let updatedCat;
      if (categories && categories[modelType]?.hasOwnProperty(`${main}`)) {
        const newCat = new Set([...categories[modelType][`${main}`], ...sub]);
        updatedCat = {
          ...categories[modelType],
          [`${main}`]: [...newCat],
        };
        console.log("TEST", updatedCat);
      } else if (categories) {
        updatedCat = {
          ...categories[modelType],
          [`${modelData?.main || main}`]: sub,
        };
      } else {
        updatedCat = { [`${modelData?.main || main}`]: sub };
      }
      console.log("TEST2", updatedCat);

      // Throw error if user try to add existing model using new model form
      if (modelSnap.exists() && modelsPrevRefSnap.exists() && !modelData) {
        throw new Error("Exists");
      } else {
        await setDoc(modelsRef, modelInfo);
        const categoryField = `categories.${modelType}`;

        await updateDoc(
          userRef,
          {
            [categoryField]: updatedCat,
          },
          { merge: true }
        );
        const curPrevData = modelsPrevRefSnap.data() || {};
        console.log(curPrevData);
        await setDoc(modelsPrevRef, { ...curPrevData, ...loraPrevData });
      }

      ///////////////////
      // const modelsRef = ref(db, "models/" + (modelData?.id || modelId));
      // let modelsPrevRef;
      // if (formType === "Checkpoint") {
      //   modelsPrevRef = ref(db, "checkpoint preview/" + main);
      // } else {
      //   modelsPrevRef = ref(
      //     db,
      //     "models preview/" + (modelData?.main || main)
      //   );
      // }

      // get(modelsRef).then((snapshot) => {
      //   if (snapshot.exists()) {
      //     if (!modelData) {
      //       seteSuccessMessage("Exists");
      //       return;
      //     }
      //     set(modelsRef, modelInfo);
      //     savePreview(modelsPrevRef, loraPrevData, modelId);
      //   } else {
      //     set(modelsRef, modelInfo);
      //     savePreview(modelsPrevRef, loraPrevData, modelId);
      //   }
      // });

      ///////////////////////////////////////////////////////////////////////////////////////////////////
      // const modelDlsRef = collection(firestore, "users", uid, "models");
      // const modelDlSnap = await getDocs(modelDlsRef);
      // console.log(modelDlSnap);
      // modelDlSnap.forEach((doc) => {
      //   // doc.data() is never undefined for query doc snapshots
      //   console.log(doc.id);
      // });

      /////////////////////////////////////////////////////////////////////
      //MODELS PORT
      /////////////////////////////////////////////

      // // const modelsRDRef = ref(db, "models/" + "134016");
      // const modelsRDRef = ref(db, "models");
      // const snapshot = await get(modelsRDRef);

      // if (snapshot.exists()) {
      //   const curData = await snapshot.val();
      //   // const curDataR = await snapshot.val();
      //   // console.log(curDataR);
      //   // const curData = { name: curDataR };

      //   await Promise.all(
      //     Object.values(curData).map((model) => {
      //       const modelsFrRef = doc(
      //         firestore,
      //         "users",
      //         uid,
      //         "models",
      //         model.id + ""
      //       );

      //       const modelVersions = model.data.modelVersions.map((version) => {
      //         const images =
      //           version?.images?.map((img) => {
      //             const nImg = { ...img };
      //             nImg.meta = nImg?.meta ? clearObjectKeys(nImg.meta) : {};
      //             nImg.meta.comfy = null;
      //             return nImg;
      //           }) || [];
      //         return {
      //           baseModel: version.baseModel || "",
      //           baseModelType: version.baseModelType || "",
      //           createdAt: version.createdAt || "",
      //           description: version.description || "",
      //           id: version.id,
      //           modelId: version.modelId,
      //           name: version.name,
      //           trainedWords: version.trainedWords || null,
      //           updatedAt: version.updatedAt || "",
      //           vaeId: version.vaeId || null,
      //           images,
      //         };
      //       });
      //       const cleanedModelData = {
      //         id: model.data.id,
      //         name: model.data.name,
      //         description: model.data?.description || "",
      //         nsfw: model.data?.nsfw,
      //         poi: model.data?.poi,
      //         tags: model.data?.tags || "",
      //         type: model.data?.type || "",
      //         modelVersions,
      //       };
      //       const modelVersionsCustomDataConverted = {};
      //       model?.modelVersionsCustomData?.forEach((mvcd) => {
      //         modelVersionsCustomDataConverted[mvcd.versionId] = mvcd;
      //       });
      //       let cleanedSavedImages = {};
      //       if (model?.savedImages)
      //         Object.keys(model?.savedImages).forEach((key) => {
      //           cleanedSavedImages[key] =
      //             model?.savedImages[key].filter(Boolean);
      //         });
      //       const cleanedData = {
      //         id: model.id,
      //         data: cleanedModelData,
      //         main: model.main,
      //         mainTag: model?.mainTag || "",
      //         sampler: model?.sampler || "",
      //         cfgScale: model?.cfgScale || "",
      //         denoisingStrength: model?.denoisingStrength || "",
      //         fileName: model?.fileName || "",
      //         hiresUpscaleBy: model?.hiresUpscale || "",
      //         hiresUpscaler: model?.hiresUpscaler || "",
      //         modelVersionsCustomData: modelVersionsCustomDataConverted || {},
      //         negativeTags: model?.negativeTags || [],
      //         savedImages: cleanedSavedImages || {},
      //         size: model?.size || "",
      //         src: model.src,
      //         steps: model?.steps || "",
      //         sub: model.sub,
      //         updatedAt: model.updatedAt,
      //         vae: model?.vae || "",
      //         weight: model?.weight || "",
      //         title: model?.title || "",
      //         imgUrl: model?.imgUrl || "",
      //         type: model?.type || "",
      //         baseModel: model?.baseModel || "",
      //         tags: model?.tags || [],
      //         tagSetsData: model?.tagSetsData || [],
      //         helperTags: model?.helperTags || [],
      //       };
      //       console.log(cleanedData);
      //       return setDoc(modelsFrRef, cleanedData);
      //     })
      //   );
      // }

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

      setModelIsSaving(false);
      seteSuccessMessage("Saved");
    } catch (err) {
      setModelIsSaving(false);
      console.log(err);
      seteErrorMessage(err.message);
    }
  };

  // const updateModelHandler = async (e) => {
  //   console.log("UPD");
  //   const data = await getModelData(modelData?.id);

  //   const newVerison = data.modelVersions.filter(
  //     (version) =>
  //       !modelData.data.modelVersions.some(
  //         (oldVersions) => version.id === oldVersions.id
  //       )
  //   );
  //   console.log(newVerison);
  //   if (!newVerison.length) {
  //     console.log("NO UPDATEDS");
  //     return;
  //   }

  //   data.modelVersions = [...newVerison, ...modelData.data.modelVersions];
  //   console.log(data);

  //   const newVersionsCustomData = {};

  //   newVerison.forEach((version, i) => {
  //     newVersionsCustomData[version.id] = {
  //       versionId: version.id,
  //       versionName: version.name,
  //       versionImageUrl:
  //         version.images?.filter((img, i) => img.type === "image")[0]?.url ||
  //         "",
  //       downloadStatus: false,
  //     };
  //   });
  //   const modelVersionsCustomData = {
  //     ...newVersionsCustomData,
  //     ...modelData?.modelVersionsCustomData,
  //   };
  //   console.log(modelVersionsCustomData);

  //   const modelsRef = doc(
  //     firestore,
  //     "users",
  //     uid,
  //     "models",
  //     modelData?.id + ""
  //   );
  //   const modelsPrevRef = doc(
  //     firestore,
  //     "users",
  //     uid,
  //     "preview",
  //     modelData?.id + ""
  //   );

  //   await updateDoc(
  //     modelsRef,
  //     {
  //       data: data,
  //       modelVersionsCustomData: modelVersionsCustomData,
  //     },
  //     { merge: true }
  //   );
  //   await updateDoc(
  //     modelsPrevRef,
  //     {
  //       modelVersionsCustomData: modelVersionsCustomData,
  //     },
  //     { merge: true }
  //   );
  // };

  const addSubHandler = () => {
    const newFields = [...subCatInputs];
    newFields.push({
      type: "text",
      id: Date.now(),
      name: "sub",
      placeholder: "Subcategory",
      value: "",
    });

    setSubCatInputs(newFields);
  };

  const addtagSetHandler = () => {
    const newFields = [...tagSetsInputs];
    newFields.push([
      {
        type: "text",
        id: `set-name-${Date.now()}`,
        name: "set-name",
        placeholder: tagSetsInputs[0][0].placeholder,
        value: "",
      },
      {
        type: "text",
        id: `set-value-${Date.now()}`,
        name: "set-value",
        placeholder: tagSetsInputs[0][1].placeholder,
        value: "",
      },
    ]);
    console.log(newFields);
    setTagSetsInputs(newFields);
  };

  const subCatHandler = (e) => {
    setSubCatInputs((prevState) => {
      const newState = [...prevState];
      console.log(newState);
      console.log(e.target.id);
      const curIndex = newState.findIndex((imageId) => {
        return imageId.id + "" === e.target.id;
      });
      newState[curIndex].value = e.target.value;

      return newState;
    });
  };

  const subCatHtml = subCatInputs.map((sub) => {
    return (
      <Input
        key={sub.id}
        id={sub.id}
        name={sub.name}
        type={sub.type}
        placeholder={sub.placeholder}
        // defaultValue={sub.value}
        onChange={subCatHandler}
        value={sub.value}
      />
    );
  });

  const tagSetsHandler = (e) => {
    setTagSetsInputs((prevState) => {
      const newState = [...prevState];
      const curSetNameIndex = newState.findIndex((imageId) => {
        return imageId[0].id + "" === e.target.id;
      });
      const curSetTagsIndex = newState.findIndex((imageId) => {
        return imageId[1].id + "" === e.target.id;
      });
      console.log(curSetNameIndex, curSetTagsIndex);
      console.log(newState);
      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0].value = e.target.value;
      }
      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1].value = e.target.value;
      }
      // newState[curIndex] = [];
      console.log(newState);
      return newState;
    });
  };

  const tagSetsHtml = tagSetsInputs.map((tagSet) => {
    return (
      <div key={tagSet[0].id} className={classes["input-group"]}>
        <Input
          id={tagSet[0].id}
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[0].value}
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows="5"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
        ></Textarea>
      </div>
    );
  });

  const versionStatusChangeHandler = (e) => {
    setVersionsDownloadStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex(
        (version) => version.id === e.target.id
      );
      console.log(e.target.checked);

      newState[curIndex].value = e.target.checked;
      console.log(newState);
      return newState;
    });
  };

  let versionStatusHtml = versionsDownloadStatus?.map((version) => {
    return (
      <div className={classes["example-field"]} key={version.id}>
        <Checkbox
          id={version.id}
          name={version.name}
          checked={version.value}
          label={version.label}
          onChange={versionStatusChangeHandler}
        />
      </div>
    );
  });

  let typeSelectOption = modelTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  return (
    <form onSubmit={saveModelHandler} className={classes["form"]}>
      {/* {modelData && (
        <Buttton
          type="button"
          disabled={modelIsSaving}
          onClick={updateModelHandler}
          // className={classes.submit}
        >
          Update
        </Buttton>
      )} */}
      {modelData && (
        <FieldCategory>
          <Input
            name="title"
            type="text"
            label="Name"
            placeholder="Name"
            value={titleInput}
            onChange={(e) => {
              setTitleInput(e.target.value);
            }}
          />
          <Textarea
            label="Description"
            name="description"
            rows="5"
            placeholder="description"
            value={descriptionInput}
            onChange={(e) => {
              setDescriptionInput(e.target.value);
            }}
          ></Textarea>
        </FieldCategory>
      )}
      {modelData && (
        <h3 className={classes.subtitle}>Default data for all versions</h3>
      )}
      <div className={classes.fields}>
        {/* {modelData && (
          <Checkbox
            id="update"
            value={updateInput}
            name="update"
            label="update model"
            onChange={(e) => {
              setUpdateInput(e.target.checked);
            }}
          />
        )} */}
        <FieldCategory title={modelData ? "Categories" : ""}>
          <Select
            label="Type"
            name="type"
            id={id}
            selected={modelTypeInput}
            onChange={(value) => {
              setModelTypeInput(value);
            }}
            options={typeSelectOption}
          />
          {!modelData && (
            <Input
              name="id"
              label="Model ID or URL"
              type="text"
              placeholder="Model ID or URL"
              value={idInput}
              onChange={(e) => {
                setIdInput(e.target.value);
              }}
              readOnly={!!modelData}
            />
          )}
          <Input
            name="main"
            type="text"
            label="Category"
            placeholder="Main category"
            value={mainInput}
            onChange={(e) => {
              setMainInput(e.target.value);
            }}
            readOnly={!!modelData}
          />
          <Fieldset legend="Subcategories">
            {subCatHtml}
            <ButttonSecondary
              type="button"
              id="sub"
              onClick={addSubHandler}
              className={classes["btn-secondary"]}
            >
              + add subcategory
            </ButttonSecondary>
          </Fieldset>

          {modelData && (
            <Fieldset legend="Model versions" className={classes.versions}>
              {versionStatusHtml}
            </Fieldset>
          )}
          {false && (
            <Checkbox
              id="advanced"
              value={advancedSettings}
              name="advanced"
              label="advanced settings"
              onChange={(e) => {
                setAdvancedSettings(e.target.checked);
              }}
            />
          )}
        </FieldCategory>
        {(modelData || advancedSettings) && (
          <>
            <FieldCategory title="Triger words">
              <Input
                label="Activation tag"
                name="main-tag"
                type="text"
                placeholder="<lora:activation tag:1>"
                value={mainTagInput}
                onChange={(e) => {
                  setMainTagInput(e.target.value);
                }}
              />
              <Textarea
                // label="Triger word"
                name="triger"
                type="text"
                placeholder="Triger word"
                textarea={{ hidden: true }}
                value={trigerInput}
                onChange={(e) => {
                  setTrigerInput(e.target.value);
                }}
              />
              <Textarea
                label="Helper words"
                name="helper-tags"
                rows="5"
                placeholder="Helper words"
                value={helperTagsInput}
                onChange={(e) => {
                  setHelperTagsInput(e.target.value);
                }}
              ></Textarea>
              <Fieldset legend="Tag sets">
                {tagSetsHtml}
                <ButttonSecondary
                  type="button"
                  onClick={addtagSetHandler}
                  disabled={modelIsSaving}
                  className={classes["btn-secondary"]}
                >
                  + add new set
                </ButttonSecondary>
              </Fieldset>
              <Textarea
                label="Negative words"
                name="negative-tags"
                rows="5"
                placeholder="Negative words"
                value={negativeTagsInput}
                onChange={(e) => {
                  setNegativeTagsInput(e.target.value);
                }}
              ></Textarea>
            </FieldCategory>
            <FieldCategory title="Info">
              <Input
                name="src"
                type="text"
                placeholder="src"
                value={srcInput}
                input={{ hidden: true }}
                onChange={(e) => {
                  setSrcInput(e.target.value);
                }}
              />
              <Input
                label="File"
                name="file-name"
                type="text"
                placeholder="file name"
                value={fileNameInput}
                onChange={(e) => {
                  setFileNameInput(e.target.value);
                }}
              />
              <div>
                <span className={classes["weight__label"]}>
                  Strength (weight)
                </span>
                <div className={classes.weight}>
                  <Input
                    name="minWeight"
                    type="number"
                    input={{ step: "0.1" }}
                    placeholder="Min"
                    value={minWeightInput}
                    onChange={(e) => {
                      setMinWeightInput(+e.target.value);
                    }}
                  />
                  <Input
                    name="maxWeight"
                    type="number"
                    input={{ step: "0.1" }}
                    placeholder="Max"
                    value={maxWeightInput}
                    onChange={(e) => {
                      setMaxWeightInput(+e.target.value);
                    }}
                  />
                  <Input
                    name="weight"
                    type="number"
                    input={{ step: "0.1" }}
                    placeholder="Recomended"
                    value={weightInput}
                    onChange={(e) => {
                      setWeightInput(e.target.value);
                    }}
                  />
                </div>
              </div>
              <Input
                label="Image resolution"
                name="size"
                type="text"
                placeholder="Image resolution"
                value={sizetInput}
                onChange={(e) => {
                  setSizeInput(e.target.value);
                }}
              />

              {modelTypeInput === "checkpoint" && (
                <>
                  <Input
                    label="Sampling method"
                    name="sampler"
                    type="text"
                    placeholder="Sampling method"
                    value={samplerInput}
                    onChange={(e) => {
                      setSamplerInput(e.target.value);
                    }}
                  />
                  <Input
                    label="Sampling steps"
                    name="steps"
                    type="text"
                    placeholder="Sampling steps"
                    value={stepsInput}
                    onChange={(e) => {
                      setStepsInput(e.target.value);
                    }}
                  />

                  <Input
                    label="CFG Scale"
                    name="cfgScale"
                    type="text"
                    placeholder="CFG Scale"
                    value={cfgScaleInput}
                    onChange={(e) => {
                      setCfgScaleInput(e.target.value);
                    }}
                  />
                  <Input
                    label="Upscaler"
                    name="hiresUpscaler"
                    type="text"
                    placeholder="Upscaler"
                    value={hiresUpscalerInput}
                    onChange={(e) => {
                      setHiresUpscalerInput(e.target.value);
                    }}
                  />
                  <Input
                    label="Upscale by"
                    name="hiresUpscaleBy"
                    type="text"
                    placeholder="Upscale by"
                    value={hiresUpscaleInput}
                    onChange={(e) => {
                      setHiresUpscaleInput(e.target.value);
                    }}
                  />
                  <Input
                    label="Hires steps"
                    name="hiresUpscaleSteps"
                    type="text"
                    placeholder="Hires steps"
                    value={hiresUpscaleStepsInput}
                    onChange={(e) => {
                      setHiresUpscaleStepsInput(e.target.value);
                    }}
                  />
                  <Input
                    label="Denoising strength"
                    name="denoisingStrength"
                    type="text"
                    placeholder="Denoising strength"
                    value={denoisingStrengthtInput}
                    onChange={(e) => {
                      setDenoisingStrengthInput(e.target.value);
                    }}
                  />
                  <Input
                    label="VAE"
                    name="vae"
                    type="text"
                    placeholder="VAE"
                    value={vaeInput}
                    onChange={(e) => {
                      setVaeInput(e.target.value);
                    }}
                  />
                </>
              )}
            </FieldCategory>
          </>
        )}
      </div>
      <Buttton
        type="submit"
        disabled={modelIsSaving}
        className={classes.submit}
      >
        {!modelIsSaving ? "Save" : "Saving..."}
      </Buttton>
      {errorMessage && <div>{errorMessage}</div>}
      {successMessage && <div>{successMessage}</div>}
    </form>
  );
};

export default UpdateModelForm;
