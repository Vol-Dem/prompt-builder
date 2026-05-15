import { useState, type MouseEvent } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./Subcategories.module.scss";
import { tabActions } from "../../../store/tabs";
import Modal from "../../ui/Modal";
import CategoriesForm from "../../forms/categories-form/CategoriesForm";
import OpenCategoryGuide from "../../general-elements/guide/home/OpenCategoryGuide";
import SubcategoryList from "../../ui/lists/SubcategoryList";
import ButtonCategoryAll from "../../ui/buttons/ButtonCategoryAll";
import CategoryListItem from "../../ui/lists/CategoryListItem";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Subcategories.
 *
 * Displays sorted model subcategories.
 *
 * Responsibilities:
 * - Supports switching between subcategories and "All models" view of active category.
 * - Loads model preview data from Firestore.
 * - Integrates guide flows.
 * - Handles edit flow
 *
 * @component
 *
 * @returns Subcategories components.
 */
const Subcategories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeSubcategory = useAppSelector(
    (state) => state.tabs.currSubcategory,
  );
  const activeCategory = useAppSelector((state) => state.tabs.currCategory);
  const activeTab = useAppSelector((state) => state.tabs.currTab);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const guideHomeState = useAppSelector((state) => state.guide.home);

  const dispatch = useAppDispatch();

  const categorySwitchHandler = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (activeSubcategory === e.target.dataset.value || !e.target.dataset.value)
      return;

    dispatch(tabActions.setCurrentSubcategory(e.target.dataset.value));
    dispatch(tabActions.resetModelsData());
  };

  const subcategoriesData = categories[activeTab].find(
    (category) => category.id === activeCategory,
  )?.subcategories;

  const subcategoriesHtml = subcategoriesData
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
    ?.map((subcategory, i) => {
      return (
        <CategoryListItem
          key={`${activeCategory}-${subcategory.id}`}
          onClick={categorySwitchHandler}
          dataValue={subcategory.id}
          active={activeSubcategory === subcategory.id}
          className={`${classes[`subcategory__link`]} ${
            activeSubcategory === subcategory.id ? classes.active : ""
          }`}
        >
          {subcategory.name}
          {guideHomeState?.active && i === 0 && <OpenCategoryGuide />}
        </CategoryListItem>
      );
    });

  const editCategoriesHandler = () => {
    setEditIsOpen(true);
  };

  return (
    <div className={classes.category}>
      {!!subcategoriesData?.length && (
        <SubcategoryList onEdit={editCategoriesHandler}>
          {" "}
          <ButtonCategoryAll
            onClick={categorySwitchHandler}
            activeCategory={activeSubcategory}
          />
          {subcategoriesHtml}
        </SubcategoryList>
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
              modelType={activeTab}
              activeCategory={activeCategory}
              categories={categories[activeTab]}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subcategories;
