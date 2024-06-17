import classes from "./CategoriesForm.module.scss";
// import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import { useDispatch, useSelector } from "react-redux";
// import { changeUserName, changeUserPassword } from "../store/auth";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import { useEffect, useState } from "react";
// import ButttonSecondary from "../../ui/ButtonSecondary";
// import { ReactComponent as UserIcon } from "./../../../assets/user.svg";
import { updateCategories } from "../../../store/model";
import ButtonTertiary from "../../ui/ButtonTertiary";
import DeleteRequest from "../../ui/DeleteRequest";
import SuccessMessage from "../../ui/SuccessMessage";
import { CATEGORY_NAME_MAX_LENGTH } from "../../../variables/constants";
import { useValidation } from "../../../hooks/use-validation";
import { validateInput } from "../../../utils/generalUtils";

const categoryNameMaxLength = 50;

const CategoriesForm = ({ modelType, activeCategory, categories }) => {
  //   const [changeNameIsActive, setChangeNameIsActive] = useState(false);
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const [categoriesToUpdate, setCategoriesToUpdate] = useState([]);
  const [deleteCategoryData, setDeleteCategoryData] = useState("");
  const [categoriesInputs, setCategoriesInputs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();
  // const errorMessageAuth = useSelector((state) => state.auth.errorMessage);

  // const [categoryState, validateCategory] = useValidation({
  //   required: true,
  //   maxLength: CATEGORY_NAME_MAX_LENGTH,
  // });
  // const { isValid: categoryIsValid, errorMessage: categoryErrorMessage } =
  //   categoryState;

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
      // const newState = [...prevState];
      // console.log(newState);
      // console.log(e.target.id);
      // const curIndex = newState.findIndex((imageId) => {
      //   return imageId.id + "" === e.target.id;
      // });
      // newState[curIndex].value = e.target.value;
      // return newState;
      // const { isValid, errorMessage } = validateInput(
      //   {
      //     required: true,
      //     maxLength: CATEGORY_NAME_MAX_LENGTH,
      //   },
      //   e.target.value
      // );

      const newState = prevState.map((item) => {
        if (item.id === e.target.id) {
          return {
            ...item,
            value: e.target.value,
            isValid,
            // errorMessage,
          };
        }
        return item;
      });
      return newState;
    });
    // console.log(e.target.value);
    // validateCategory(e.target.value);
  };

  //Switch visibility of change name form
  const changeNameIsActiveHandler = (e) => {
    setErrorMessage("");
    const categoryId = e.target.dataset.id;

    setCategoriesInputs((prevState) => {
      console.log(prevState);
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
      // validateCategory(categoryName);

      const existedName = categoriesToUpdate.find(
        (category) => category.name === categoryName
      );

      const inputData = categoriesInputs.find((input) => input.id === id);

      if (!inputData.isValid) {
        return;
      }

      // if (categoryName.length > CATEGORY_NAME_MAX_LENGTH) {
      //   setErrorMessage(
      //     `Name can't be more then ${CATEGORY_NAME_MAX_LENGTH} symbols`
      //   );
      //   return;
      // }

      if (existedName) {
        // setErrorMessage(`The "${categoryName}" category already exists`);
        // return;
        throw new Error(`The "${categoryName}" category already exists`);
      }

      // if (!categoryIsValid) {
      //   setErrorMessage(categoryErrorMessage);
      //   return;
      // }

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

      console.log(categoriesData);

      dispatch(updateCategories(modelType, categoriesData));
      // setChangeNameIsActive(false);
    } catch (err) {
      setErrorMessage(err.message);
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
      console.log(updatedAllCategories);
      dispatch(updateCategories(modelType, updatedAllCategories));
    } else {
      console.log(updatedCategories);
      dispatch(updateCategories(modelType, updatedCategories));
    }

    // dispatch(updateCategories(modelType, updatedCategories));
    setDeleteRequestIsOpen(false);
  };

  const showDeleteReqeustHandler = (e) => {
    const categoryId = e.target.dataset.id;
    const categoryName = categoriesToUpdate.find(
      (category) => category.id === categoryId
    ).name;
    console.log(categoryName);
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
                // defaultValue={category.value}
                onChange={subCatHandler}
                value={category.value}
                validation={{
                  required: true,
                  maxLength: CATEGORY_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
                // error={categoryErrorMessage}
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
            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}
            {/* {errorMessageAuth && (
              <ErrorMessage className={classes["auth__error"]}>
                {errorMessageAuth}
              </ErrorMessage>
            )} */}
          </div>
        </div>
      </div>
      {deleteRequestIsOpen && (
        <DeleteRequest
          message={`Are you sure that you want to delete "${deleteCategoryData.name}" category? This action can't
        be reverted`}
          onSubmit={deleteCategoryHandler}
          onClose={closeDeleteReqeustHandler}
        />
      )}
    </section>
  );
};

export default CategoriesForm;
