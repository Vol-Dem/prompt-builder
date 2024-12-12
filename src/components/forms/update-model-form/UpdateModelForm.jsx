import React, { useEffect, useMemo, useState } from "react";
import classes from "./UpdateModelForm.module.scss";
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  writeBatch,
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
import { clearFileExtension, splitTags } from "../../../utils/generalUtils";
import { Link } from "react-router-dom";
import Spinner from "../../ui/Spinner";
import ComboSelect from "../../ui/ComboSelect";
import {
  CATEGORY_NAME_MAX_LENGTH,
  DEF_ERROR_MESSAGE,
  DEF_INPUT_ERROR_MESSAGE,
  DESCRIPTION_MAX_LENGTH,
  EXISTS_ERROR_MESSAGE,
  GUIDE_STEP_EDIT_DEFAULT,
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
import { tabActions } from "../../../store/tabs";
import ButtonTertiary from "../../ui/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import { getFunctions, httpsCallable } from "firebase/functions";
import { modelActions } from "../../../store/model";
// import ExtendedInput from "../../ui/ExtendedInput";
import EditDefaultGuide from "../../ui/guide/edit/EditDefaultGuide";

const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);

const SUBCATEGORIES_MAX_AMOUNT = 8;
const TAGSETS_MAX_AMOUNT = 20;

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
  query: "",
  selected: { id: null, name: "" },
  isValid: false,
  errorMessage: "This field is required",
};

const UpdateModelForm = ({ modelData, id }) => {
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
  const [mainCategoryQuery, setMainCategoryQuery] = useState("");
  const [mainCategorySelected, setMainCategorySelected] = useState({
    name: modelData?.main || "",
    id: modelData?.main || "",
    isValid: !!modelData?.main,
  });
  const [subCategoryQuery, setSubCategoryQuery] = useState("");
  const [subCategorySelected, setSubCategorySelected] = useState({});

  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const curBaseModels = useSelector((state) => state.tabs.baseModels);
  const guideStep = useSelector((state) => state.guide.edit.step);
  const guideIsActive = useSelector((state) => state.guide.active);
  const dispatch = useDispatch();

  // console.log(categories);
  // console.log(mainCategorySelected);
  // const mainCategoryOptions = categories[modelTypeInput]?.filter((category) =>
  //   category.name.toLowerCase().includes(mainCategoryQuery.toLowerCase())
  // );

  const mainCategoryOptions = useMemo(() => {
    return !modelTypeInput
      ? []
      : categories[modelTypeInput]?.filter((category) =>
          category.name.toLowerCase().includes(mainCategoryQuery.toLowerCase())
        );
  }, [categories, modelTypeInput, mainCategoryQuery]);

  const subCategoryOptions =
    categories[modelTypeInput]
      .find((category) => category.name === mainCategorySelected.name)
      ?.subcategories?.filter((subcategory) =>
        subcategory.name.toLowerCase().includes(subCategoryQuery.toLowerCase())
      ) || [];

  useEffect(() => {}, []);

  const selectMainCategoryHandler = (value, isValid, errorMessage) => {
    setMainCategorySelected({ ...value, isValid, errorMessage });
    setSubCategorySelected({});
  };

  useEffect(() => {
    if (!modelData) return;
    const versionStatusInputData = Object.values(
      modelData?.modelVersionsCustomData
    )
      ?.sort((a, b) => a?.index - b?.index)
      .map((version, i) => {
        return {
          type: "checkbox",
          id: version.versionId + "in",
          name: version.versionName,
          label: version.name,
          value: version.downloadStatus,
        };
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
        query: subData?.name || subId || "",
        selected: { id: subData.id, name: subData.name },
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
    if (!id) {
      return;
    }
    let curId = id?.toLowerCase();
    let mainIdExists;

    //Check if category id is exists
    mainIdExists = categoriesData?.find(
      (category) => category.id?.toLowerCase() === curId
    );

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
      console.log(mainCategorySelected);
      console.log(subCatInputs);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false
      );
      const subcatsIsValid = !!subCatInputs.find(
        (input) => input.isValid === true
      );
      // const subcatsIsValid = !!subCatInputs.find(
      //   (input) => input.isValid === true
      // );

      const mainInputsIsNotValid =
        !idInput.isValid || !mainCategorySelected.isValid || !subcatsIsValid;
      // !idInput.isValid || !mainInput.isValid || !subcatsIsValid;

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

      if (
        subCatInputs.length > SUBCATEGORIES_MAX_AMOUNT ||
        tagSetsInputs.length > TAGSETS_MAX_AMOUNT ||
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

      setModelIsSaving(true);

      const formdata = new FormData(e.target);

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
      // const main = formdata.get("main")?.trim().toLowerCase();
      const main = mainCategorySelected.name;

      // const subData = formdata.getAll("sub").filter(Boolean);
      // const sub = subData.map((el) => el?.trim());
      // console.log(subCatInputs);
      const sub = subCatInputs.map((el) => el?.selected?.name?.trim());
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

      // const modelSnap = await getDoc(modelsRef);
      const modelsPrevRefSnap = await getDoc(modelsPrevRef);

      // Throw error if user try to add existing model using new model form
      // if (modelSnap.exists() && modelsPrevRefSnap.exists() && !modelData) {
      if (modelsPrevRefSnap.exists() && !modelData) {
        throw new Error(EXISTS_ERROR_MESSAGE);
      } else {
        if (!modelData) {
          //Upload model to database
          const updateModel = httpsCallable(functions, "updateModelCall");

          updateModel({ id: modelData?.id || modelId });
          // const saveModelRes = await updateModel({
          //   id: modelData?.id || modelId,
          // });
          // const saveModelResData = saveModelRes.data;

          // if (!saveModelResData.modelId) {
          //   throw new Error("Failed to upload");
          // }

          // const modelDefDataRef = doc(firestore, "models", `${modelId}`);

          // const docSnap = await getDoc(modelDefDataRef);

          // if (docSnap.exists()) {
          //   data = docSnap.data();
          //   modelVersions = data?.modelVersions;
          // }

          const responseCiv = await fetch(
            `https://civitai.com/api/v1/models/${modelId}`
          );

          data = await responseCiv.json();
          modelVersions = data?.modelVersions;
        } else {
          data = modelData.data;
          modelVersions = data?.modelVersions.filter((version) =>
            Object.keys(modelData?.modelVersionsCustomData).includes(
              `${version.id}`
            )
          );
        }

        // console.log(data);

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
            fileName && data?.type === "LORA" ? `<lora:${fileName}:1>` : "";

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

        const previewImgDefault = modelVersions[0]?.images[0]?.url || "";

        const previewImg = activePreviewImg || previewImgDefault;

        const fileNames = modelVersions?.flatMap((version) => {
          if (version.hasOwnProperty("files") && version?.files) {
            return [
              ...new Set(
                version.files
                  .filter((file) => file?.type === "Model")
                  .map((file) => clearFileExtension(file?.name).toLowerCase())
              ),
            ];
          }
          return [];
        });

        const hashes = modelVersions
          ?.flatMap((version) => {
            if (version.hasOwnProperty("files") && version?.files) {
              return version?.files
                .filter((file) => file?.type === "Model")
                .flatMap((file) => Object.values(file?.hashes).filter(Boolean))
                .map((hash) => hash.toLowerCase());
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

        const baseModels = [
          ...new Set(
            modelVersions?.flatMap((version) => version?.baseModel || [])
          ),
        ];

        // Get a new write batch
        const batch = writeBatch(firestore);

        let newCategory = false;
        let newSubcategory = false;
        let newBaseModel = false;

        // const { mainId, subIds } = await runTransaction(
        //   firestore,
        //   async (transaction) => {
        // const sfDoc = await transaction.get(userRef);

        // const categories = sfDoc?.data()?.categoriesById || {};
        const curUserBaseModels = curBaseModels;

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

        let updatedCategories;
        let mainId;
        let subIds;
        const mainCategoryData = categories[modelType]?.find(
          // (category) => category.name === main
          (category) => category.name?.toLowerCase() === main?.toLowerCase()
        );

        if (!mainCategoryData) {
          newCategory = true;
          const currCategories = categories[modelType] || [];
          mainId = createCategoryId(main, categories[modelType]);
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
              (oldSucategories) =>
                oldSucategories.name?.toLowerCase() ===
                subcategory?.toLowerCase()
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

        if (newBaseModel || newCategory || newSubcategory) {
          // if (false) {
          if (!categories) {
            batch.set(
              userRef,
              {
                categoriesById: { [modelType]: updatedCategories },
                baseModels: baseModels,
              },
              { merge: true }
            );
          } else {
            batch.update(
              userRef,
              {
                [categoryField]: updatedCategories,
                baseModels: arrayUnion(...baseModels),
              },
              { merge: true }
            );
          }
        }
        //     return { mainId, subIds };
        //   }
        // );

        let createdAt;
        if (modelData?.createdAt) {
          createdAt = Number.isFinite(modelData?.createdAt)
            ? modelData?.createdAt
            : Date.parse(modelData?.createdAt);
        } else {
          createdAt = Date.parse(modelData?.downloadedAt) || Date.now();
        }

        const modelInfo = {
          id: modelData?.id || +modelId,
          versionIds,
          modelType,
          main: mainId,
          sub: subIds,
          name: modelName || data.name,
          mainTag,
          nsfw: nsfwInput || false,
          src: "civitai.com",
          defaultCustomData: {
            type: data?.type || "",
            description: !!modelData ? description : data?.description,
            ...(tagSetsData?.length && {
              tagSetsData,
            }),
            ...(weight && {
              weight,
            }),
            ...(minWeight && {
              minWeight,
            }),
            ...(maxWeight && {
              maxWeight,
            }),
            ...(size && {
              size,
            }),
            ...(fileName && {
              fileName,
            }),
            ...(helperTags?.length && {
              helperTags,
            }),
            ...(negativeTags?.length && {
              negativeTags,
            }),
            ...(modelType === "checkpoint" && {
              ...(steps && {
                steps,
              }),
              ...(sampler && {
                sampler,
              }),
              ...(cfgScale && {
                cfgScale,
              }),
              ...(hiresUpscaler && {
                hiresUpscaler,
              }),
              ...(hiresUpscaleBy && {
                hiresUpscaleBy,
              }),
              ...(hiresUpscaleSteps && {
                hiresUpscaleSteps,
              }),
              ...(denoisingStrength && {
                denoisingStrength,
              }),
              ...(vae && {
                vae,
              }),
            }),
          },
          modelVersionsCustomData,
          savedImages: modelData?.savedImages || {},
          updatedAt: new Date().toISOString(),
          createdAt,
        };

        let previewModelVersionsCustomData = {};

        Object.values(modelVersionsCustomData).forEach((version) => {
          if (version?.versionId) {
            previewModelVersionsCustomData[version.versionId] = {
              size: version?.size || "",
              weight: version?.weight || null,
              minWeight: version?.minWeight || null,
              maxWeight: version?.maxWeight || null,
              fileName: version?.fileName || "",
              name: version?.name || "",
              mainTag: version?.mainTag || "",
              index: version?.index || null,
              downloadStatus: version?.downloadStatus || false,
              trainedWords: version?.trainedWords || [],
              defActTag: version?.defActTag || "",
              versionId: version?.versionId || null,
              defFileName: version?.defFileName || "",
              versionImageUrl: version?.versionImageUrl || "",
              baseModel: version?.baseModel || "",
              versionName: version?.versionName || "",
            };
          }
        });

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
          authorTags: data.tags || [],
          modelVersionsCustomData: previewModelVersionsCustomData,
          updatedAt: new Date().toISOString(),
          createdAt,
        };

        const curPrevData = modelsPrevRefSnap.data() || {};

        batch.set(modelsRef, modelInfo);

        batch.set(modelsPrevRef, { ...curPrevData, ...loraPrevData });

        // Commit the batch
        await batch.commit();

        // await setDoc(modelsRef, modelInfo);

        // const curPrevData = modelsPrevRefSnap.data() || {};

        // await setDoc(modelsPrevRef, { ...curPrevData, ...loraPrevData });

        if (newBaseModel) {
          const updatedBaseModels = [
            ...new Set([...baseModels, ...curBaseModels]),
          ];
          dispatch(tabActions.setBaseModels(updatedBaseModels));
        }

        setModelIsSaving(false);
        setSuccessMessage(SAVED_SUCCESS_MESSAGE);
        setSavedModel(modelId);
        if (!modelData) {
          setIdInput({
            value: "",
            isValid: false,
          });
          setMainInput({
            value: "",
            isValid: false,
          });
          setSubCatInputs([
            {
              type: "text",
              id: "subcat-def",
              name: "sub",
              placeholder: "Subcategory",
              value: "",
              query: "",
              selected: { id: null, name: "" },
              isValid: false,
              errorMessage: "This field is required",
            },
          ]);
          setShowErrorMessage(false);
        }
      }
    } catch (err) {
      console.log(err);
      setModelIsSaving(false);
      if (
        err.message === EXISTS_ERROR_MESSAGE ||
        err.message === DEF_INPUT_ERROR_MESSAGE ||
        err.message === OFFLINE_ERROR_MESSAGE
      ) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(DEF_ERROR_MESSAGE);
      }
    }
  };

  const addSubHandler = () => {
    if (subCatInputs.length >= SUBCATEGORIES_MAX_AMOUNT) return;
    const newFields = [...subCatInputs];
    newFields.push({
      type: "text",
      id: Date.now(),
      name: "sub",
      placeholder: "Subcategory",
      value: "",
      query: "",
      selected: { id: null, name: "" },
      isValid: false,
      errorMessage: "",
    });

    setSubCatInputs(newFields);
  };

  const addtagSetHandler = () => {
    if (tagSetsInputs.length >= TAGSETS_MAX_AMOUNT) return;
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

  // const subCatHandler = (e, isValid) => {
  //   setSubCatInputs((prevState) => {
  //     const newState = [...prevState];

  //     const curIndex = newState.findIndex((imageId) => {
  //       return imageId.id + "" === e.target.id;
  //     });
  // if(curIndex < 0) return

  //     newState[curIndex].value = e.target.value;
  //     newState[curIndex].isValid = isValid;

  //     return newState;
  //   });
  // };
  // const subCatQueryHandler = (value, isValid, errorMessage, id) => {
  //   if (!id) return;
  //   setSubCatInputs((prevState) => {
  //     const newState = [...prevState];

  //     const curIndex = newState.findIndex((imageId) => {
  //       return imageId.id + "" === id;
  //     });
  //     console.log(newState);
  //     console.log(curIndex);
  //     console.log(id);
  //     if (curIndex < 0) return prevState;

  //     newState[curIndex].query = value;
  //     newState[curIndex].isValid = isValid;
  //     newState[curIndex].errorMessage = errorMessage;
  //     console.log(newState);
  //     return newState;
  //   });
  // };

  const subCatSelectHandler = (value, isValid, errorMessage, id) => {
    setSubCatInputs((prevState) => {
      const newState = [...prevState];

      const curIndex = newState.findIndex((imageId) => {
        return imageId.id + "" === id + "";
      });
      // console.log(newState);
      // console.log(curIndex);
      // console.log(id);
      if (curIndex < 0) return prevState;

      newState[curIndex].selected = value;
      newState[curIndex].isValid = isValid;
      newState[curIndex].errorMessage = errorMessage;
      // console.log(newState);
      return newState;
    });
  };

  const deleteSubcategoryInputHandler = (index, e) => {
    setSubCatInputs((prevState) => {
      return prevState.toSpliced(index, 1);
    });
  };

  const subCatHtml = subCatInputs.map((sub, i) => {
    return (
      <div key={sub.id} className={classes["subcategory"]}>
        <ComboSelect
          id={sub.id}
          optionsData={subCategoryOptions}
          query={subCategoryQuery}
          setQuery={setSubCategoryQuery}
          setSelected={subCatSelectHandler}
          selected={sub.selected}
          placeholder="Subcategory"
          validation={{
            required: true,
            maxLength: CATEGORY_NAME_MAX_LENGTH,
          }}
          showError={showErrorMessage}
        />
        {i !== 0 && (
          <ButtonTertiary
            type="button"
            className={classes["input__btn-del"]}
            onClick={deleteSubcategoryInputHandler.bind(null, i)}
          >
            <CrossSvg />
          </ButtonTertiary>
        )}
      </div>
    );
  });
  // const subCatHtml = subCatInputs.map((sub, i) => {
  //   return (
  //     <div key={sub.id} className={classes["subcategory"]}>
  //       <Input
  //         key={sub.id}
  //         id={sub.id}
  //         name={sub.name}
  //         type={sub.type}
  //         placeholder={sub.placeholder}
  //         onChange={subCatHandler}
  //         value={sub.value}
  //         className={classes["subcategory__input"]}
  //         validation={{
  //           required: true,
  //           maxLength: CATEGORY_NAME_MAX_LENGTH,
  //         }}
  //         showError={showErrorMessage}
  //       />
  //       {i !== 0 && (
  //         <ButtonTertiary
  //           type="button"
  //           className={classes["input__btn-del"]}
  //           onClick={deleteSubcategoryInputHandler.bind(null, i)}
  //         >
  //           <CrossSvg />
  //         </ButtonTertiary>
  //       )}
  //     </div>
  //   );
  // });

  const deleteTagsetInputHandler = (index, e) => {
    setTagSetsInputs((prevState) => {
      return prevState.toSpliced(index, 1);
    });
  };

  const tagSetsHandler = (e, isValid) => {
    setTagSetsInputs((prevState) => {
      const newState = [...prevState];
      const curSetNameIndex = newState.findIndex((imageId) => {
        return imageId[0].id + "" === e.target.id;
      });
      const curSetTagsIndex = newState.findIndex((imageId) => {
        return imageId[1].id + "" === e.target.id;
      });

      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0].value = e.target.value;
        newState[curSetNameIndex][0].isValid = isValid;
      }
      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1].value = e.target.value;
        newState[curSetTagsIndex][1].isValid = isValid;
      }

      return newState;
    });
  };

  const tagSetsHtml = tagSetsInputs.map((tagSet, i) => {
    return (
      <div key={tagSet[0].id} className={classes["tagset"]}>
        <div className={classes["tagset__header"]}>
          <span className={classes["tagset__title"]}>{`Tagset ${i + 1}`}</span>{" "}
          {i !== 0 && (
            <ButtonTertiary
              type="button"
              className={classes["input__btn-del"]}
              onClick={deleteTagsetInputHandler.bind(null, i)}
            >
              <CrossSvg />
            </ButtonTertiary>
          )}
        </div>
        <Input
          id={tagSet[0].id}
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[0].value}
          isValid={tagSet[0].isValid}
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
      {modelData && (
        <FieldCategory>
          <Input
            id="title"
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
            id="description"
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
          {modelData && (
            <Fieldset legend="Model versions" className={classes.versions}>
              {versionStatusHtml}
            </Fieldset>
          )}
        </FieldCategory>
      )}
      {modelData && (
        <h3 className={classes.subtitle}>Default data for all versions</h3>
      )}
      <div
        className={`${classes.fields} ${
          modelData && guideIsActive && guideStep === GUIDE_STEP_EDIT_DEFAULT
            ? classes["fields--guide"]
            : ""
        }`}
      >
        {modelData && <EditDefaultGuide />}
        <FieldCategory title={modelData ? "Categories" : ""}>
          <Select
            label="Type"
            name="type"
            id="type"
            // id={id}
            selected={modelTypeInput}
            onChange={(value) => {
              setModelTypeInput(value);
            }}
            options={typeSelectOption}
          />
          {true && (
            <Input
              id="id"
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
          {/* <Input
            id="main"
            name="main"
            type="text"
            label="Category"
            placeholder="Main category"
            value={mainInput.value}
            onChange={(e, isValid, errorMessage) => {
              setMainInput({ value: e.target.value, isValid, errorMessage });
            }}
            readOnly={!!modelData}
            validation={{
              required: true,
              maxLength: CATEGORY_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
            errorMessage={mainInput.errorMessage}
          /> */}
          <ComboSelect
            optionsData={mainCategoryOptions}
            query={mainCategoryQuery}
            setQuery={setMainCategoryQuery}
            setSelected={selectMainCategoryHandler}
            selected={mainCategorySelected}
            placeholder="Main category"
            validation={{
              required: true,
              maxLength: CATEGORY_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Fieldset legend="Subcategories">
            {subCatHtml}
            {subCatInputs?.length < SUBCATEGORIES_MAX_AMOUNT && (
              <ButttonSecondary
                type="button"
                id="sub"
                onClick={addSubHandler}
                className={classes["btn-secondary"]}
              >
                + add subcategory
              </ButttonSecondary>
            )}
          </Fieldset>
          {/* <ComboSelect
            optionsData={subCategoryOptions}
            query={subCategoryQuery}
            setQuery={setSubCategoryQuery}
            setSelected={setSubCategorySelected}
            selected={subCategorySelected}
            placeholder="Subcategory"
            validation={{
              required: true,
              maxLength: CATEGORY_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          /> */}
        </FieldCategory>
        {modelData && (
          <>
            <FieldCategory title="Trigger words">
              <Input
                label="Activation tag"
                id="main-tag"
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
                id="triger"
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
                id="helper-tags"
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
                id="negative-tags"
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
                {tagSetsInputs?.length < TAGSETS_MAX_AMOUNT && (
                  <ButttonSecondary
                    type="button"
                    onClick={addtagSetHandler}
                    disabled={modelIsSaving}
                    className={classes["btn-secondary"]}
                  >
                    + add new set
                  </ButttonSecondary>
                )}
              </Fieldset>
            </FieldCategory>
            <FieldCategory title="Info">
              <Input
                id="src"
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
              />
              <Input
                label="File"
                id="file-name"
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
                    id="minWeight"
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
                    id="maxWeight"
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
                    id="weight"
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
                id="size"
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
                    id="sampler"
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
                    id="steps"
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
                    id="cfgScale"
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
                    id="hiresUpscaler"
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
                    id="hiresUpscaleBy"
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
                    id="hiresUpscaleSteps"
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
                    id="denoisingStrength"
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
                    id="vae"
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
      <div className={classes["submit-container"]}>
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
                <Link
                  to={`/models/${savedModel}`}
                  className={classes.link}
                  onClick={() => {
                    dispatch(modelActions.resetModelData());
                  }}
                >
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
      </div>
    </form>
  );
};

export default UpdateModelForm;
