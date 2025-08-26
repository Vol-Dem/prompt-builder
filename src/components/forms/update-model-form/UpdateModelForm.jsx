import { useEffect, useMemo, useState } from "react";
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
import {
  clearFileExtension,
  createCategoryId,
  createTagSetsInputData,
  handleErrors,
  parseModelIds,
  splitTags,
  throwCustomError,
  transformSrcPreview,
} from "../../../utils/generalUtils";
import { Link } from "react-router-dom";
import Spinner from "../../ui/Spinner";
import ComboSelect from "../../ui/ComboSelect";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_DESCRIPTION_MAX_LENGTH,
  ERROR_MESSAGE_EXISTS,
  GUIDE_STEP_EDIT_DEFAULT,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
  VALIDATION_TITLE_MAX_LENGTH,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
  MODEL_TYPES,
  URL_CIV_MODELS,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  DEFAULT_DATA_TAGSETS_INPUT,
  ERROR_MESSAGE_INVALID_DATA,
  SETTINGS_MODEL_TYPE_UNKNOWN,
  SETTINGS_MODEL_TYPE_DEF,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  ERROR_MESSAGE_INVALID_MODEL_ID,
} from "../../../variables/constants";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import { tabActions } from "../../../store/tabs";
import ButtonTertiary from "../../ui/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import { getFunctions, httpsCallable } from "firebase/functions";
import { modelActions } from "../../../store/model";
import EditDefaultGuide from "../../ui/guide/edit/EditDefaultGuide";
import { AnimatePresence, motion } from "framer-motion";

const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);

const SUBCATEGORIES_MAX_AMOUNT = 8;
const TAGSETS_MAX_AMOUNT = 20;
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

const UpdateModelForm = ({
  modelData,
  id,
  newModelId,
  newModelVersionId,
  newModelType,
  onSave,
  className,
}) => {
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [modelTypeInput, setModelTypeInput] = useState(
    modelData?.modelType || SETTINGS_MODEL_TYPE_DEF
  );
  const srcInput = {
    value: "civitai.com",
    isValid: true,
  };
  const [nsfwInput, setNsfwInput] = useState(modelData?.nsfw);
  const [titleInput, setTitleInput] = useState({
    value: modelData?.name || "",
    isValid: true,
  });
  const [descriptionInput, setDescriptionInput] = useState({
    value:
      modelData?.defaultCustomData?.description ||
      modelData?.data?.description ||
      "",
    isValid: true,
  });
  const [idInput, setIdInput] = useState({
    value: modelData?.id || newModelId || "",
    isValid: modelData?.id || newModelId ? true : false,
  });
  const [versionsDownloadStatus, setVersionsDownloadStatus] = useState([]);
  const [hashtagsInput, setHashtagsInput] = useState({
    value: modelData?.hashtags?.filter(Boolean)?.length
      ? modelData?.hashtags.join(", ")
      : modelData?.data?.tags.join(", ") || "",
    isValid: true,
  });
  const [subCatInputs, setSubCatInputs] = useState([]);
  const [tagSetsInputs, setTagSetsInputs] = useState([]);
  const [savedModel, setSavedModel] = useState(null);
  const [mainCategoryQuery, setMainCategoryQuery] = useState("");
  const [mainCategorySelected, setMainCategorySelected] = useState({
    name: modelData?.main || "",
    id: modelData?.main || "",
    isValid: !!modelData?.main,
  });
  const [subCategoryQuery, setSubCategoryQuery] = useState("");
  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const curBaseModels = useSelector((state) => state.tabs.baseModels);
  const guideStep = useSelector((state) => state.guide.edit.step);
  const guideIsActive = useSelector((state) => state.guide.active);
  const curModel = useSelector((state) => state.model.model);
  const dispatch = useDispatch();

  const mainCategoryOptions = useMemo(() => {
    return !!modelTypeInput && categories?.hasOwnProperty(modelTypeInput)
      ? categories[modelTypeInput]?.filter((category) =>
          category.name
            .toLowerCase()
            .includes(mainCategoryQuery.trim().toLowerCase())
        )
      : [];
  }, [categories, modelTypeInput, mainCategoryQuery]);

  const subCategoryOptions = categories?.hasOwnProperty(modelTypeInput)
    ? categories[modelTypeInput]
        .find((category) => category.name === mainCategorySelected.name)
        ?.subcategories?.filter((subcategory) =>
          subcategory.name
            .toLowerCase()
            .includes(subCategoryQuery.trim().toLowerCase())
        )
    : [];

  const selectMainCategoryHandler = (value, isValid, errorMessage) => {
    setMainCategorySelected({ ...value, isValid, errorMessage });
    setSubCatInputs([
      { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
    ]);
  };

  useEffect(() => {
    if (!modelData) {
      setSubCatInputs([
        { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
      ]);

      if (newModelType) {
        const existedModelType = MODEL_TYPES.find((type) =>
          type.aliases.includes(newModelType.toLowerCase())
        )?.value;

        if (existedModelType) {
          setModelTypeInput(existedModelType);
        } else {
          setModelTypeInput(SETTINGS_MODEL_TYPE_UNKNOWN);
        }
      }
    }

    if (modelData) {
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

      const subCats = modelData.sub.flatMap((subId, i) => {
        const subData = categories[modelData.modelType]
          ?.find((category) => category.id === modelData.main)
          ?.subcategories?.find((sucategory) => sucategory.id === subId);

        if (!subData) {
          return [];
        }

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

      setMainCategorySelected({
        name: mainCategoryName || "",
        id: mainCategoryName ? modelData?.main : "",
        isValid: mainCategoryName ? true : false,
      });

      setTagSetsInputs(
        createTagSetsInputData(
          modelData?.defaultCustomData?.tagSetsData,
          DEFAULT_DATA_TAGSETS_INPUT
        )
      );
    }
  }, [modelData, categories, newModelType]);

  const saveModelHandler = async (e, update) => {
    let modelId;
    let modelVersionId;
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

      const mainInputsIsNotValid =
        !idInput.isValid || !mainCategorySelected.isValid || !subcatsIsValid;

      const baseInputsIsNotValid =
        !srcInput.isValid ||
        !titleInput.isValid ||
        !descriptionInput.isValid ||
        tagsetsIsNotValid ||
        !hashtagsInput.isValid;

      if (
        subCatInputs.length > SUBCATEGORIES_MAX_AMOUNT ||
        tagSetsInputs.length > TAGSETS_MAX_AMOUNT ||
        mainInputsIsNotValid ||
        (!!modelData && baseInputsIsNotValid)
      ) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
      }

      setModelIsSaving(true);

      const formdata = new FormData(e.target);

      const modelType = modelTypeInput;

      if (Number.isFinite(+idInput.value)) {
        modelId = +idInput.value;
      } else {
        [modelId, modelVersionId] = parseModelIds(idInput.value);
      }
      // console.log(modelId, modelVersionId);
      if (!modelId) {
        throwCustomError(ERROR_MESSAGE_INVALID_MODEL_ID);
      }

      if (newModelVersionId) {
        modelVersionId = newModelVersionId;
      }

      const modelName = titleInput.value.trim();
      // const description = descriptionInput.value.trim();

      const main = mainCategorySelected.name;
      const hashtags = hashtagsInput.value
        .split(",")
        .map((hashtag) => hashtag.trim())
        .filter(Boolean);
      const sub = [
        ...new Set(subCatInputs.map((el) => el?.selected?.name?.trim())),
      ].filter(Boolean);
      const mainTag = formdata.get("main-tag")?.trim() || "";
      const size = formdata.get("size")?.trim() || "";
      const fileName = formdata.get("file-name")?.trim() || "";

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

      const modelsPrevRefSnap = await getDoc(modelsPrevRef);

      // Throw error if user try to add existing model using new model form
      if (modelsPrevRefSnap.exists() && !modelData) {
        throwCustomError(ERROR_MESSAGE_EXISTS);
      } else {
        if (!modelData) {
          //Upload model to database
          const updateModel = httpsCallable(functions, "updateModelCall");

          const uploadResponse = await updateModel({
            id: modelData?.id || modelId,
          });

          if (uploadResponse?.error) {
            throw new Error(uploadResponse.error);
            // throwCustomError(ERROR_MESSAGE_UPLOAD_MODEL);
          }

          const responseCiv = await fetch(`${URL_CIV_MODELS}${modelId}`);

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

        if (data?.error) {
          throwCustomError(data.error);
        }
        if (!data?.id) {
          throwCustomError(ERROR_MESSAGE_INVALID_DATA);
        }

        let modelVersionsCustomData = modelData?.modelVersionsCustomData || {};

        modelVersions.forEach((version, i) => {
          const isSingle =
            !modelVersionId && !Object.keys(modelVersionsCustomData).length;
          let curVersionDlStatus;
          if (modelVersionId && modelVersionId === version.id) {
            curVersionDlStatus = true;
          } else {
            curVersionDlStatus = versionsDownloadStatus.find(
              (dlData) => Number.parseInt(dlData.id) === version.id
            )?.value;
          }

          const dlStatus =
            versionsDownloadStatus.length || modelVersionId === version.id
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
              versionImageUrl: version?.images ? version?.images[0]?.url : "",
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
              .images?.filter((img, i) => img.type === "image")[0]) ||
          "";

        const previewImgDefault = modelVersions[0]?.images[0] || "";

        const previewImgData = activePreviewImg || previewImgDefault;
        const { previewSrc } = transformSrcPreview(
          previewImgData?.url,
          SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
          previewImgData?.type
        );
        const previewImg = previewSrc;

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
            .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")
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

        let createdAt;
        if (modelData?.createdAt) {
          createdAt = Number.isFinite(modelData?.createdAt)
            ? modelData?.createdAt
            : Date.parse(modelData?.createdAt);
        } else {
          createdAt = Date.parse(modelData?.downloadedAt) || Date.now();
        }

        const modelInfo = {
          defaultCustomData: {},
          ...modelData,
          id: modelData?.id || +modelId,
          versionIds,
          modelType,
          main: mainId,
          sub: subIds,
          name: modelName || data.name,
          hashtags,
          mainTag,
          nsfw: nsfwInput || false,
          src: "civitai.com",
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
          imgType: previewImgData?.type || "",
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
          size,
          authorTags: hashtags?.length ? hashtags : data.tags,
          modelVersionsCustomData: previewModelVersionsCustomData,
          updatedAt: new Date().toISOString(),
          createdAt,
        };

        const curPrevData = modelsPrevRefSnap.data() || {};

        batch.set(modelsRef, modelInfo);

        batch.set(modelsPrevRef, { ...curPrevData, ...loraPrevData });

        // Commit the batch
        await batch.commit();

        if (newBaseModel) {
          const updatedBaseModels = [
            ...new Set([...baseModels, ...curBaseModels]),
          ];
          dispatch(tabActions.setBaseModels(updatedBaseModels));
        }

        setModelIsSaving(false);
        setShowErrorMessage(false);
        setSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
        setSavedModel(modelId);
        if (onSave) onSave(loraPrevData);
        if (!modelData) {
          setIdInput({
            value: newModelId || "",
            isValid: false,
          });
          setSubCatInputs([
            { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
          ]);
          setMainCategorySelected({});
        }
      }
    } catch (err) {
      // console.log(err);
      if (err.message === ERROR_MESSAGE_EXISTS) {
        setSavedModel(modelId);
      }
      setErrorMessage(handleErrors(err));
      setModelIsSaving(false);
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

  const subCatSelectHandler = (value, isValid, errorMessage, id) => {
    setSubCatInputs((prevState) => {
      const newState = [...prevState];

      const curIndex = newState.findIndex((imageId) => {
        return imageId.id + "" === id + "";
      });

      if (curIndex < 0) return prevState;

      newState[curIndex].selected = value;
      newState[curIndex].isValid = isValid;
      newState[curIndex].errorMessage = errorMessage;

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
      <motion.div
        layout
        key={sub.id}
        initial={i ? ANIMATIONS_FM_SLIDEOUT_INITIAL : null}
        animate={ANIMATIONS_FM_SLIDEOUT}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
        className={classes["subcategory"]}
      >
        <ComboSelect
          id={sub.id}
          optionsData={subCategoryOptions || []}
          query={subCategoryQuery}
          setQuery={setSubCategoryQuery}
          setSelected={subCatSelectHandler}
          selected={{ ...sub.selected }}
          placeholder="Subcategory"
          validation={{
            required: true,
            maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
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
      </motion.div>
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

  let typeSelectOption = MODEL_TYPES?.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  return (
    <form
      onSubmit={saveModelHandler}
      className={`${classes["form"]} ${className || ""}`}
    >
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
              maxLength: VALIDATION_TITLE_MAX_LENGTH,
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
              maxLength: VALIDATION_DESCRIPTION_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
          <Textarea
            label="Hashtags"
            id="hashtags"
            name="hashtags"
            rows="2"
            placeholder="Hashtags"
            value={hashtagsInput.value}
            onChange={(e, isValid) => {
              setHashtagsInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
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
      <div
        className={`${classes.fields} ${
          modelData ? classes["fields--edit"] : ""
        } ${
          modelData && guideIsActive && guideStep === GUIDE_STEP_EDIT_DEFAULT
            ? classes["fields--guide"]
            : ""
        }`}
      >
        {modelData && <EditDefaultGuide />}
        <FieldCategory>
          <Select
            label="Type"
            name="type"
            id="type"
            selected={modelTypeInput}
            onChange={(value) => {
              setModelTypeInput(value);
              setMainCategoryQuery("");
              setMainCategorySelected({});
              setSubCatInputs([
                { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
              ]);
            }}
            options={typeSelectOption}
          />
          {!modelData && (
            <Input
              id="id"
              name="id"
              label="Model ID or URL"
              type="text"
              autoFocus
              placeholder="Model ID or URL"
              value={idInput.value}
              input={{ hidden: modelData ? true : false }}
              onChange={(e, isValid) => {
                setIdInput({ value: e.target.value, isValid });
              }}
              readOnly={!!modelData || newModelId}
              validation={{
                required: true,
                maxLength: VALIDATION_TITLE_MAX_LENGTH,
                modelId: true,
              }}
              showError={showErrorMessage}
            />
          )}
          <ComboSelect
            label="Category"
            optionsData={mainCategoryOptions}
            query={mainCategoryQuery}
            setQuery={setMainCategoryQuery}
            setSelected={selectMainCategoryHandler}
            selected={mainCategorySelected}
            placeholder="Main category"
            validation={{
              required: true,
              maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
        </FieldCategory>
        <Fieldset legend="Subcategories">
          <AnimatePresence>{subCatHtml}</AnimatePresence>
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
            {savedModel && !modelData && (
              <>
                {"-"}
                <Link
                  to={`/models/${savedModel}`}
                  className={classes.link}
                  onClick={() => {
                    if (savedModel !== curModel.id) {
                      dispatch(modelActions.resetModelData());
                    }
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
