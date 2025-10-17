import { useEffect, useRef, useState } from "react";
import classes from "./Images.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { getCollectionPreviews, imagesActions } from "../../store/images";
import { useOnlineStatus } from "../../hooks/use-online-status";
import ErrorMessage from "../ui/ErrorMessage";
import Spinner from "../ui/Spinner";
import {
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
} from "../../variables/constants";
import CollectionList from "../collection/collection-list/CollectionList";
import CategoryList from "../ui/lists/CategoryList";
import ButtonCategoryAll from "../ui/buttons/ButtonCategoryAll";
import SubcategoryList from "../ui/lists/SubcategoryList";
import CategoryListItem from "../ui/lists/CategoryListItem";
import Modal from "../ui/Modal";
import { AnimatePresence } from "framer-motion";
import CategoriesForm from "../forms/categories-form/CategoriesForm";
import { sortArrayBy } from "../../utils/generalUtils";
import NotificationMessage from "../ui/NotificationMessage";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextButtonCollection from "../ui/text/text-buttons/TextButtonCollection";
import Text from "../ui/text/Text";
import TextButtonCreate from "../ui/text/text-buttons/TextButtonCreate";
import useIntersection from "../../hooks/use-intersection";

const Images = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const categories = useSelector((state) => state.images.categories);
  const collectionPreviews = useSelector(
    (state) => state.images.collectionPreviews
  );
  const isLastPage = useSelector((state) => state.images.isLastPreviewsPage);
  const isLoading = useSelector((state) => state.images.previewsIsLoading);
  const errorMessage = useSelector(
    (state) => state.images.previewsErrorMessage
  );
  const activeCategory = useSelector((state) => state.images.activeCategory);
  const activeSubcategory = useSelector(
    (state) => state.images.activeSubcategory
  );
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const endPageRef = useRef(null);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();
  const subcategories = categories?.find(
    (category) => category.id === activeCategory
  )?.subcategories;
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`
  );

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall]);

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
    (subcategory, i) => {
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
    }
  );

  //Load initial previews
  useEffect(() => {
    const rule =
      activeSubcategory || activeCategory === "all" || !subcategories?.length;
    if (
      !collectionPreviews?.data?.length &&
      !isLastPage &&
      isOnline &&
      rule &&
      activeCategory
    ) {
      dispatch(
        getCollectionPreviews(
          activeCategory,
          activeSubcategory,
          false,
          nsfwMode
        )
      );
    }
  }, [
    dispatch,
    collectionPreviews,
    nsfwMode,
    isLastPage,
    isOnline,
    activeCategory,
    activeSubcategory,
    subcategories,
  ]);

  //Load previews on scroll
  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !!collectionPreviews?.data?.length &&
      isOnline &&
      !isLoading
    ) {
      clearTimeout(timeoutRef.current);
      setIsIntersecting(false);
      timeoutRef.current = setTimeout(() => {
        dispatch(
          getCollectionPreviews(
            activeCategory,
            activeSubcategory,
            true,
            nsfwMode
          )
        );
      }, 1000);
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
              {/* <p className={classes["tip__content__text"]}>
                To create a new collection, open the side panel using the button
                on the right and click "New resource". Fill in the requered
                fields and click "Save".
              </p> */}
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
              {/* <TextImageBlock>
                <Image
                  loading="lazy"
                  width={1909}
                  height={918}
                  fullView={true}
                  className={classes["img"]}
                  src={require("../../assets/about/21-collections-sidebar.jpg")}
                  alt="Collections model 5"
                  srcSet={require("../../assets/about/21-collections-sidebar.webp")}
                  type="image/webp"
                />
              </TextImageBlock> */}
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

export default Images;
