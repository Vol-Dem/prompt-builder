import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { sortArrayBy } from "../utils/generalUtils";
import { ERROR_MESSAGE_OFFLINE } from "../variables/constants";
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
import useCollectionPreviewsController from "../hooks/use-collection-previews-controller";
import usePageTitle from "../hooks/use-page-title";

interface CollectionsProps {
  title: string;
}

/** Displays collection categories, previews, feedback, and category editing. */
const Collections = ({ title }: CollectionsProps) => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const { categories, subcategories, status, endPageRef } = useCollectionPreviewsController();

  usePageTitle(title);

  const categoriesHtml = sortArrayBy(categories.items, "name")?.map((category) => {
    return (
      <CategoryListItem
        key={category.id}
        onClick={categories.onSelect}
        dataValue={category.id}
        active={category.id === categories.activeId}
      >
        {category.name}
      </CategoryListItem>
    );
  });

  const subcategoriesHtml =
    subcategories.items &&
    sortArrayBy(subcategories.items, "name")?.map((subcategory) => {
      return (
        <CategoryListItem
          key={subcategory.id}
          onClick={subcategories.onSelect}
          dataValue={subcategory.id}
          active={subcategory.id === subcategories.activeId}
          className={`${classes["subcategory"]} ${
            subcategory.id === subcategories.activeId
              ? classes["subcategory--active"]
              : ""
          } ${classes["subcategory--border"]}`}
        >
          {subcategory.name}
        </CategoryListItem>
      );
    });

  const editCategoriesHandler = (isSub: boolean) => {
    setIsSubcategory(isSub);
    setEditIsOpen(true);
  };

  return (
    <div>
      <div className={classes["categories-container"]}>
        {!!categories.items?.length && (
          <CategoryList onEdit={editCategoriesHandler.bind(null, false)}>
            <ButtonCategoryAll
              onClick={categories.onSelect}
              className={`${categories.activeId === "all" ? classes.active : ""}`}
              activeCategory={categories.activeId}
            />
            {categoriesHtml}
          </CategoryList>
        )}
        {!categories.items?.length && (
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
        {!!categories.activeId &&
          categories.activeId !== "all" &&
          !!subcategories.items?.length && (
            <SubcategoryList onEdit={editCategoriesHandler.bind(null, true)}>
              <ButtonCategoryAll
                onClick={subcategories.onSelect}
                className={`${
                  subcategories.activeId === "all" ? classes.active : ""
                }`}
                activeCategory={subcategories.activeId}
              />
              {subcategoriesHtml}
            </SubcategoryList>
          )}
      </div>
      {categories.activeId && (subcategories.activeId || !subcategories.items?.length) && (
        <CollectionList />
      )}
      {status.errorMessage && <ErrorMessage>{status.errorMessage}</ErrorMessage>}
      {!status.isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPageRef}></div>
      {status.isLoading && (
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
              activeCategory={isSubcategory ? categories.activeId : null}
              categories={categories.items}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collections;
