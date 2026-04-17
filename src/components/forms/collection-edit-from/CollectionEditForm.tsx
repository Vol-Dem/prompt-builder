import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { motion } from "framer-motion";

import ComboSelect from "../../ui/forms/ComboSelect";
import Fieldset from "../../ui/forms/Fieldset";
import classes from "./CollectionEditForm.module.scss";
import ButttonSecondary from "../../ui/buttons/ButtonSecondary";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_DESCRIPTION_MAX_LENGTH,
  SUCCESS_MESSAGE_SAVED,
} from "../../../variables/constants";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import {
  AppError,
  filterDuplicates,
  handleErrors,
  normalizeError,
  sortArrayBy,
} from "../../../utils/generalUtils";
import Button from "../../ui/buttons/Button";
import Textarea from "../../ui/forms/Textarea";
import Checkbox from "../../ui/forms/Checkbox";
import { editCollectionData } from "../../../store/images";
import Spinner from "../../ui/Spinner";
import Input from "../../ui/forms/Input";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import type { CollectionDoc } from "../../../../shared/types/firestore";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { SelectOption } from "../../../types/general.types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { CollectionSubcategory } from "../../../../shared/types/user";

const SUBCATEGORIES_MAX_AMOUNT = 8;
const subCatsDefData = {
  type: "text",
  id: "subcat-def",
  name: "sub",
  placeholder: "Subcategory",
  selected: { id: null, name: "" },
  isValid: true,
  errorMessage: "",
};

type CollectionEditFormProps = {
  collectionData: CollectionDoc;
};

type SelectedInput = {
  name: string;
  id: string | number | null;
  isValid: boolean;
  errorMessage?: string;
};

type SubcategoryInput = {
  type: string;
  id: string | number;
  name: string;
  placeholder: string;
  selected: SelectOption | null;
  isValid: boolean;
  errorMessage: string;
};

/**
 * Collection edit form component.
 *
 * Provides collection editing flow including updating collection metadata,
 * assigned category and subcategories.
 * Handles form validation, loading and error states.
 *
 * Responsibilities:
 * - Renders editable collection fields.
 * - Validates user input.
 * - Displays backend and client-side error messages.
 * - Updates selected category and subcategories.
 *
 * Side effects:
 * - Dispatches editCollectionData action.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.collectionData - Collection data structure.
 * @returns {JSX.Element} Collection edit form.
 */
const CollectionEditForm = ({ collectionData }: CollectionEditFormProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mainCategoryQuery, setMainCategoryQuery] = useState("");
  const [mainCategorySelected, setMainCategorySelected] =
    useState<SelectedInput>({
      name: "",
      id: "",
      isValid: false,
    });
  const [collectionNameInput, setCollectionNameInput] = useState({
    value: "",
    isValid: true,
  });
  const [subCatInputs, setSubCatInputs] = useState<SubcategoryInput[]>([]);
  const [subCategoryQuery, setSubCategoryQuery] = useState("");
  const [descriptionInput, setDescriptionInput] = useState({
    value: "",
    isValid: true,
  });
  const [nsfwInput, setNsfwInput] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const categories = useAppSelector((state) => state.images.categories);
  const collectionDataIsSaving = useAppSelector(
    (state) => state.images.collectionDataIsSaving,
  );
  const dispatch = useAppDispatch();

  const mainCategoryOptions = useMemo(() => {
    return sortArrayBy(
      categories.filter((category) =>
        category.name.toLowerCase().includes(mainCategoryQuery.toLowerCase()),
      ),
      "name",
    );
  }, [categories, mainCategoryQuery]);

  const subcategories = categories.find(
    (category) => category.name === mainCategorySelected.name,
  )?.subcategories;

  const subCategoryOptions = sortArrayBy(
    subcategories?.filter((subcategory) =>
      subcategory.name.toLowerCase().includes(subCategoryQuery.toLowerCase()),
    ) || [],
    "name",
  );

  const selectMainCategoryHandler = (
    value: SelectOption | null,
    isValid?: boolean,
    errorMessage?: string,
  ) => {
    if (!value) return;

    setMainCategorySelected({ ...value, isValid: !!isValid, errorMessage });
    setSubCatInputs([
      { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
    ]);
  };

  useEffect(() => {
    setSubCatInputs([
      { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
    ]);
  }, []);

  useEffect(() => {
    if (!collectionData?.id || !categories) return;

    setCollectionNameInput({
      value: collectionData.name,
      isValid: true,
    });

    if (collectionData?.description) {
      setDescriptionInput({
        value: collectionData.description,
        isValid: true,
      });
    }

    setNsfwInput(!!collectionData.nsfw);

    const categoryData = categories.find(
      (category) => category.id === collectionData.category,
    );

    if (categoryData?.name) {
      setMainCategorySelected({
        name: categoryData?.name,
        id: collectionData?.category,
        isValid: true,
      });
    }

    let subcategoriesInputData = [];

    if (categoryData && collectionData?.subcategories?.length) {
      subcategoriesInputData = collectionData.subcategories.flatMap(
        (subcategoryId) => {
          const subcategoryData = categoryData?.subcategories?.find(
            (subcategory) => subcategory.id === subcategoryId,
          );

          //Skip deleted subcategories
          if (!subcategoryData) {
            return [];
          }

          return {
            type: "text",
            id: subcategoryData.id,
            name: subcategoryData.name,
            placeholder: "Subcategory",
            selected: { id: subcategoryData.id, name: subcategoryData.name },
            isValid: true,
            errorMessage: "",
          };
        },
      );
    } else {
      subcategoriesInputData = [
        { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
      ];
    }

    if (subcategoriesInputData?.length) setSubCatInputs(subcategoriesInputData);
  }, [collectionData, categories]);

  const subCatSelectHandler = (
    value: SelectOption | null,
    isValid?: boolean,
    errorMessage?: string,
    id?: string,
  ) => {
    setSubCatInputs((prevState) => {
      const newState = [...prevState];

      const curIndex = newState.findIndex((imageId) => {
        return id && imageId.id + "" === id;
      });

      if (curIndex < 0) return prevState;

      newState[curIndex].selected = value;
      newState[curIndex].isValid = !!isValid;
      newState[curIndex].errorMessage = errorMessage || "";

      return newState;
    });
  };

  const addSubHandler = () => {
    if (subCatInputs.length >= SUBCATEGORIES_MAX_AMOUNT) return;
    const newFields = [...subCatInputs];
    newFields.push({
      type: "text",
      id: Date.now(),
      name: "sub",
      placeholder: "Subcategory",
      // value: "",
      // query: "",
      selected: { id: null, name: "" },
      isValid: false,
      errorMessage: "",
    });

    setSubCatInputs(newFields);
  };

  const deleteSubcategoryInputHandler = (index: number) => {
    setSubCatInputs((prevState) => {
      return prevState.toSpliced(index, 1);
    });
  };

  const subCatHtml = subCatInputs.map((sub, i) => {
    return (
      <motion.div
        layout
        key={sub.id}
        initial={i ? ANIMATIONS_FM_SLIDEOUT_INITIAL : false}
        animate={ANIMATIONS_FM_SLIDEOUT}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
        className={classes["subcategory"]}
      >
        <ComboSelect
          id={sub.id + ""}
          optionsData={subCategoryOptions || []}
          query={subCategoryQuery}
          setQuery={setSubCategoryQuery}
          setSelected={subCatSelectHandler}
          selected={sub.selected ? { ...sub.selected } : null}
          placeholder="Subcategory"
          validation={{
            required: false,
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
            <XMarkIcon />
          </ButtonTertiary>
        )}
      </motion.div>
    );
  });

  const submitHandler = async (e: SubmitEvent) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");
      const subcategoriesIsInvalid = !!subCatInputs.find(
        (subcategory) => !subcategory.isValid,
      );
      if (
        !collectionNameInput.isValid ||
        !mainCategorySelected.isValid ||
        !descriptionInput.isValid ||
        subcategoriesIsInvalid ||
        !mainCategorySelected.id
      ) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }

      const newSubcatsData = subCatInputs.reduce<CollectionSubcategory[]>(
        (prev, cur) => {
          if (cur.selected !== null) {
            return [...prev, { ...cur.selected, id: cur.selected.id + "" }];
          }
          return prev;
        },
        [],
      );
      const subcategories = filterDuplicates(newSubcatsData, "name");

      const collection = {
        collectionData: {
          id: collectionData.id,
          name: collectionNameInput.value,
        },
        categoryData: {
          id: mainCategorySelected.id + "",
          name: mainCategorySelected.name,
        },
        curCollectionSabcategories: collectionData?.subcategories,
        subcategoriesData: subcategories,
        description: descriptionInput.value,
        nsfw: nsfwInput,
      };

      await dispatch(editCollectionData(collection));

      setSuccessMessage(SUCCESS_MESSAGE_SAVED);
    } catch (err) {
      console.log(err);
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setShowErrorMessage(true);
    }
  };

  return (
    <form onSubmit={submitHandler} className={classes.form}>
      <div className={classes["fields"]}>
        <div className={classes[`fields__block`]}>
          <Input
            id="collection"
            name="collection"
            type="text"
            label="Collection"
            placeholder="Collection name"
            value={collectionNameInput.value}
            onChange={(e, isValid) => {
              setCollectionNameInput({
                value: e.target.value,
                isValid: isValid === null ? true : isValid,
              });
            }}
            validation={{
              required: true,
              maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Textarea
            label="Description"
            id="description"
            name="description"
            rows={5}
            placeholder="Description"
            value={descriptionInput.value}
            onChange={(e, isValid) => {
              setDescriptionInput({
                value: e.target.value,
                isValid: isValid === null ? true : isValid,
              });
            }}
            validation={{
              maxLength: VALIDATION_DESCRIPTION_MAX_LENGTH,
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
        </div>
        <div className={classes[`fields__block`]}>
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
        </div>
      )}
      <Button
        type="submit"
        disabled={collectionDataIsSaving}
        className={classes.submit}
      >
        {!collectionDataIsSaving ? "Save" : <Spinner size="small" />}
      </Button>
    </form>
  );
};

export default CollectionEditForm;
