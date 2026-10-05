import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";

import Button from "../../ui/buttons/Button";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import classes from "./SaveToCollectionForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT,
} from "../../../variables/constants";
import ComboSelect from "../../ui/forms/ComboSelect";
import SubcategoriesInputFieldset from "../../ui/forms/SubcategoriesInputFieldset";
import {
  cloneObject,
  sortArrayBy,
} from "../../../utils/generalUtils";
import SuccessMessage from "../../ui/SuccessMessage";
import useCollectionDestination from "../../../hooks/use-collection-destination";
import SuggestedCollections from "./SuggestedCollections";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { Image } from "../../../../shared/types/image";
import type { SuggestedCollection } from "../../../types/collections.types";
import type { SubcategoryInput } from "../../../types/forms.types";
import { FORMS_DEF_SUBCATEGORY_INPUT } from "../../../variables/structures";
import type { SelectOption } from "../../../types/general.types";
import type {
  UploadingCollectionData,
  UploadingPostData,
} from "../../../types/upload.types";
import type { ResourceFirestoreCollection } from "../../../types/models.types";

type SaveToCollectionFormProps = {
  postId?: number;
  images?: Image[];
  activeImageIndex?: number;
  onSave?: (
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
 * @param props
 * @param props.postId - Source post ID.
 * @param props.images - List of post images.
 * @param props.activeImageIndex - Index of the image active when the form was opened.
 * @param props.onSave
 *        Callback forwarded to ChooseImageForm after successful submit.
 * @returns Save to Collection form.
 */
const SaveToCollectionForm = ({
  postId,
  images,
  activeImageIndex,
  onSave,
}: SaveToCollectionFormProps) => {
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
    SubcategoryInput[]
  >([]);
  const [subcategoryQuery, setSubcategoryQuery] = useState("");

  const categories = useAppSelector((state) => state.images.categories);
  const {
    stage,
    destination: { collectionInfo, savedPostData },
    status: { collectionInfoIsLoading, errorMessage, successMessage, showErrorMessage },
    prepare,
  } = useCollectionDestination({ postId, hasImages: !!images?.length });

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
    setSubcategoryInputs([
      cloneObject({ ...FORMS_DEF_SUBCATEGORY_INPUT, isValid: true }),
    ]);
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
    setSubcategoryInputs([
      cloneObject({ ...FORMS_DEF_SUBCATEGORY_INPUT, isValid: true }),
    ]);
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

  const submitHandler = (e: SubmitEvent) => {
    e.preventDefault();
    return prepare({ mainCategorySelected, collectionNameSelected, subcategoryInputs });
  };

  return (
    <>
      {stage === "destination" && (
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
              <SubcategoriesInputFieldset
                subcategories={subcategoryInputs}
                options={subCategoryOptions}
                query={subcategoryQuery}
                required={false}
                emptySelection={{ id: null, name: "" }}
                showError={showErrorMessage}
                onQueryChange={setSubcategoryQuery}
                onSelect={subCatSelectHandler}
                onAdd={addSubHandler}
                onDelete={deleteSubcategoryInputHandler}
              />
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
          {images && (
            <SuggestedCollections
              images={images}
              selectedCategoryId={mainCategorySelected.id}
              selectedCollectionId={collectionNameSelected.id}
              onSelect={selectCollectionFromSuggestedListHandler}
            />
          )}
        </div>
      )}

      {stage === "images" && images && onSave && (
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
