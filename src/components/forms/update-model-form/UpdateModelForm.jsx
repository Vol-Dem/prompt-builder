import React, { useEffect, useState } from "react";
import classes from "./UpdateModelForm.module.scss";
import {
  // getImagesInfo,
  getModelData,
  makeBatchRequest,
  saveVersionImages,
  // makeBatchRequest,
  // makeBatchRequest,
} from "../../../utils/fetchUtils";
// import { clearObjectKeys } from "../../../utils/generalUtils";
import {
  arrayUnion,
  // collection,
  doc,
  getDoc,
  // getDocs,
  getFirestore,
  runTransaction,
  // runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../ui/Input";
import Buttton from "../../ui/Button";
import Textarea from "../../ui/Textarea";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Checkbox from "../../ui/Checkbox";
import Select from "../../ui/Select";
import Fieldset from "../../ui/Fieldset";
import FieldCategory from "../../ui/FieldCategory";
import {
  clearFileExtension,
  splitTags,
  validateInput,
} from "../../../utils/generalUtils";
import { Link } from "react-router-dom";
import Spinner from "../../ui/Spinner";
import {
  CATEGORY_NAME_MAX_LENGTH,
  DEF_INPUT_ERROR_MESSAGE,
  DESCRIPTION_MAX_LENGTH,
  EXISTS_ERROR_MESSAGE,
  ID_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NUMBER_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  SAVED_SUCCESS_MESSAGE,
  TITLE_MAX_LENGTH,
  TRIGER_WORDS_MAX_LENGTH,
  modelTypes,
} from "../../../variables/constants";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import InputNumber from "../../ui/InputNumber";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import { tabActions } from "../../../store/tabs";

const firestore = getFirestore(firebaseApp);

const tagSetsDefData = [
  {
    type: "text",
    id: "set-name-def",
    name: "set-name",
    placeholder: "Set name",
    value: "",
    isValid: true,
    errorMessage: "",
  },
  {
    id: "set-value-def",
    name: "set-value",
    placeholder: "Trigger words",
    value: "",
    isValid: true,
    errorMessage: "",
  },
];

const subCatsDefData = {
  type: "text",
  id: "subcat-def",
  name: "sub",
  placeholder: "Subcategory",
  value: "",
  isValid: false,
  errorMessage: "This field is required",
};

// const modelTypes = [
//   { name: "LoRa/LoCon", value: "lora" },
//   { name: "Checkpoint", value: "checkpoint" },
//   { name: "Embedding", value: "embedding" },
//   { name: "Hypernetwork", value: "hypernetwork" },
//   { name: "Wildcard", value: "wildcard" },
//   { name: "Motion", value: "motionmodule" },
//   { name: "Controlnet", value: "controlnet" },
//   { name: "VAE", value: "vae" },
//   { name: "Wildcards", value: "wildcards" },
//   { name: "Other", value: "other" },
// ];

const UpdateModelForm = ({ modelData, id }) => {
  // const [updateInput, setUpdateInput] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [modelTypeInput, setModelTypeInput] = useState(
    modelData?.modelType || "lora"
  );
  const [srcInput, setSrcInput] = useState({
    value: "civitai.com",
    isValid: true,
  });
  const [nsfwInput, setNsfwInput] = useState(modelData?.nsfw);
  const [titleInput, setTitleInput] = useState({
    value: modelData?.name || "",
    isValid: true,
  });
  const [descriptionInput, setDescriptionInput] = useState({
    value: modelData?.defaultCustomData?.description || "",
    isValid: true,
  });
  const [idInput, setIdInput] = useState({
    value: modelData?.id || "",
    isValid: !modelData?.id ? false : true,
  });
  const [trigerInput, setTrigerInput] = useState({
    value:
      modelData?.defaultCustomData?.trainedWords ||
      modelData?.data?.trainedWords ||
      [],
    isValid: true,
  });
  const [mainInput, setMainInput] = useState({
    value: modelData?.main || "",
    isValid: !modelData?.id ? false : true,
  });
  const [mainTagInput, setMainTagInput] = useState({
    value: modelData?.mainTag || "",
    isValid: true,
  });
  const [fileNameInput, setFileNameInput] = useState({
    value: modelData?.defaultCustomData?.fileName || "",
    isValid: true,
  });
  const [weightInput, setWeightInput] = useState({
    value: modelData?.defaultCustomData?.weight || "",
    isValid: true,
  });
  const [minWeightInput, setMinWeightInput] = useState({
    value: modelData?.defaultCustomData?.minWeight || "",
    isValid: true,
  });
  const [maxWeightInput, setMaxWeightInput] = useState({
    value: modelData?.defaultCustomData?.maxWeight || "",
    isValid: true,
  });
  const [sizetInput, setSizeInput] = useState({
    value: modelData?.defaultCustomData?.size || "",
    isValid: true,
  });
  const [versionsDownloadStatus, setVersionsDownloadStatus] = useState([]);
  const [vaeInput, setVaeInput] = useState({
    value: modelData?.defaultCustomData?.vae || "",
    isValid: true,
  });
  const [denoisingStrengthtInput, setDenoisingStrengthInput] = useState({
    value: modelData?.defaultCustomData?.denoisingStrength || "",
    isValid: true,
  });
  const [hiresUpscaleInput, setHiresUpscaleInput] = useState({
    value: modelData?.defaultCustomData?.hiresUpscaleBy || "",
    isValid: true,
  });
  const [hiresUpscaleStepsInput, setHiresUpscaleStepsInput] = useState({
    value: modelData?.defaultCustomData?.hiresUpscaleSteps || "",
    isValid: true,
  });
  const [hiresUpscalerInput, setHiresUpscalerInput] = useState({
    value: modelData?.defaultCustomData?.hiresUpscaler || "",
    isValid: true,
  });
  const [cfgScaleInput, setCfgScaleInput] = useState({
    value: modelData?.defaultCustomData?.cfgScale || "",
    isValid: true,
  });
  const [samplerInput, setSamplerInput] = useState({
    value: modelData?.defaultCustomData?.sampler || "",
    isValid: true,
  });
  const [stepsInput, setStepsInput] = useState({
    value: modelData?.defaultCustomData?.steps || "",
    isValid: true,
  });
  const [helperTagsInput, setHelperTagsInput] = useState({
    value: modelData?.defaultCustomData?.helperTags || [],
    isValid: true,
  });
  const [negativeTagsInput, setNegativeTagsInput] = useState({
    value: modelData?.defaultCustomData?.negativeTags || [],
    isValid: true,
  });
  const [subCatInputs, setSubCatInputs] = useState([subCatsDefData]);
  const [tagSetsInputs, setTagSetsInputs] = useState([tagSetsDefData]);
  const [savedModel, setSavedModel] = useState(null);
  // const [userTags, setUserTags] = useState(modelData?.data?.tags || []);

  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const curBaseModels = useSelector((state) => state.tabs.baseModels);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!modelData) return;
    const versionStatusInputData = Object.values(
      modelData?.modelVersionsCustomData
    )
      ?.sort((a, b) => a?.index - b?.index)
      .map((version, i) => {
        // if (modelData?.modelVersionsCustomData.hasOwnProperty(version.id)) {
        // const versionsCustomData =
        //   modelData?.modelVersionsCustomData[version.id];
        return {
          type: "checkbox",
          id: version.versionId + "in",
          name: version.versionName,
          label: version.name,
          value: version.downloadStatus,
        };
        // } else {
        //   return {
        //     type: "checkbox",
        //     id: version.id + "in",
        //     name: version.id,
        //     label: version.name,
        //     value: false,
        //   };
        // }
      });

    setVersionsDownloadStatus(versionStatusInputData || []);

    const subCats = modelData.sub.map((subId, i) => {
      const subData = categories[modelData.modelType]
        ?.find((category) => category.id === modelData.main)
        ?.subcategories.find((sucategory) => sucategory.id === subId);
      return {
        type: "text",
        id: `subcat-${i}`,
        name: subCatsDefData.name,
        placeholder: subCatsDefData.placeholder,
        value: subData?.name || subId || "",
        isValid: true,
        errorMessage: "",
      };
    });
    setSubCatInputs(subCats);

    const mainCategoryName = categories[modelData?.modelType]?.find(
      (category) => category.id === modelData?.main
    )?.name;

    setMainInput({
      value: mainCategoryName || modelData?.main,
      isValid: true,
    });

    if (!!modelData?.defaultCustomData?.tagSetsData?.length) {
      const tagSets = modelData.defaultCustomData.tagSetsData.map(
        (tagSet, i) => {
          return [
            {
              type: "text",
              id: "set-name-" + i,
              name: tagSetsDefData[0].name,
              placeholder: tagSetsDefData[0].placeholder,
              value: tagSet.name,
              isValid: true,
              errorMessage: "",
            },
            {
              id: "set-value-" + i,
              name: tagSetsDefData[1].name,
              placeholder: tagSetsDefData[1].placeholder,
              value: tagSet.value,
              isValid: true,
              errorMessage: "",
            },
          ];
        }
      );
      setTagSetsInputs(tagSets);
    }
  }, [modelData, categories]);

  const createCategoryId = (id, categoriesData) => {
    console.log("CREATE", id, categoriesData);
    if (!id) {
      return;
    }
    let curId = id;
    let mainIdExists;

    //Check if category id is exists
    mainIdExists = categoriesData?.find((category) => category.id === curId);

    while (mainIdExists) {
      const idArr = curId.split("-");
      const lastNubmer = parseInt(idArr.slice(-1));

      curId = lastNubmer
        ? `${idArr.slice(0, -1).join("-")}-${lastNubmer + 1}`
        : `${curId}-2`;

      mainIdExists = categoriesData.find((category) => category.id === curId);
    }

    return curId;
  };

  const saveModelHandler = async (e, update) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");
      setShowErrorMessage(true);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false
      );
      const subcatsIsValid = !!subCatInputs.find(
        (input) => input.isValid === true
      );

      // console.log(
      //   !idInput.isValid,
      //   !srcInput.isValid,
      //   !mainInput.isValid,
      //   !subcatsIsValid,
      //   !titleInput.isValid,
      //   !descriptionInput.isValid,
      //   !mainTagInput.isValid,
      //   !trigerInput.isValid,
      //   !helperTagsInput.isValid,
      //   !negativeTagsInput.isValid,
      //   tagsetsIsNotValid,
      //   !fileNameInput.isValid,
      //   !weightInput.isValid,
      //   !minWeightInput.isValid,
      //   !maxWeightInput.isValid,
      //   !sizetInput.isValid,
      //   !vaeInput.isValid,
      //   !denoisingStrengthtInput.isValid,
      //   !hiresUpscaleInput.isValid,
      //   !hiresUpscaleStepsInput.isValid,
      //   !hiresUpscalerInput.isValid,
      //   !cfgScaleInput.isValid,
      //   !samplerInput.isValid,
      //   !stepsInput.isValid
      // );

      const mainInputsIsNotValid =
        !idInput.isValid || !mainInput.isValid || !subcatsIsValid;

      const baseInputsIsNotValid =
        !srcInput.isValid ||
        !titleInput.isValid ||
        !descriptionInput.isValid ||
        !mainTagInput.isValid ||
        !trigerInput.isValid ||
        !helperTagsInput.isValid ||
        !negativeTagsInput.isValid ||
        tagsetsIsNotValid ||
        !fileNameInput.isValid ||
        !weightInput.isValid ||
        !minWeightInput.isValid ||
        !maxWeightInput.isValid ||
        !sizetInput.isValid;

      const aditionalInputsIsNotValid =
        !vaeInput.isValid ||
        !denoisingStrengthtInput.isValid ||
        !hiresUpscaleInput.isValid ||
        !hiresUpscaleStepsInput.isValid ||
        !hiresUpscalerInput.isValid ||
        !cfgScaleInput.isValid ||
        !samplerInput.isValid ||
        !stepsInput.isValid;

      // console.log(
      //   "ALL INP",
      //   mainInputsIsNotValid,
      //   baseInputsIsNotValid,
      //   aditionalInputsIsNotValid
      // );

      if (
        mainInputsIsNotValid ||
        (!!modelData && baseInputsIsNotValid) ||
        (!!modelData &&
          modelTypeInput === "checkpoint" &&
          aditionalInputsIsNotValid)
      ) {
        throw new Error(DEF_INPUT_ERROR_MESSAGE);
      }
      if (!navigator?.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }

      // return;
      setModelIsSaving(true);

      const formdata = new FormData(e.target);
      // for (const [key, value] of formdata) {
      //   formObj[key] = value;
      // }
      // console.log(formdata);

      // const src = formdata.get("src")?.trim().toLowerCase() || "";
      const modelType = modelTypeInput;
      let modelId;
      if (Number.isFinite(+idInput.value)) {
        modelId = +idInput.value;
      } else {
        const urlArr = idInput.value.split("/");
        const modelIdIndex =
          urlArr.findIndex((urlPart) => urlPart === "models") + 1;

        if (modelIdIndex) {
          modelId = parseInt(urlArr[modelIdIndex]);
        } else {
          throw new Error("Invalid URL");
        }
      }

      const modelName = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const main = formdata.get("main")?.trim().toLowerCase();
      const subData = formdata.getAll("sub").filter(Boolean);
      const sub = subData.map((el) => el?.trim());
      const mainTag = formdata.get("main-tag")?.trim() || "";
      const weight = parseFloat(formdata.get("weight")?.trim()) || null;
      const minWeight = parseFloat(minWeightInput.value) || null;
      const maxWeight = parseFloat(maxWeightInput.value) || null;
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

      const tagSetsInputData = tagSetNames.flatMap((setName, i) => {
        if (!setName && !tagSetsValues[i]) return [];
        return [{ name: setName, value: tagSetsValues[i] }];
      });

      let tagSetsData;
      if (!modelData?.defaultCustomData?.tagSetsData?.length) {
        tagSetsData = tagSetsInputData;
      } else {
        tagSetsData = tagSetsInputData.map((tagSet, i) => {
          return {
            ...modelData?.defaultCustomData?.tagSetsData[i],
            ...tagSet,
          };
        });
      }

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

      let modelVersions = [];

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

      // Throw error if user try to add existing model using new model form
      if (modelSnap.exists() && modelsPrevRefSnap.exists() && !modelData) {
        throw new Error(EXISTS_ERROR_MESSAGE);
      } else {
        if (!modelData) {
          // data = await getModelData(modelData?.id || modelId);
          //Upload model to database
          const saveModelRes = await fetch(
            `http://127.0.0.1:5001/aide-tools/us-central1/updateModel?modelId=${
              modelData?.id || modelId
            }`
          );

          const saveModelResData = await saveModelRes.json();

          if (!saveModelResData.modelId) {
            throw new Error("Failed to upload");
          }

          const modelDefDataRef = doc(firestore, "models", `${modelId}`);

          const docSnap = await getDoc(modelDefDataRef);

          if (docSnap.exists()) {
            data = docSnap.data();
            modelVersions = data?.modelVersions;
          }
        } else {
          data = modelData.data;
          modelVersions = data?.modelVersions.filter((version) =>
            Object.keys(modelData?.modelVersionsCustomData).includes(
              `${version.id}`
            )
          );
        }

        // if (modelData && update) {
        //   const newVerison = modelVersions.filter(
        //     (version) =>
        //       !modelData.modelVersions.some(
        //         (oldVersions) => version.id === oldVersions.id
        //       )
        //   );
        //   modelVersions = [...newVerison, ...modelData.modelVersions];
        // }
        console.log(data);
        console.log(modelData);
        if (!data.id) return;

        let modelVersionsCustomData = modelData?.modelVersionsCustomData || {};

        modelVersions.forEach((version, i) => {
          // const isSingle = modelVersions.length === 1;
          const isSingle = !Object.keys(modelVersionsCustomData).length;
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

          let fileName;
          if (version.hasOwnProperty("files") && version?.files) {
            fileName = clearFileExtension(
              version.files.find((file) => file?.primary).name
            ).toLowerCase();
          }

          const defActTag =
            fileName && data?.type == "LORA" ? `<lora:${fileName}:1>` : "";

          modelVersionsCustomData = {
            ...modelVersionsCustomData,
            [version.id]: {
              versionId: version.id,
              index: version.index,
              name: version.name,
              versionName: version.name,
              baseModel: version.baseModel,
              defActTag,
              trainedWords:
                version?.trainedWords?.flatMap((word) => {
                  return splitTags(word);
                }) || [],
              defFileName: fileName || "",
              versionImageUrl: version.images[0]?.url || "",
              ...currVersionData,
              downloadStatus: isSingle && !i ? true : dlStatus,
            },
          };
        });

        const activePreviewId = modelVersions.find(
          (version) =>
            modelVersionsCustomData[version.id].downloadStatus === true
        )?.id;

        const activePreviewImg =
          (activePreviewId &&
            modelVersions
              ?.find((version) => version.id === activePreviewId)
              .images?.filter((img, i) => img.type === "image")[0]?.url) ||
          "";

        // const previewImgDefault =
        //   modelVersions[0].images?.filter(
        //     (img, i) => img.type === "image"
        //   )[0]?.url || "";
        const previewImgDefault = modelVersions[0]?.images[0]?.url || "";

        const previewImg = activePreviewImg || previewImgDefault;

        const fileNames = modelVersions?.flatMap((version) => {
          // version.files.map((file) => file.name)
          if (version.hasOwnProperty("files") && version?.files) {
            return [
              ...new Set(
                version.files
                  .filter((file) => file?.type === "Model")
                  .map((file) => clearFileExtension(file?.name).toLowerCase())
              ),
            ];

            // return clearFileExtension(
            //   version.files.find((file) => file?.primary).name
            // ).toLowerCase();
          }
          return [];
        });

        const hashes = modelVersions
          ?.flatMap((version) => {
            // version.files.map((file) => file.name)
            if (version.hasOwnProperty("files") && version?.files) {
              //   const primaryFileHashes = version?.files.find(
              //     (file) => file?.primary
              //   )?.hashes;
              return version?.files
                .filter((file) => file?.type === "Model")
                .flatMap((file) => Object.values(file?.hashes).filter(Boolean))
                .map((hash) => hash.toLowerCase());
              // return version?.files
              //   .flatMap((file) => Object.values(file?.hashes).filter(Boolean))
              //   .map((hash) => hash.toLowerCase());
              // if (primaryFileHashes) {
              //   return Object.values(primaryFileHashes)?.map((hash) =>
              //     hash.toLowerCase()
              //   );
              // }
            }
            return [];
          })
          .filter(Boolean);

        const customFileNames = Object.values(modelVersionsCustomData)
          ?.map((version) => {
            return clearFileExtension(version?.fileName)?.toLowerCase();
          })
          .filter(Boolean);

        const nameArr =
          (modelName || data.name)
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .toLowerCase()
            .split(" ") || [];

        const versionIds = modelVersions?.map((version) => version.id) || [];

        const baseModels = new Set(
          modelVersions?.flatMap((version) => version?.baseModel || [])
        );

        // if (!curBaseModels?.length) {
        //   newBaseModel = true;
        // } else {
        //   baseModels.forEach((baseModel) => {
        //     const exists = curBaseModels.some(
        //       (curBaseModel) => curBaseModel === baseModel
        //     );
        //     if (!exists) {
        //       newBaseModel = true;
        //     }
        //   });
        // }
        let newCategory = false;
        let newSubcategory = false;
        let newBaseModel = false;

        const { mainId, subIds } = await runTransaction(
          firestore,
          async (transaction) => {
            const sfDoc = await transaction.get(userRef);
            // if (!sfDoc.exists()) {
            //   throw new Error("Resource does not exist!");
            // }

            const categories = sfDoc?.data()?.categoriesById || {};
            const curUserBaseModels = sfDoc?.data()?.baseModels || [];

            if (!curUserBaseModels?.length) {
              newBaseModel = true;
            } else {
              baseModels.forEach((baseModel) => {
                const exists = curUserBaseModels.some(
                  (curBaseModel) => curBaseModel === baseModel
                );
                if (!exists) {
                  newBaseModel = true;
                }
              });
            }

            // if (!categories) {
            //   throw new Error("Can't update, try again later");
            // }

            let updatedCategories;
            // if (categories && categories[modelType]?.hasOwnProperty(`${main}`)) {
            //   const newCat = new Set([...categories[modelType][`${main}`], ...sub]);
            //   updatedCategories = {
            //     ...categories[modelType],
            //     [`${main}`]: [...newCat],
            //   };
            //   console.log("TEST", updatedCategories);
            // } else if (categories) {
            //   updatedCategories = {
            //     ...categories[modelType],
            //     [`${modelData?.main || main}`]: sub,
            //   };
            // } else {
            //   updatedCategories = { [`${modelData?.main || main}`]: sub };
            // }

            let mainId;
            let subIds;
            const mainCategoryData = categories[modelType]?.find(
              (category) => category.name === main
            );

            if (!mainCategoryData) {
              newCategory = true;
              const currCategories = categories[modelType] || [];
              mainId = createCategoryId(main, categories[modelType]);
              // console.log(mainId)
              subIds = sub;
              updatedCategories = [
                ...currCategories,
                {
                  id: mainId,
                  name: main,
                  subcategories: sub.map((subcategory) => {
                    return { id: subcategory, name: subcategory };
                  }),
                },
              ];
            } else {
              mainId = mainCategoryData.id;
              subIds = [];
              const newSubcategoriesData = sub.flatMap((subcategory) => {
                const subExists = mainCategoryData.subcategories.find(
                  (oldSucategories) => oldSucategories.name === subcategory
                );

                if (!subExists) {
                  newSubcategory = true;
                  const categoryId = createCategoryId(
                    subcategory,
                    mainCategoryData.subcategories
                  );
                  subIds = [...subIds, categoryId];
                  return {
                    id: categoryId,
                    name: subcategory,
                  };
                } else {
                  subIds = [...subIds, subExists.id];
                  return [];
                }
              });
              const mainCategoryIndex = categories[modelType].findIndex(
                (category) => category.name === main
              );

              const curUpdatedCategory = {
                id: mainId,
                name: mainCategoryData.name,
                subcategories: [
                  ...mainCategoryData.subcategories,
                  ...newSubcategoriesData,
                ],
              };
              updatedCategories = [
                ...categories[modelType].slice(0, mainCategoryIndex),
                curUpdatedCategory,
                ...categories[modelType].slice(mainCategoryIndex + 1),
              ];
            }

            const categoryField = `categoriesById.${modelType}`;

            // await updateDoc(
            //   userRef,
            //   {
            //     [categoryField]: updatedCategories,
            //   },
            //   { merge: true }
            // );

            if (newBaseModel || newCategory || newSubcategory) {
              console.log("RUN TRANS");
              if (!sfDoc.exists()) {
                transaction.set(
                  userRef,
                  {
                    categoriesById: { [modelType]: updatedCategories },
                    baseModels: baseModels,
                  },
                  { merge: true }
                );
              } else {
                transaction.update(
                  userRef,
                  {
                    [categoryField]: updatedCategories,
                    baseModels: arrayUnion(...baseModels),
                  },
                  { merge: true }
                );
              }
            }
            return { mainId, subIds };
            // if (newPop <= 1000000) {
            //   transaction.update(sfDocRef, { population: newPop });
            //   return newPop;
            // } else {
            //   return Promise.reject("Sorry! Population is too big");
            // }
          }
        );

        let createdAt;
        if (modelData?.createdAt) {
          createdAt = Number.isFinite(modelData?.createdAt)
            ? modelData?.createdAt
            : Date.parse(modelData?.createdAt);
        } else {
          createdAt = Date.parse(modelData?.downloadedAt) || Date.now();
        }

        const modelInfo = {
          // ...modelData,
          // data: null,
          id: modelData?.id || +modelId,
          versionIds,
          modelType,
          // baseModels: [...baseModels],
          main: mainId,
          sub: subIds,
          name: modelName || data.name,
          mainTag,
          nsfw: nsfwInput || false,
          // nsfw: nsfwInput || false,
          // nsfwLevel: data?.nsfwLevel || null,
          // hashes,
          src: "civitai.com",
          defaultCustomData: {
            description: !!modelData ? description : data?.description,
            ...(tagSetsData?.length && {
              tagSetsData,
            }),
            // tagSetsData,
            ...(weight && {
              weight,
            }),
            // weight,
            ...(minWeight && {
              minWeight,
            }),
            // minWeight: minWeight || null,
            ...(maxWeight && {
              maxWeight,
            }),
            // maxWeight: maxWeight || null,
            ...(size && {
              size,
            }),
            // size,
            ...(fileName && {
              fileName,
            }),
            // fileName,
            ...(helperTags?.length && {
              helperTags,
            }),
            // helperTags,
            ...(negativeTags?.length && {
              negativeTags,
            }),
            // negativeTags,
            ...(modelType === "checkpoint" && {
              ...(steps &&
                {
                  // steps,
                }),
              ...(sampler && {
                sampler,
              }),
              // sampler,
              ...(cfgScale && {
                cfgScale,
              }),
              // cfgScale,
              ...(hiresUpscaler && {
                hiresUpscaler,
              }),
              // hiresUpscaler,
              ...(hiresUpscaleBy && {
                hiresUpscaleBy,
              }),
              // hiresUpscaleBy,
              ...(hiresUpscaleSteps && {
                hiresUpscaleSteps,
              }),
              // hiresUpscaleSteps,
              ...(denoisingStrength && {
                denoisingStrength,
              }),
              // denoisingStrength,
              ...(vae && {
                vae,
              }),
              // vae,
            }),
          },
          modelVersionsCustomData,
          savedImages: modelData?.savedImages || {},
          updatedAt: new Date().toISOString(),
          createdAt,
        };

        const loraPrevData = {
          id: modelData?.id || modelId,
          versionIds,
          modelType,
          src: "civitai.com",
          main: mainId,
          sub: subIds,
          name: modelName || data.name || "",
          nameArr,
          imgUrl: previewImg || "",
          type: data.type,
          creator: data?.creator || "",
          nsfw: nsfwInput || false,
          nsfwLevel: data?.nsfwLevel || "",
          baseModel: modelVersions[0].baseModel,
          baseModels: [...baseModels],
          mainTag,
          fileName,
          latestFileName: !!fileNames?.length ? fileNames[0] : "",
          hashes,
          fileNames,
          customFileNames,
          weight,
          minWeight,
          maxWeight,
          size,
          tags: modelVersions[0].trainedWords || "",
          authorTags: data.tags || [],
          tagSetsData,
          // helperTags,
          modelVersionsCustomData,
          updatedAt: new Date().toISOString(),
          createdAt,
        };
        console.log(loraPrevData);

        await setDoc(modelsRef, modelInfo);

        const curPrevData = modelsPrevRefSnap.data() || {};
        console.log(curPrevData);
        await setDoc(modelsPrevRef, { ...curPrevData, ...loraPrevData });

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
        //       setSuccessMessage("Exists");
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

        // /////////Save modelImages with gen info ///////////
        // if (data?.creator?.username && !modelData) {
        //   const versionsWithUserName = data?.modelVersions?.map((version) => {
        //     return {
        //       ...version,
        //       modelId,
        //       username: data.creator.username,
        //     };
        //   });

        //   await makeBatchRequest(versionsWithUserName, saveVersionImages);
        // }
        if (newBaseModel) {
          const updatedBaseModels = [
            ...new Set([...baseModels, ...curBaseModels]),
          ];
          dispatch(tabActions.setBaseModels(updatedBaseModels));
        }

        setModelIsSaving(false);
        setSuccessMessage(SAVED_SUCCESS_MESSAGE);
        setSavedModel(modelId);
      }
    } catch (err) {
      setModelIsSaving(false);
      console.log(err);
      setErrorMessage(err.message);
    }
  };

  // const updateModelHandler = async (e) => {
  //   console.log("UPD");
  //   const data = await getModelData(modelData?.id);

  //   const newVerison = modelVersions.filter(
  //     (version) =>
  //       !modelData.modelVersions.some(
  //         (oldVersions) => version.id === oldVersions.id
  //       )
  //   );
  //   console.log(newVerison);
  //   if (!newVerison.length) {
  //     console.log("NO UPDATEDS");
  //     return;
  //   }

  //   modelVersions = [...newVerison, ...modelData.modelVersions];
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
      isValid: false,
      errorMessage: "",
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
        isValid: true,
        errorMessage: "",
      },
      {
        type: "text",
        id: `set-value-${Date.now()}`,
        name: "set-value",
        placeholder: tagSetsInputs[0][1].placeholder,
        value: "",
        isValid: true,
        errorMessage: "",
      },
    ]);

    setTagSetsInputs(newFields);
  };

  const subCatHandler = (e, isValid) => {
    setSubCatInputs((prevState) => {
      const newState = [...prevState];

      const curIndex = newState.findIndex((imageId) => {
        return imageId.id + "" === e.target.id;
      });

      // const { isValid, errorMessage } = validateInput(
      //   {
      //     required: true,
      //     maxLength: CATEGORY_NAME_MAX_LENGTH,
      //   },
      //   e.target.value
      // );

      newState[curIndex].value = e.target.value;
      newState[curIndex].isValid = isValid;
      // newState[curIndex].errorMessage = errorMessage;

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
        // isValid={sub.isValid}
        // error={sub.errorMessage}
        // showError={showErrorMessage}
        // onChange={(e, isValid) => {
        //   setMainInput({ value: e.target.value, isValid });
        // }}
        validation={{
          required: true,
          maxLength: CATEGORY_NAME_MAX_LENGTH,
        }}
        showError={showErrorMessage}
      />
    );
  });

  const tagSetsHandler = (e, isValid) => {
    setTagSetsInputs((prevState) => {
      const newState = [...prevState];
      const curSetNameIndex = newState.findIndex((imageId) => {
        return imageId[0].id + "" === e.target.id;
      });
      const curSetTagsIndex = newState.findIndex((imageId) => {
        return imageId[1].id + "" === e.target.id;
      });

      // const { isValid, errorMessage } = validateInput(
      //   {
      //     maxLength:
      //       curSetNameIndex !== -1 ? NAME_MAX_LENGTH : TRIGER_WORDS_MAX_LENGTH,
      //   },
      //   e.target.value
      // );

      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0].value = e.target.value;
        newState[curSetNameIndex][0].isValid = isValid;
        // newState[curSetNameIndex][0].errorMessage = errorMessage;
      }
      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1].value = e.target.value;
        newState[curSetTagsIndex][1].isValid = isValid;
        // newState[curSetTagsIndex][1].errorMessage = errorMessage;
      }
      // newState[curIndex] = [];

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
          isValid={tagSet[0].isValid}
          // error={tagSet[0].errorMessage}
          showError={showErrorMessage}
          validation={{
            maxLength: NAME_MAX_LENGTH,
          }}
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows="5"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
          isValid={tagSet[1].isValid}
          error={tagSet[1].errorMessage}
          showError={showErrorMessage}
          validation={{
            maxLength: TRIGER_WORDS_MAX_LENGTH,
          }}
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

      newState[curIndex].value = e.target.checked;

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
      {/* <div>{modelIsSaving ? "Saving..." : "Done"}</div> */}
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
            value={titleInput.value}
            onChange={(e, isValid) => {
              setTitleInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Textarea
            label="Description"
            name="description"
            rows="5"
            placeholder="Description"
            value={descriptionInput.value}
            onChange={(e, isValid) => {
              setDescriptionInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: DESCRIPTION_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
          <Checkbox
            id="nsfw"
            name="nsfw"
            checked={nsfwInput}
            label="NSFW"
            onChange={(e) => {
              setNsfwInput(e.target.checked);
            }}
          />
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
          {true && (
            <Input
              name="id"
              label="Model ID or URL"
              type="text"
              placeholder="Model ID or URL"
              value={idInput.value}
              input={{ hidden: modelData ? true : false }}
              onChange={(e, isValid) => {
                setIdInput({ value: e.target.value, isValid });
              }}
              readOnly={!!modelData}
              validation={{
                required: true,
                maxLength: TITLE_MAX_LENGTH,
              }}
              showError={showErrorMessage}
            />
          )}
          <Input
            name="main"
            type="text"
            label="Category"
            placeholder="Main category"
            value={mainInput.value}
            onChange={(e, isValid) => {
              setMainInput({ value: e.target.value, isValid });
            }}
            readOnly={!!modelData}
            validation={{
              required: true,
              maxLength: CATEGORY_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
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
            <FieldCategory title="Trigger words">
              <Input
                label="Activation tag"
                name="main-tag"
                type="text"
                placeholder="<lora:activation tag:1>"
                value={mainTagInput.value}
                onChange={(e, isValid) => {
                  setMainTagInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Textarea
                // label="Triger word"
                name="triger"
                type="text"
                placeholder="Trigger word"
                textarea={{ hidden: true }}
                value={trigerInput.value}
                onChange={(e, isValid) => {
                  setTrigerInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: TRIGER_WORDS_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Textarea
                label="Helper words"
                name="helper-tags"
                rows="5"
                placeholder="Helper words"
                value={helperTagsInput.value}
                onChange={(e, isValid) => {
                  setHelperTagsInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: TRIGER_WORDS_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              ></Textarea>
              <Textarea
                label="Negative words"
                name="negative-tags"
                rows="5"
                placeholder="Negative words"
                value={negativeTagsInput.value}
                onChange={(e, isValid) => {
                  setNegativeTagsInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: TRIGER_WORDS_MAX_LENGTH,
                }}
                showError={showErrorMessage}
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
            </FieldCategory>
            <FieldCategory title="Info">
              <Input
                name="src"
                type="text"
                placeholder="src"
                value={srcInput.value}
                input={{ hidden: true }}
                onChange={(e, isValid) => {
                  setSrcInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                // showError={showErrorMessage}
              />
              <Input
                label="File"
                name="file-name"
                type="text"
                placeholder="File name"
                value={fileNameInput.value}
                onChange={(e, isValid) => {
                  setFileNameInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <div>
                <span className={classes["weight__label"]}>Weight</span>
                <div className={classes.weight}>
                  <InputNumber
                    name="minWeight"
                    type="number"
                    step={0.1}
                    placeholder="Min"
                    value={minWeightInput.value}
                    onChange={(e, isValid) => {
                      setMinWeightInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      number: true,
                      maxLength: NUMBER_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <InputNumber
                    name="maxWeight"
                    type="number"
                    step={0.1}
                    placeholder="Max"
                    value={maxWeightInput.value}
                    onChange={(e, isValid) => {
                      setMaxWeightInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      number: true,
                      maxLength: NUMBER_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <InputNumber
                    name="weight"
                    type="number"
                    step={0.1}
                    placeholder="Best"
                    value={weightInput.value}
                    onChange={(e, isValid) => {
                      setWeightInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      number: true,
                      maxLength: NUMBER_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                </div>
              </div>
              <Input
                label="Image size"
                name="size"
                type="text"
                placeholder="Image size"
                value={sizetInput.value}
                onChange={(e, isValid) => {
                  setSizeInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: TITLE_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />

              {modelTypeInput === "checkpointssss" && (
                <>
                  <Input
                    label="Sampling method"
                    name="sampler"
                    type="text"
                    placeholder="Sampling method"
                    value={samplerInput.value}
                    onChange={(e, isValid) => {
                      setSamplerInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      maxLength: NAME_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <Input
                    label="Sampling steps"
                    name="steps"
                    type="text"
                    placeholder="Sampling steps"
                    value={stepsInput.value}
                    onChange={(e, isValid) => {
                      setStepsInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      maxLength: NUMBER_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />

                  <Input
                    label="CFG Scale"
                    name="cfgScale"
                    type="text"
                    placeholder="CFG Scale"
                    value={cfgScaleInput.value}
                    onChange={(e, isValid) => {
                      setCfgScaleInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      maxLength: NUMBER_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <Input
                    label="Upscaler"
                    name="hiresUpscaler"
                    type="text"
                    placeholder="Upscaler"
                    value={hiresUpscalerInput.value}
                    onChange={(e, isValid) => {
                      setHiresUpscalerInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      maxLength: NAME_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <Input
                    label="Upscale by"
                    name="hiresUpscaleBy"
                    type="text"
                    placeholder="Upscale by"
                    value={hiresUpscaleInput.value}
                    onChange={(e, isValid) => {
                      setHiresUpscaleInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      maxLength: NAME_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <Input
                    label="Hires steps"
                    name="hiresUpscaleSteps"
                    type="text"
                    placeholder="Hires steps"
                    value={hiresUpscaleStepsInput.value}
                    onChange={(e, isValid) => {
                      setHiresUpscaleStepsInput({
                        value: e.target.value,
                        isValid,
                      });
                    }}
                    validation={{
                      maxLength: NAME_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <Input
                    label="Denoising strength"
                    name="denoisingStrength"
                    type="text"
                    placeholder="Denoising strength"
                    value={denoisingStrengthtInput.value}
                    onChange={(e, isValid) => {
                      setDenoisingStrengthInput({
                        value: e.target.value,
                        isValid,
                      });
                    }}
                    validation={{
                      maxLength: NAME_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                  <Input
                    label="VAE"
                    name="vae"
                    type="text"
                    placeholder="VAE"
                    value={vaeInput.value}
                    onChange={(e, isValid) => {
                      setVaeInput({ value: e.target.value, isValid });
                    }}
                    validation={{
                      maxLength: NAME_MAX_LENGTH,
                    }}
                    showError={showErrorMessage}
                  />
                </>
              )}
            </FieldCategory>
          </>
        )}
      </div>
      {(errorMessage || successMessage) && (
        <div className={classes.status}>
          {errorMessage && (
            <ErrorMessage className={classes["status__message"]}>
              {errorMessage}
            </ErrorMessage>
          )}
          {successMessage && (
            <SuccessMessage className={classes["status__message"]}>
              {successMessage}
            </SuccessMessage>
          )}
          {successMessage && !modelData && (
            <>
              {"-"}
              <Link to={`/model/${savedModel}`} className={classes.link}>
                Show model
              </Link>
            </>
          )}
        </div>
      )}
      <Buttton
        type="submit"
        disabled={modelIsSaving}
        className={classes.submit}
      >
        {!modelIsSaving ? "Save" : <Spinner size="small" />}
      </Buttton>
    </form>
  );
};

export default UpdateModelForm;
