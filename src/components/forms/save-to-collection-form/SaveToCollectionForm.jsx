import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import Buttton from "../../ui/Button";
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
} from "../../../variables/constants";
import ComboSelect from "../../ui/ComboSelect";
import Fieldset from "../../ui/Fieldset";
import ButttonSecondary from "../../ui/ButtonSecondary";
import ButtonTertiary from "../../ui/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import {
  filterDuplicates,
  sortArrayBy,
  throwCustomError,
} from "../../../utils/generalUtils";
import { addNewCollectionCategories } from "../../../store/images";
import SuccessMessage from "../../ui/SuccessMessage";
import { getCollectionData } from "../../../utils/fetch/fetchCollection";

const SUBCATEGORIES_MAX_AMOUNT = 8;
const subCatsDefData = {
  type: "text",
  id: "subcat-def",
  name: "sub",
  placeholder: "Subcategory",
  value: "",
  query: "",
  selected: { id: null, name: "" },
  isValid: true,
  errorMessage: "",
};

const SaveToCollectionForm = ({
  postId,
  type,
  location,
  images,
  modelId,
  versionId,
  activeImageIndex,
  existedImgsAmount,
  onSave,
  isDeleting,
}) => {
  const [chooseImageIsOpen, setChooseImageIsOpen] = useState(false);
  const [collectionInfoIsLoading, setCollectionInfoIsLoading] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState({});
  const [savedPostData, setSavedPostData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mainCategoryQuery, setMainCategoryQuery] = useState("");
  const [mainCategorySelected, setMainCategorySelected] = useState({
    name: "",
    id: "",
    isValid: false,
  });
  const [collectionNameQuery, setCollectionNameQuery] = useState("");
  const [collectionNameSelected, setCollectionNameSelected] = useState({
    name: "",
    id: "",
    isValid: false,
  });
  const [subCatInputs, setSubCatInputs] = useState([]);
  const [subCategoryQuery, setSubCategoryQuery] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const categories = useSelector((state) => state.images.categories);
  const dispatch = useDispatch();

  const mainCategoryOptions = useMemo(() => {
    const categoriesOptions = categories.filter((category) =>
      category.name
        .trim()
        .toLowerCase()
        .includes(mainCategoryQuery.trim().toLowerCase())
    );
    return sortArrayBy(categoriesOptions, "name");
  }, [categories, mainCategoryQuery]);

  const inputSubcatIds = subCatInputs.flatMap((subcat) => {
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
              (subcategoryId) => inputSubcatIds?.includes(subcategoryId)
            );

            const isInQuery = collection.name
              .toLowerCase()
              .includes(collectionNameQuery.trim().toLowerCase());
            return inputSubcatIds?.length
              ? isInSubcategories && isInQuery
              : isInQuery;
          }) || [],
        "name"
      )
    : [];

  const subcategories = categories.find(
    (category) => category.name === mainCategorySelected.name
  )?.subcategories;

  const subCategoryOptions =
    sortArrayBy(
      subcategories?.filter((subcategory) =>
        subcategory.name
          .toLowerCase()
          .includes(subCategoryQuery.trim().toLowerCase())
      ),
      "name"
    ) || [];

  const selectMainCategoryHandler = (value, isValid, errorMessage) => {
    setMainCategorySelected({ ...value, isValid, errorMessage });
    setCollectionNameSelected({
      name: "",
      id: "",
      isValid: false,
    });
    setSubCatInputs([
      { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
    ]);
  };

  const selectCollectionNameHandler = (value, isValid, errorMessage) => {
    setCollectionNameSelected({ ...value, isValid, errorMessage });
  };

  useEffect(() => {
    setSubCatInputs([
      { ...subCatsDefData, selected: { ...subCatsDefData.selected } },
    ]);
  }, []);

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
            <CrossSvg />
          </ButtonTertiary>
        )}
      </motion.div>
    );
  });

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");
      const subcategoriesIsInvalid = !!subCatInputs.find(
        (subcategory) => !subcategory.isValid
      );
      if (
        !collectionNameSelected.isValid ||
        !mainCategorySelected.isValid ||
        subcategoriesIsInvalid
      ) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      setCollectionInfoIsLoading(true);

      let curCollectionSabcategories;
      let postData;

      if (mainCategorySelected?.id && collectionNameSelected?.id) {
        const collectionData = await getCollectionData(
          collectionNameSelected.id
        );
        postData = collectionData?.posts?.find(
          (post) => post.postId === postId
        );

        curCollectionSabcategories = collectionData.subcategories;
      } else {
        curCollectionSabcategories = [];
      }

      const inputSubcatsData = subCatInputs.flatMap((subcat) => {
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
        }
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
        addNewCollectionCategories(collectionInputData)
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
      console.log(err);
      setErrorMessage(err.errorMessage);
      setShowErrorMessage(true);
    } finally {
      setCollectionInfoIsLoading(false);
    }
  };

  return (
    <>
      {!chooseImageIsOpen && (
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
          <Buttton type="submit" className={classes.submit}>
            {collectionInfoIsLoading ? (
              <Spinner size="small" />
            ) : images?.length ? (
              "Choose images"
            ) : (
              "Create"
            )}
          </Buttton>
        </form>
      )}
      {chooseImageIsOpen && (
        <ChooseImageForm
          postId={postId}
          type={type}
          location={location}
          collectionInfo={collectionInfo}
          modelId={modelId}
          postData={savedPostData}
          savedImageIds={savedPostData.imageIds}
          versionId={versionId}
          images={images}
          activeImageIndex={activeImageIndex}
          existedImgsAmount={existedImgsAmount}
          onSave={onSave}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default SaveToCollectionForm;
