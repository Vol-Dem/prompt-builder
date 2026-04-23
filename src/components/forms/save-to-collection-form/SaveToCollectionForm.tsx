import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import Button from "../../ui/buttons/Button";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import classes from "./SaveToCollectionForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ERROR_MESSAGE_INPUT_DEF,
  SUCCESS_MESSAGE_SAVED,
  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT,
} from "../../../variables/constants";
import ComboSelect from "../../ui/forms/ComboSelect";
import Fieldset from "../../ui/forms/Fieldset";
import ButttonSecondary from "../../ui/buttons/ButtonSecondary";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import {
  cloneObject,
  filterDuplicates,
  handleErrors,
  normalizeError,
  sortArrayBy,
  throwCustomError,
} from "../../../utils/generalUtils";
import { addNewCollectionCategories } from "../../../store/images";
import SuccessMessage from "../../ui/SuccessMessage";
import { getCollectionData } from "../../../utils/fetch/fetchCollection";
import SuggestedCollections from "./SuggestedCollections";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { Image } from "../../../../shared/types/image";
import type { SuggestedCollection } from "../../../types/collections.types";
import type { SubcategoryDefInputData } from "../../../types/forms.types";
import { FORMS_SUBCATEGORY_INPUT_DEF } from "../../../variables/structures";
import type { SelectOption } from "../../../types/general.types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { CollectionSavedPost } from "../../../../shared/types/collection";
import type {
  UploadingCollectionData,
  UploadingPostData,
} from "../../../types/upload.types";
import type { ResourceFirestoreCollection } from "../../../types/models.types";

type SaveToCollectionFormProps = {
  postId: number;
  images: Image[];
  activeImageIndex: number;
  onSave: (
    location: ResourceFirestoreCollection,
    ids: number[] | null,
    collectionData: UploadingCollectionData | null,
    postData?: UploadingPostData | null,
  ) => void;
};

type CollectionNameSelected = {
  name: string;
  id: number | null;
  isValid: boolean;
  errorMessage?: string;
};
type MainCategorySelected = {
  name: string;
  id: string | null;
  isValid: boolean;
  errorMessage?: string;
};

/**
 * Save to Collection form component.
 *
 * Allows saving images to a collection from a model image list.
 * Renders three searchable, creatable select inputs:
 * - Category
 * - Subcategory (optional, populated after category selection)
 * - Collection name (populated after category selection and filtered by selected subcategories)
 *
 * Each select supports free text input with filtering. If no exact match is found,
 * a "Create" option is displayed to create a new category / subcategory / collection.
 *
 * Supports multiple subcategories via the "+ Add subcategory" control, which dynamically
 * appends additional subcategory select fields.
 *
 * On submit, creates new categories, subcategories, and collections as needed,
 * then forwards the resolved collection data and selected images to ChooseImageForm.
 *
 * Responsibilities:
 * - Renders dynamic category, subcategory, and collection selectors.
 * - Filters available collections based on selected category and subcategories.
 * - Handles creation of new category / subcategory / collection entities.
 * - Displays validation and error messages.
 *
 * Side effects:
 * - Creates new categories, subcategories, and collections in the database.
 * - Forwards resolved collection data to ChooseImageForm.
 *
 * @component
 * @param {object} props
 * @param {number} props.postId - Source post ID.
 * @param {Array<object>} props.images - List of post images.
 * @param {number} props.activeImageIndex - Index of the image active when the form was opened.
 * @param {any} props.onSave
 *        Callback forwarded to ChooseImageForm after successful submit.
 * @returns {JSX.Element} Save to Collection form.
 */
const SaveToCollectionForm = ({
  postId,
  images,
  activeImageIndex,
  onSave,
}: SaveToCollectionFormProps) => {
  const [chooseImageIsOpen, setChooseImageIsOpen] = useState(false);
  const [collectionInfoIsLoading, setCollectionInfoIsLoading] = useState(false);
  const [collectionInfo, setCollectionInfo] =
    useState<UploadingCollectionData | null>(null);
  const [savedPostData, setSavedPostData] =
    useState<CollectionSavedPost | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mainCategoryQuery, setMainCategoryQuery] = useState("");
  const [mainCategorySelected, setMainCategorySelected] =
    useState<MainCategorySelected>({
      name: "",
      id: "",
      isValid: false,
    });
  const [collectionNameQuery, setCollectionNameQuery] = useState("");
  const [collectionNameSelected, setCollectionNameSelected] =
    useState<CollectionNameSelected>({
      name: "",
      id: null,
      isValid: false,
    });
  const [subcategoryInputs, setSubcategoryInputs] = useState<
    SubcategoryDefInputData[]
  >([]);
  const [subcategoryQuery, setSubcategoryQuery] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const categories = useAppSelector((state) => state.images.categories);
  const dispatch = useAppDispatch();

  const selectCollectionFromSuggestedListHandler = (
    suggestedCollectionData: SuggestedCollection,
  ) => {
    setMainCategorySelected({
      name: suggestedCollectionData.categoryName,
      id: suggestedCollectionData.categoryId,
      isValid: true,
    });
    setCollectionNameSelected({
      name: suggestedCollectionData.collectionName,
      id: suggestedCollectionData.collectionId,
      isValid: true,
    });
  };

  const mainCategoryOptions = useMemo(() => {
    const categoriesOptions = categories.filter((category) =>
      category.name
        .trim()
        .toLowerCase()
        .includes(mainCategoryQuery.trim().toLowerCase()),
    );
    return sortArrayBy(categoriesOptions, "name");
  }, [categories, mainCategoryQuery]);

  const inputSubcatIds = subcategoryInputs.flatMap((subcat) => {
    if (!subcat?.selected?.id) {
      return [];
    }
    return subcat.selected.id;
  });

  const collectionNameOptions = images?.length
    ? sortArrayBy(
        categories
          .find((category) => category.name === mainCategorySelected.name)
          ?.collectionNames?.filter((collection) => {
            const isInSubcategories = collection?.subcategories?.some(
              (subcategoryId) => inputSubcatIds?.includes(subcategoryId),
            );

            const isInQuery = collection.name
              .toLowerCase()
              .includes(collectionNameQuery.trim().toLowerCase());
            return inputSubcatIds?.length
              ? isInSubcategories && isInQuery
              : isInQuery;
          }) || [],
        "name",
      )
    : [];

  const subcategories = categories.find(
    (category) => category.name === mainCategorySelected.name,
  )?.subcategories;

  const subCategoryOptions =
    (subcategories &&
      sortArrayBy(
        subcategories.filter((subcategory) =>
          subcategory.name
            .toLowerCase()
            .includes(subcategoryQuery.trim().toLowerCase()),
        ),
        "name",
      )) ||
    [];

  const selectMainCategoryHandler = (
    value: SelectOption<string> | null,
    isValid: boolean | null,
    errorMessage?: string,
  ) => {
    if (!value) return;

    setMainCategorySelected({
      ...value,
      isValid: isValid === null ? true : isValid,
      errorMessage: errorMessage || "",
    });
    setCollectionNameSelected({
      name: "",
      id: null,
      isValid: false,
    });
    setSubcategoryInputs([cloneObject(FORMS_SUBCATEGORY_INPUT_DEF)]);
  };

  const selectCollectionNameHandler = (
    value: SelectOption<number> | null,
    isValid: boolean | null,
    errorMessage?: string,
  ) => {
    if (!value) return;

    setCollectionNameSelected({
      ...value,
      isValid: isValid === null ? true : isValid,
      errorMessage: errorMessage || "",
    });
  };

  useEffect(() => {
    setSubcategoryInputs([cloneObject(FORMS_SUBCATEGORY_INPUT_DEF)]);
  }, []);

  const subCatSelectHandler = (
    value: SelectOption<string> | null,
    isValid: boolean | null,
    errorMessage?: string,
    id?: string,
  ) => {
    if (!value) return;

    setSubcategoryInputs((prevState) => {
      const newState = [...prevState];

      const curIndex = newState.findIndex((imageId) => {
        return imageId.id + "" === id + "";
      });

      if (curIndex < 0) return prevState;

      newState[curIndex].selected = value;
      newState[curIndex].isValid = isValid === null ? true : isValid;
      newState[curIndex].errorMessage = errorMessage || "";

      return newState;
    });
  };

  const addSubHandler = () => {
    if (subcategoryInputs.length >= SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT)
      return;
    const newFields = [...subcategoryInputs];
    newFields.push({
      type: "text",
      id: Date.now() + "",
      name: "sub",
      placeholder: "Subcategory",
      value: "",
      query: "",
      selected: { id: null, name: "" },
      isValid: false,
      errorMessage: "",
    });

    setSubcategoryInputs(newFields);
  };

  const deleteSubcategoryInputHandler = (index: number) => {
    setSubcategoryInputs((prevState) => {
      return prevState.toSpliced(index, 1);
    });
  };

  const subCatHtml = subcategoryInputs.map((sub, i) => {
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
          id={sub.id}
          optionsData={subCategoryOptions || []}
          query={subcategoryQuery}
          setQuery={setSubcategoryQuery}
          setSelected={subCatSelectHandler}
          selected={{ ...sub.selected }}
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
      const subcategoriesIsInvalid = !!subcategoryInputs.find(
        (subcategory) => !subcategory.isValid,
      );
      if (
        !collectionNameSelected.isValid ||
        !mainCategorySelected.isValid ||
        subcategoriesIsInvalid
      ) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      setCollectionInfoIsLoading(true);

      let curCollectionSabcategories: string[] = [];
      let postData: CollectionSavedPost | null = null;

      if (mainCategorySelected?.id && collectionNameSelected?.id) {
        const collectionData = await getCollectionData(
          collectionNameSelected.id,
        );
        postData =
          collectionData?.posts?.find((post) => post.postId === postId) || null;

        curCollectionSabcategories = collectionData.subcategories;
      }

      const inputSubcatsData = subcategoryInputs.flatMap((subcat) => {
        if (!subcat?.selected?.name) {
          return [];
        }
        return subcat.selected;
      });
      const subcategories = filterDuplicates(inputSubcatsData, "name").map(
        (subcategory) => {
          return {
            ...subcategory,
            name: subcategory.name.trim(),
          };
        },
      );

      const collectionInputData = {
        collectionData: {
          id: collectionNameSelected.id,
          name: collectionNameSelected.name.trim(),
        },
        categoryData: {
          id: mainCategorySelected.id,
          name: mainCategorySelected.name.trim(),
        },
        subcategoriesData: subcategories,
        curCollectionSabcategories,
      };

      const categoriesWithId = await dispatch(
        addNewCollectionCategories(collectionInputData),
      );

      setCollectionInfo(categoriesWithId);
      if (images?.length) {
        if (postData?.imageIds?.length) {
          setSavedPostData(postData);
        }

        setChooseImageIsOpen(true);
      }

      setSuccessMessage(SUCCESS_MESSAGE_SAVED);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setShowErrorMessage(true);
    } finally {
      setCollectionInfoIsLoading(false);
    }
  };

  return (
    <>
      {!chooseImageIsOpen && (
        <div className={classes["container"]}>
          <form
            // initial={ANIMATIONS_FM_FADEIN_INITIAL}
            // animate={ANIMATIONS_FM_FADEIN}
            // transition={{ duration: 0.3 }}
            className={classes.form}
            onSubmit={submitHandler}
          >
            <div className={classes["fields"]}>
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
                {subcategoryInputs?.length <
                  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT && (
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
              <ComboSelect
                id="colname"
                label="Collection"
                optionsData={collectionNameOptions}
                query={collectionNameQuery}
                setQuery={setCollectionNameQuery}
                setSelected={selectCollectionNameHandler}
                selected={collectionNameSelected}
                placeholder="Collection name"
                validation={{
                  required: true,
                  maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
            </div>
            <div className={classes.status}>
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              {successMessage && !images?.length && (
                <>
                  {"-"}
                  <Link
                    to={`/images/${collectionInfo?.collectionData?.id}`}
                    className={classes.link}
                  >
                    Show collection
                  </Link>
                </>
              )}
            </div>

            <Button type="submit" className={classes.submit}>
              {collectionInfoIsLoading ? (
                <Spinner size="small" />
              ) : images?.length ? (
                "Choose images"
              ) : (
                "Create"
              )}
            </Button>
          </form>
          <SuggestedCollections
            images={images}
            selectedCategoryId={mainCategorySelected.id}
            selectedCollectionId={collectionNameSelected.id}
            onSelect={selectCollectionFromSuggestedListHandler}
          />
        </div>
      )}

      {chooseImageIsOpen && (
        <ChooseImageForm
          type="save"
          location="collections"
          collectionInfo={collectionInfo}
          postData={savedPostData}
          savedImageIds={savedPostData?.imageIds || null}
          images={images}
          activeImageIndex={activeImageIndex}
          onSave={onSave}
        />
      )}
    </>
  );
};

export default SaveToCollectionForm;
