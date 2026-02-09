import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

import { getCollectionPreviews, imagesActions } from "../store/images";
import { useOnlineStatus } from "../hooks/use-online-status";
import useIntersection from "../hooks/use-intersection";
import { sortArrayBy } from "../utils/generalUtils";
import {
  DEFAULT_PAGE_TITLE,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
} from "../variables/constants";
import classes from "./Collections.module.scss";
import ErrorMessage from "../components/ui/ErrorMessage";
import Spinner from "../components/ui/Spinner";
import CollectionList from "../components/collection/collection-list/CollectionList";
import CategoryList from "../components/ui/lists/CategoryList";
import ButtonCategoryAll from "../components/ui/buttons/ButtonCategoryAll";
import SubcategoryList from "../components/ui/lists/SubcategoryList";
import CategoryListItem from "../components/ui/lists/CategoryListItem";
import Modal from "../components/ui/Modal";
import CategoriesForm from "../components/forms/categories-form/CategoriesForm";
import NotificationMessage from "../components/ui/NotificationMessage";
import TextButton from "../components/ui/text/text-buttons/TextButton";
import TextButtonCollection from "../components/ui/text/text-buttons/TextButtonCollection";
import Text from "../components/ui/text/Text";
import TextButtonCreate from "../components/ui/text/text-buttons/TextButtonCreate";

/**
 * Collections page.
 *
 * Top-level route responsible for displaying and managing user collections.
 *
 * Responsibilities:
 * - Displays collection categories and collection previews.
 * - Supports switching between categories and "All models" view.
 * - Loads collection preview data from Firestore.
 * - Handles loading, empty, and error states.
 * - Integrates onboarding and guide flows.
 * - Updates the document title.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.title - Page title.
 *
 * @returns {JSX.Element} Collections page.
 */
const Collections = ({ title }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const categories = useSelector((state) => state.images.categories);
  const collectionPreviews = useSelector(
    (state) => state.images.collectionPreviews,
  );
  const isLastPage = useSelector((state) => state.images.isLastPreviewsPage);
  const isLoading = useSelector((state) => state.images.previewsIsLoading);
  const errorMessage = useSelector(
    (state) => state.images.previewsErrorMessage,
  );
  const activeCategory = useSelector((state) => state.images.activeCategory);
  const activeSubcategory = useSelector(
    (state) => state.images.activeSubcategory,
  );
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const endPageRef = useRef(null);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();
  const subcategories = categories?.find(
    (category) => category.id === activeCategory,
  )?.subcategories;
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`,
  );

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title]);

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall, activeCategory, activeSubcategory]);

  const openCategoryHandler = (e) => {
    dispatch(imagesActions.setActiveCategory(e.target.dataset.value));
    dispatch(imagesActions.setActiveSubcategory(""));
    dispatch(imagesActions.setCollectionPreviews([]));
    dispatch(imagesActions.resetCollectionPreviews());
  };

  const openSubcategoryHandler = (e) => {
    dispatch(imagesActions.setActiveSubcategory(e.target.dataset.value));
    dispatch(imagesActions.setCollectionPreviews([]));
    dispatch(imagesActions.resetCollectionPreviews());
  };

  const categoriesHtml = sortArrayBy(categories, "name")?.map((category) => {
    return (
      <CategoryListItem
        key={category.id}
        onClick={openCategoryHandler}
        dataValue={category.id}
        active={category.id === activeCategory}
      >
        {category.name}
      </CategoryListItem>
    );
  });

  const subcategoriesHtml = sortArrayBy(subcategories, "name")?.map(
    (subcategory) => {
      return (
        <CategoryListItem
          key={subcategory.id}
          onClick={openSubcategoryHandler}
          dataValue={subcategory.id}
          active={subcategory.id === activeSubcategory}
          className={`${classes["subcategory"]} ${
            subcategory.id === activeSubcategory
              ? classes["subcategory--active"]
              : ""
          } ${classes["subcategory--border"]}`}
        >
          {subcategory.name}
        </CategoryListItem>
      );
    },
  );

  //Load previews on scroll
  useEffect(() => {
    const rule =
      activeSubcategory || activeCategory === "all" || !subcategories?.length;

    if (
      !isLastPage &&
      isIntersecting &&
      rule &&
      isOnline &&
      !isLoading &&
      activeCategory
    ) {
      setIsIntersecting(false);

      dispatch(
        getCollectionPreviews(
          activeCategory,
          activeSubcategory,
          !!collectionPreviews?.data?.length,
          nsfwMode,
        ),
      );
    }
  }, [
    isIntersecting,
    dispatch,
    isLastPage,
    collectionPreviews,
    nsfwMode,
    isOnline,
    activeCategory,
    activeSubcategory,
    isLoading,
    subcategories,
  ]);

  const editCategoriesHandler = (isSub) => {
    setIsSubcategory(isSub);
    setEditIsOpen(true);
  };

  return (
    <div>
      <div className={classes["categories-container"]}>
        {!!categories?.length && (
          <CategoryList onEdit={editCategoriesHandler.bind(null, false)}>
            <ButtonCategoryAll
              onClick={openCategoryHandler}
              className={`${activeCategory === "all" ? classes.active : ""}`}
              activeCategory={activeCategory}
            />
            {categoriesHtml}
          </CategoryList>
        )}
        {!categories?.length && (
          <>
            <NotificationMessage className={classes.notification}>
              <Text>You don't have any collections!</Text>
            </NotificationMessage>
            <NotificationMessage className={classes.notification}>
              <Text>
                To create a new collection, open sidebar and click the{" "}
                <TextButton>New resource</TextButton> button and select{" "}
                <TextButtonCollection />. Then enter and click{" "}
                <TextButtonCreate /> for the category, subcategories, and the
                collection name then click <TextButton>Create</TextButton>.
              </Text>
              <Text>
                In this case, an empty collection will appear and it will be
                available in the dropdown list when saving images later.
              </Text>
            </NotificationMessage>
          </>
        )}
        {!!activeCategory &&
          activeCategory !== "all" &&
          !!subcategories?.length && (
            <SubcategoryList onEdit={editCategoriesHandler.bind(null, true)}>
              <ButtonCategoryAll
                onClick={openSubcategoryHandler}
                className={`${
                  activeSubcategory === "all" ? classes.active : ""
                }`}
                activeCategory={activeSubcategory}
              />
              {subcategoriesHtml}
            </SubcategoryList>
          )}
      </div>
      {activeCategory && (activeSubcategory || !subcategories?.length) && (
        <CollectionList />
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPageRef}></div>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
      <AnimatePresence>
        {editIsOpen && (
          <Modal
            title="Subcategories"
            onClose={() => {
              setEditIsOpen(false);
            }}
          >
            <CategoriesForm
              modelType="collections"
              activeCategory={isSubcategory ? activeCategory : null}
              categories={categories}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collections;
