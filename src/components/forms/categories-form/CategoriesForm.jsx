import classes from "./CategoriesForm.module.scss";
import Input from "../../../components/ui/Input";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { updateCategories } from "../../../store/model";
import ButtonTertiary from "../../ui/ButtonTertiary";
import DeleteRequest from "../../ui/DeleteRequest";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
} from "../../../variables/constants";
import { AnimatePresence } from "framer-motion";
import { handleErrors, throwCustomError } from "../../../utils/generalUtils";
import { updateCollectionCategories } from "../../../store/images";

const CategoriesForm = ({ modelType, activeCategory, categories }) => {
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const [categoriesToUpdate, setCategoriesToUpdate] = useState([]);
  const [deleteCategoryData, setDeleteCategoryData] = useState("");
  const [categoriesInputs, setCategoriesInputs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const categoriesData = !activeCategory
      ? categories
      : categories.find((category) => category.id === activeCategory)
          ?.subcategories;

    setCategoriesToUpdate(categoriesData);

    const categoriesInputData = categoriesData
      .toSorted((a, b) => {
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
      .map((category, i) => {
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
    setCategoriesInputs(categoriesInputData);
  }, [categories, activeCategory]);

  const subCatHandler = (e, isValid) => {
    setErrorMessage("");
    setCategoriesInputs((prevState) => {
      const newState = prevState.map((item) => {
        if (item.id === e.target.id) {
          return {
            ...item,
            value: e.target.value,
            isValid,
          };
        }
        return item;
      });
      return newState;
    });
  };

  //Switch visibility of change name form
  const changeNameIsActiveHandler = (e) => {
    setErrorMessage("");
    const categoryId = e.target.dataset.id;

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

  //Retrive data from form and dispatch changeUserName action with new name
  const changeCategoryNameHandler = (e) => {
    try {
      e.preventDefault();
      setShowErrorMessage(true);
      setErrorMessage("");
      const formData = new FormData(e.target);
      const [id, categoryName] = [...formData][0];

      const existedName = categoriesToUpdate.find(
        (category) => category.name === categoryName
      );

      const inputData = categoriesInputs.find((input) => input.id === id);

      if (!inputData.isValid) {
        return;
      }

      if (existedName) {
        throwCustomError(`The "${categoryName}" category already exists`);
      }
      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
      }

      const updatedCategories = categoriesToUpdate.map((category) => {
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

      if (modelType === "collections") {
        dispatch(updateCollectionCategories(categoriesData));
      } else {
        dispatch(updateCategories(modelType, categoriesData));
      }
    } catch (err) {
      setErrorMessage(handleErrors(err));
    }
  };

  const deleteCategoryHandler = () => {
    const updatedCategories = categoriesToUpdate.filter(
      (category) => category.id !== deleteCategoryData.id
    );

    if (activeCategory) {
      const mainCategory = categories.find(
        (category) => category.id === activeCategory
      );
      const mainCategoryIndex = categories.findIndex(
        (category) => category.id === activeCategory
      );
      const updatedMainCategory = {
        ...mainCategory,
        subcategories: updatedCategories,
      };

      const updatedAllCategories = [
        ...categories.slice(0, mainCategoryIndex),
        updatedMainCategory,
        ...categories.slice(mainCategoryIndex + 1),
      ];

      if (modelType === "collections") {
        dispatch(updateCollectionCategories(updatedAllCategories));
      } else {
        dispatch(updateCategories(modelType, updatedAllCategories));
      }
    } else {
      if (modelType === "collections") {
        dispatch(updateCollectionCategories(updatedCategories));
      } else {
        dispatch(updateCategories(modelType, updatedCategories));
      }
    }

    setDeleteRequestIsOpen(false);
  };

  const showDeleteReqeustHandler = (e) => {
    const categoryId = e.target.dataset.id;
    const categoryName = categoriesToUpdate.find(
      (category) => category.id === categoryId
    ).name;
    setDeleteCategoryData({ id: categoryId, name: categoryName });
    setDeleteRequestIsOpen(true);
  };

  const closeDeleteReqeustHandler = () => {
    setDeleteCategoryData("");
    setDeleteRequestIsOpen(false);
  };

  const categoriesInputsHtml = categoriesInputs.map((category, i) => {
    return (
      <form key={i} onSubmit={changeCategoryNameHandler}>
        <div className={classes["category__form"]}>
          {!category.active && (
            <div className={classes["category__name"]}>{category.name}</div>
          )}
          {category.active && (
            <>
              <Input
                key={category.id}
                id={category.id}
                name={category.id}
                type={category.type}
                placeholder={category.placeholder}
                onChange={subCatHandler}
                value={category.value}
                validation={{
                  required: true,
                  maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
                autoFocus
              />
              <ButtonTertiary type="submit" className={classes["btn"]}>
                Submit
              </ButtonTertiary>
            </>
          )}
          <ButtonTertiary
            type="button"
            button={{ "data-id": category.id }}
            className={classes["btn"]}
            onClick={changeNameIsActiveHandler}
          >
            {!category.active ? "Change" : "Cancel"}
          </ButtonTertiary>
          {!category.active && (
            <ButtonTertiary
              type="button"
              button={{ "data-id": category.id }}
              className={`${classes["btn"]} ${classes["btn--del"]}`}
              onClick={showDeleteReqeustHandler}
            >
              Delete
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
    <section className={classes.category}>
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
            message={`Are you sure you want to delete "${deleteCategoryData.name}" category? This action can't
        be undone`}
            onSubmit={deleteCategoryHandler}
            onClose={closeDeleteReqeustHandler}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default CategoriesForm;
