import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import Subcategories from "../subcategories/Subcategories";
import classes from "./Categories.module.scss";
import { getModelsPreview, tabActions } from "../../../store/tabs";
import Modal from "../../ui/Modal";
import CategoriesForm from "../../forms/categories-form/CategoriesForm";
import OpenCategoryGuide from "../../general-elements/guide/home/OpenCategoryGuide";
import CategoryList from "../../ui/lists/CategoryList";
import ButtonCategoryAll from "../../ui/buttons/ButtonCategoryAll";
import CategoryListItem from "../../ui/lists/CategoryListItem";
import NotificationMessage from "../../ui/NotificationMessage";

/**
 * Categories.
 *
 * Displays sorted model categories.
 *
 * Responsibilities:
 * - Supports switching between categories and "All models" view of active tub.
 * - Loads model preview data from Firestore.
 * - Integrates guide flows.
 * - Handles edit flow
 *
 * @component
 *
 * @returns {JSX.Element} Categories component.
 */
const Categories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const guideHomeState = useSelector((state) => state.guide.home);
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading,
  );
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    if (activeCategory === e.target.dataset.value) return;
    dispatch(tabActions.setCurrentCategory(e.target.dataset.value));
    if (e.target.dataset.value === "all") {
      dispatch(
        getModelsPreview(
          activeTab,
          e.target.dataset.value,
          null,
          false,
          nsfwMode,
        ),
      );
    }
  };

  const catHtml =
    categories && Object.hasOwn(categories, activeTab)
      ? categories[activeTab]
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
          .map((category, i) => {
            return (
              <CategoryListItem
                key={`${activeTab}-${category.id}`}
                onClick={categorySwitchHandler}
                dataValue={category.id}
                active={activeCategory === category.id}
                className={`${
                  activeCategory === category.id ? classes.active : ""
                }`}
              >
                {category.name}
                {guideHomeState?.active && !activeCategory && i === 0 && (
                  <OpenCategoryGuide />
                )}
              </CategoryListItem>
            );
          })
      : [];

  const editCategoriesHandler = () => {
    setEditIsOpen(true);
  };

  return (
    <div className={classes["container"]}>
      <>
        {!!catHtml?.length && (
          <CategoryList
            activeCategory={activeCategory}
            onClick={categorySwitchHandler}
            className={classes["category__list"]}
            onEdit={editCategoriesHandler}
          >
            <ButtonCategoryAll
              onClick={categorySwitchHandler}
              className={`${activeCategory === "all" ? classes.active : ""}`}
              activeCategory={activeCategory}
            />
            {catHtml}
          </CategoryList>
        )}
      </>
      {!catHtml?.length && !userDataIsLoading && (
        <NotificationMessage>No categories found</NotificationMessage>
      )}
      {activeCategory && activeTab && categories && (
        <Subcategories
          subcategories={categories[activeTab][activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      <AnimatePresence>
        {editIsOpen && (
          <Modal
            title="Categories"
            onClose={() => {
              setEditIsOpen(false);
            }}
          >
            <CategoriesForm
              modelType={activeTab}
              categories={categories[activeTab]}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
