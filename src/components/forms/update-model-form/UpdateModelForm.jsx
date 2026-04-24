import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import classes from "./UpdateModelForm.module.scss";
import Input from "../../ui/forms/Input";
import Button from "../../ui/buttons/Button";
import Textarea from "../../ui/forms/Textarea";
import ButttonSecondary from "../../ui/buttons/ButtonSecondary";
import Checkbox from "../../ui/forms/Checkbox";
import Select from "../../ui/forms/Select";
import Fieldset from "../../ui/forms/Fieldset";
import FieldCategory from "../../ui/forms/FieldCategory";
import { handleErrors, throwCustomError } from "../../../utils/generalUtils";
import Spinner from "../../ui/Spinner";
import ComboSelect from "../../ui/forms/ComboSelect";
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
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  DEFAULT_DATA_TAGSETS_INPUT,
  SETTINGS_MODEL_TYPE_UNKNOWN,
  SETTINGS_MODEL_TYPE_DEF,
  ERROR_MESSAGE_INVALID_MODEL_ID,
} from "../../../variables/constants";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import { tabActions } from "../../../store/tabs";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import { modelActions } from "../../../store/model";
import EditDefaultGuide from "../../general-elements/guide/edit/EditDefaultGuide";
import { createTagSetsInputData } from "../../../utils/promptUtils";
import { parseModelIds } from "../../../utils/modelUtils";
import { saveModelData } from "../../../utils/fetch/fetchModel";
import { FORMS_DEF_TAGS_INPUT } from "../../../variables/structures";

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

/**
 * Model edit form component.
 *
 * Provides model creation and editing flows with three distinct scenarios:
 *
 * 1) Create new model (no props):
 *    - Fetches model metadata from the Civitai API using saveModelData utility.
 *    - Saves the model to the application database.
 *
 * 2) Create model from resource list (newModelId / newModelVersionId provided):
 *    - Form is prepopulated with non-editable model and version IDs.
 *    - Saves the model to the application database.
 *    - On successful save, calls onSave callback to update the resource list preview.
 *
 * 3) Edit existing model (modelData provided):
 *    - Renders additional editable fields for existing model.
 *    - Updates model metadata, category and subcategories.
 *
 * Handles form validation, loading and error states for all scenarios.
 *
 * Responsibilities:
 * - Renders appropriate input fields depending on creation/editing mode.
 * - Validates user input.
 * - Displays backend and client-side error messages.
 * - Updates selected category and subcategories.
 *
 * Side effects:
 * - Dispatches setBaseModels and resetModelData actions.
 * - Calls saveModelData utility to fetch model data from Civitai API when creating new models.
 *
 * @component
 *
 * @param {object} props
 * @param {object} [props.modelData] - Existing model data for edit mode.
 * @param {number} [props.newModelId] - Model ID when creating from resource list.
 * @param {number} [props.newModelVersionId] - Model version ID when creating from resource list.
 * @param {(previewData: any) => void} [props.onSave] - Callback triggered after successful save to update resource preview.
 * @param {string | null} [props.newModelType] - Model type when creating from resource list.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {JSX.Element} Model edit form.
 */
const UpdateModelForm = ({
  modelData,
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
    modelData?.modelType || SETTINGS_MODEL_TYPE_DEF,
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
    value: (modelData?.id || newModelId || "") + "",
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
  const categories = useSelector((state) => state.tabs.categoriesData);
  const curBaseModels = useSelector((state) => state.tabs.baseModels);
  const guideStep = useSelector((state) => state.guide.edit.step);
  const guideIsActive = useSelector((state) => state.guide.active);
  const curModel = useSelector((state) => state.model.model);
  const dispatch = useDispatch();
  const hasModelTypeInputField =
    categories && Object.hasOwn(categories, modelTypeInput);

  const mainCategoryOptions = useMemo(() => {
    return !!modelTypeInput && hasModelTypeInputField
      ? categories[modelTypeInput]?.filter((category) =>
          category.name
            .toLowerCase()
            .includes(mainCategoryQuery.trim().toLowerCase()),
        )
      : [];
  }, [categories, modelTypeInput, mainCategoryQuery, hasModelTypeInputField]);

  const subCategoryOptions = hasModelTypeInputField
    ? categories[modelTypeInput]
        .find((category) => category.name === mainCategorySelected.name)
        ?.subcategories?.filter((subcategory) =>
          subcategory.name
            .toLowerCase()
            .includes(subCategoryQuery.trim().toLowerCase()),
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
          type.aliases.includes(newModelType.toLowerCase()),
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
        modelData?.modelVersionsCustomData,
      )
        ?.sort((a, b) => a?.index - b?.index)
        .map((version) => {
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
        (category) => category.id === modelData?.main,
      )?.name;

      setMainCategorySelected({
        name: mainCategoryName || "",
        id: mainCategoryName ? modelData?.main : "",
        isValid: mainCategoryName ? true : false,
      });

      setTagSetsInputs(
        createTagSetsInputData(
          modelData?.defaultCustomData?.tagSetsData,
          FORMS_DEF_TAGS_INPUT,
        ),
      );
    }
  }, [modelData, categories, newModelType]);

  const submitFormHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setShowErrorMessage(true);
    setModelIsSaving(true);

    let modelId;
    let modelVersionId;

    try {
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false,
      );
      const subcatsIsValid = !!subCatInputs.find(
        (input) => input.isValid === true,
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

      const formdata = new FormData(e.target);
      const modelType = modelTypeInput;

      [modelId, modelVersionId] = parseModelIds(idInput.value);

      if (newModelVersionId) {
        modelVersionId = newModelVersionId;
      }

      if (!modelId) {
        throwCustomError(ERROR_MESSAGE_INVALID_MODEL_ID);
      }

      const modelName = titleInput.value.trim();
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

      const newModelData = {
        modelId,
        modelVersionId,
        modelType,
        modelName,
        categories,
        main,
        sub,
        hashtags,
        mainTag,
        fileName,
        size,
        versionsDownloadStatus,
        nsfw: nsfwInput,
      };

      const { preview, baseModels } = await saveModelData(
        newModelData,
        categories,
        curBaseModels,
        modelData,
      );

      if (baseModels) {
        dispatch(tabActions.setBaseModels(baseModels));
      }

      if (onSave) onSave(preview);

      if (!modelData) {
        setIdInput({
          value: newModelId ? newModelId + "" : "",
          isValid: false,
        });
        setSubCatInputs([
          { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
        ]);
        setMainCategorySelected({});
      }

      setSavedModel(modelId);
      setSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setShowErrorMessage(false);
      setModelIsSaving(false);
    } catch (err) {
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

  const deleteSubcategoryInputHandler = (index) => {
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
        (version) => version.id === e.target.id,
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
      onSubmit={submitFormHandler}
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
              hidden={modelData ? true : false}
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
        <Button
          type="submit"
          disabled={modelIsSaving}
          className={classes.submit}
        >
          {!modelIsSaving ? "Save" : <Spinner size="small" />}
        </Button>
      </div>
    </form>
  );
};

export default UpdateModelForm;
