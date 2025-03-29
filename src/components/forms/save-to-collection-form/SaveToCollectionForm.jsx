import { useCallback, useEffect, useMemo, useState } from "react";
import Buttton from "../../ui/Button";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import classes from "./SaveToCollectionForm.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../../ui/Spinner";
import CheckSvg from "../../../assets/CheckSvg";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  // SUBCATEGORIES_MAX_AMOUNT,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_NO_IMAGE_SELECTED,
  SUCCESS_MESSAGE_SAVED,
} from "../../../variables/constants";
import { AnimatePresence, motion } from "framer-motion";
import ComboSelect from "../../ui/ComboSelect";
import Fieldset from "../../ui/Fieldset";
import ButttonSecondary from "../../ui/ButtonSecondary";
import ButtonTertiary from "../../ui/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import {
  createCategoryId,
  filterDuplicates,
  sortArrayBy,
  throwCustomError,
} from "../../../utils/generalUtils";
import {
  addNewCollectionCategories,
  savePostToCollections,
} from "../../../store/images";
import { getCollectionData } from "../../../utils/fetchUtils";
import SuccessMessage from "../../ui/SuccessMessage";
import { Link } from "react-router-dom";

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
  //   collectionInfo,
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
  const [categoriesIsUpdating, setCategoriesIsUpdating] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState({});
  const [curCollectionSubcategories, setCurCollectionSubcategories] = useState(
    []
  );
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
  // const subcategories = useSelector((state) => state.images.subcategories);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();

  const mainCategoryOptions = useMemo(() => {
    const categoriesOptions = categories.filter((category) =>
      category.name
        .trim()
        .toLowerCase()
        .includes(mainCategoryQuery.toLowerCase())
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
              .includes(collectionNameQuery.toLowerCase());
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

  // const getSavedImagesInfo = useCallback(async () => {
  //   if (!collectionInfo?.collectionData?.id) return;
  //   console.log("START");
  //   setCollectionInfoIsLoading(true);
  //   const collectionData = await getCollectionData(
  //     collectionInfo.collectionData.id
  //   );
  //   console.log(collectionData);
  //   const postData = collectionData?.posts?.find(
  //     (post) => post.postId === postId
  //   );

  //   if (postData?.imageIds?.length) {
  //     setSavedPostData(postData);
  //   }
  //   setCollectionInfoIsLoading(false);
  //   setChooseImageIsOpen(true);
  // }, []);

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

        const curSubcategories = categories.find(
          (category) => category.id === mainCategorySelected.id
        ).subcategories;
        curCollectionSabcategories = collectionData.subcategories;
        // console.log(collectionData.subcategories);
        // return;
        // curCollectionSabcategories = collectionData.subcategories.map(
        //   (subcategoryId) => {
        //     return {
        //       id: subcategoryId,
        //       name: curSubcategories.find(
        //         (subcategory) => subcategory.id === subcategoryId
        //       ).name,
        //     };
        //   }
        // );
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

      // console.log(subcategories);

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
        // postId,
      };

      // console.log(collectionInputData);
      // setCategoriesIsUpdating(true);
      const categoriesWithId = await dispatch(
        addNewCollectionCategories(collectionInputData)
      );
      // console.log("TEST", categoriesWithId);
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
      // setCategoriesIsUpdating(false);
      setCollectionInfoIsLoading(false);
    }
  };

  // useEffect(() => {

  //   getSavedImagesInfo();
  // }, [collectionInfo, postId]);

  return (
    <>
      {!chooseImageIsOpen && (
        <form onSubmit={submitHandler}>
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
                  // onClick={() => {
                  //   if (savedModel !== curModel.id) {
                  //     dispatch(modelActions.resetModelData());
                  //   }
                  // }}
                >
                  Show collection
                </Link>
              </>
            )}
          </div>
          <Buttton type="submit" className={classes.submit}>
            {collectionInfoIsLoading || categoriesIsUpdating ? (
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
          curCollectionSubcategories={curCollectionSubcategories}
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
