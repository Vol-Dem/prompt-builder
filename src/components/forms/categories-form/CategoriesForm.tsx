import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./CategoriesForm.module.scss";
import Input from "../../ui/forms/Input";
import { updateCategories } from "../../../store/modelThunks";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import DeleteRequest from "../../ui/DeleteRequest";
import Spinner from "../../ui/Spinner";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_CATEGORY_RENAME,
  ERROR_MESSAGE_CATEGORY_DELETE,
} from "../../../variables/constants";
import {
  AppError,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";
import { updateCollectionCategories } from "../../../store/imagesThunks";
import type {
  CollectionCategory,
  ModelCategory,
} from "../../../../shared/types/user";
import { useAppDispatch } from "../../../store/hooks/hooks";
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type CategoriesFormProps = {
  modelType: string;
  activeCategory?: string | null;
  categories: ModelCategory[] | CollectionCategory[];
};

type CategoryInput = {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  active: boolean;
  isValid: boolean;
};

/**
 * Categories form component.
 *
 * Displays and manages a sorted list of categories with the ability to rename
 * and delete them. Supports both top-level categories and nested subcategories
 * when an activeCategory is provided.
 *
 * When activeCategory is present, the form operates on subcategories of the
 * selected category instead of the root category list.
 *
 * Responsibilities:
 * - Renders list of categories or subcategories depending on activeCategory.
 * - Renames existing categories.
 * - Deletes categories.
 * - Prevents duplicate category names.
 * - Displays validation and error messages.
 *
 * Side effects:
 * - Dispatches updateCategories and updateCollectionCategories actions.
 *
 * @component
 *
 * @param props
 * @param props.modelType - Defines whether categories belong to models or collections.
 * @param props.activeCategory - Active parent category name to operate on its subcategories.
 * @param props.categories - Categories data structure.
 * @returns Categories management form.
 */
const CategoriesForm = ({
  modelType,
  activeCategory,
  categories,
}: CategoriesFormProps) => {
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const [deleteCategoryData, setDeleteCategoryData] =
    useState<ModelCategory | null>(null);
  const [categoriesInputs, setCategoriesInputs] = useState<CategoryInput[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "rename" | "delete";
    id: string;
  } | null>(null);
  const pendingRef = useRef(false);
  const inputsContextRef = useRef({ modelType, activeCategory });
  const isPending = pendingAction !== null;
  const dispatch = useAppDispatch();

  const categoriesToUpdate = useMemo(() => {
    return !activeCategory
      ? categories
      : categories.find((category) => category.id === activeCategory)
          ?.subcategories;
  }, [activeCategory, categories]);

  useEffect(() => {
    const categoriesInputData = categoriesToUpdate
      ?.toSorted((a, b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      })
      .map((category) => {
        return {
          type: "text",
          id: category.id,
          name: category.name,
          placeholder: "",
          value: category.name,
          active: false,
          isValid: true,
        };
      });

    const sameContext =
      inputsContextRef.current.modelType === modelType &&
      inputsContextRef.current.activeCategory === activeCategory;
    inputsContextRef.current = { modelType, activeCategory };
    // Keep drafts when Firestore emits a local write or its rollback.
    setCategoriesInputs((previousInputs) =>
      (categoriesInputData || []).map((input) => {
        const draft = sameContext && previousInputs.find(
          (previous) => previous.id === input.id && previous.active,
        );
        return draft
          ? { ...input, value: draft.value, active: true, isValid: draft.isValid }
          : input;
      }),
    );
  }, [categoriesToUpdate, modelType, activeCategory]);

  const subcatChangeHandler = (
    e: ChangeEvent<HTMLInputElement>,
    isValid: boolean | null,
  ) => {
    if (pendingRef.current) return;
    setErrorMessage("");
    setCategoriesInputs((prevState) => {
      const newState = prevState.map((item) => {
        if (item.id === e.target.id) {
          return {
            ...item,
            value: e.target.value,
            isValid: isValid === null ? true : isValid,
          };
        }
        return item;
      });
      return newState;
    });
  };

  //Switch visibility of change name form
  const changeNameIsActiveHandler = (categoryId: string) => {
    if (pendingRef.current) return;
    setErrorMessage("");

    setCategoriesInputs((prevState) => {
      return prevState.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            active: !category.active,
          };
        }
        return {
          ...category,
          active: false,
        };
      });
    });
  };

  const changeCategoryNameHandler = async (e: SubmitEvent) => {
    e.preventDefault();
    if (pendingRef.current) return;
    try {
      setShowErrorMessage(true);
      setErrorMessage("");
      const formData = new FormData(e.target);
      const [id, categoryName] = [...formData][0];

      const inputData = categoriesInputs.find((input) => input.id === id);

      if (!inputData?.isValid || typeof categoryName !== "string") {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }

      const sameName = !!categoriesToUpdate?.find(
        (category) => category.name === categoryName && category.id === id,
      );

      if (sameName) {
        changeNameIsActiveHandler(id);
        return;
      }

      const existedName = !!categoriesToUpdate?.find(
        (category) => category.name === categoryName,
      );

      if (existedName) {
        throw new AppError(`The category "${categoryName}" already exists`);
      }

      if (!navigator?.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
      }

      const updatedCategories = categoriesToUpdate?.map((category) => {
        if (category.id === id) {
          return {
            ...category,
            name: categoryName,
          };
        }
        return category;
      });

      const categoriesData = !activeCategory
        ? updatedCategories
        : categories.map((category) => {
            if (category.id === activeCategory) {
              return {
                ...category,
                subcategories: updatedCategories,
              };
            }
            return category;
          });

      if (!categoriesData) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }

      pendingRef.current = true;
      setPendingAction({ type: "rename", id });
      if (modelType === "collections") {
        await dispatch(updateCollectionCategories(categoriesData));
      } else {
        await dispatch(updateCategories(modelType, categoriesData));
      }
      setCategoriesInputs((inputs) => inputs.map((input) =>
        input.id === id
          ? { ...input, name: categoryName, value: categoryName, active: false }
          : input,
      ));
    } catch (err) {
      const error = normalizeError(err);
      const message = handleErrors(error);
      setErrorMessage(error.isCustom ? message : ERROR_MESSAGE_CATEGORY_RENAME);
    } finally {
      pendingRef.current = false;
      setPendingAction(null);
    }
  };

  const deleteCategoryHandler = async () => {
    if (pendingRef.current) return;
    setDeleteErrorMessage("");
    try {
      if (!deleteCategoryData || !categoriesToUpdate) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) throw new AppError(ERROR_MESSAGE_OFFLINE);

      const updatedCategories = categoriesToUpdate.filter(
        (category) => category.id !== deleteCategoryData.id,
      );
      const updatedCategoriesData = !activeCategory
        ? updatedCategories
        : categories.map((category) =>
            category.id === activeCategory
              ? { ...category, subcategories: updatedCategories }
              : category,
          );

      pendingRef.current = true;
      setPendingAction({ type: "delete", id: deleteCategoryData.id });
      if (modelType === "collections") {
        await dispatch(updateCollectionCategories(updatedCategoriesData));
      } else {
        await dispatch(updateCategories(modelType, updatedCategoriesData));
      }
      setDeleteRequestIsOpen(false);
      setDeleteCategoryData(null);
    } catch (err) {
      const error = normalizeError(err);
      const message = handleErrors(error);
      setDeleteErrorMessage(
        error.isCustom ? message : ERROR_MESSAGE_CATEGORY_DELETE,
      );
    } finally {
      pendingRef.current = false;
      setPendingAction(null);
    }
  };

  const showDeleteReqeustHandler = (categoryId: string) => {
    if (pendingRef.current) return;
    const categoryName = categoriesToUpdate?.find(
      (category) => category.id === categoryId,
    )?.name;

    if (categoryName) {
      setDeleteErrorMessage("");
      setDeleteCategoryData({ id: categoryId, name: categoryName });
      setDeleteRequestIsOpen(true);
    }
  };

  const closeDeleteReqeustHandler = () => {
    if (pendingRef.current) return;
    setDeleteErrorMessage("");
    setDeleteCategoryData(null);
    setDeleteRequestIsOpen(false);
  };

  const categoriesInputsHtml = categoriesInputs.map((category, i) => {
    const isRenaming =
      pendingAction?.type === "rename" && pendingAction.id === category.id;
    return (
      <form key={i} onSubmit={changeCategoryNameHandler}>
        <div className={classes["category__form"]}>
          {!category.active && (
            <div className={classes["category__name"]}>{category?.name}</div>
          )}
          {category.active && (
            <>
              <Input
                key={category.id}
                id={category.id}
                name={category.id}
                type={category.type}
                placeholder={category.placeholder}
                onChange={subcatChangeHandler}
                value={category.value}
                disabled={isPending}
                aria-label="Category name"
                validation={{
                  required: true,
                  maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
                autoFocus
              />
              <ButtonTertiary
                type="submit"
                className={classes["btn"]}
                disabled={isPending}
                aria-label="Save category name"
                aria-busy={isRenaming}
              >
                <CheckIcon
                  className={isRenaming ? classes["btn__icon--hidden"] : ""}
                />
                {isRenaming && (
                  <span
                    className={classes["btn__spinner"]}
                    role="status"
                    aria-label="Saving category name"
                  >
                    <Spinner size="small" />
                  </span>
                )}
              </ButtonTertiary>
            </>
          )}
          <ButtonTertiary
            type="button"
            className={classes["btn"]}
            disabled={isPending}
            aria-label={`${category.active ? "Cancel renaming" : "Rename"} ${category.name}`}
            onClick={() => changeNameIsActiveHandler(category.id)}
          >
            {!category.active ? <PencilSquareIcon /> : <XMarkIcon />}
          </ButtonTertiary>
          {!category.active && (
            <ButtonTertiary
              type="button"
              className={`${classes["btn"]} ${classes["btn--del"]}`}
              disabled={isPending}
              aria-label={`Delete ${category.name}`}
              onClick={() => showDeleteReqeustHandler(category.id)}
            >
              <TrashIcon />
            </ButtonTertiary>
          )}
        </div>
        {category.active && errorMessage && (
          <div className={classes["category__error"]}>{errorMessage}</div>
        )}
      </form>
    );
  });

  return (
    <section className={classes.category} aria-busy={isPending}>
      <div className={classes["category__container"]}>
        <div>
          <div className={classes["category__info"]}>
            {categoriesInputsHtml}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {deleteRequestIsOpen && (
          <DeleteRequest
            message={`Are you sure you want to delete "${deleteCategoryData?.name}" category? This action can't
        be undone`}
            onSubmit={deleteCategoryHandler}
            onClose={closeDeleteReqeustHandler}
            isDeleting={pendingAction?.type === "delete"}
            errorMessage={deleteErrorMessage}
            allowRetry
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default CategoriesForm;
