import classes from "./Subcategories.module.scss";
import ModelsList from "../lora/ModelsList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import ButtonTertiary from "../ui/ButtonTertiary";
import { useState } from "react";
import Modal from "../ui/Modal";
import CategoriesForm from "../forms/categories-form/CategoriesForm";
import EditSvg from "../../assets/EditSvg";
import OpenCategoryGuide from "../ui/guide/home/OpenCategoryGuide";
import { AnimatePresence, motion } from "framer-motion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";
import SubcategoryList from "../ui/lists/SubcategoryList";
import ButtonCategoryAll from "../ui/buttons/ButtonCategoryAll";
import CategoryListItem from "../ui/lists/CategoryListItem";

const Subcategories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const guideHomeState = useSelector((state) => state.guide.home);

  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    if (activeSubcategory === e.target.dataset.value) return;
    dispatch(tabActions.setCurrentSubcategory(e.target.dataset.value));
    dispatch(tabActions.resetModelsData());
  };

  const subcategoriesData = categories[activeTab].find(
    (category) => category.id === activeCategory
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
        // <motion.li
        //   key={`${activeCategory}-${subcategory.id}`}
        //   initial={{ opacity: 0, y: -5 }}
        //   animate={{ opacity: 1, y: 0 }}
        //   transition={{ duration: 0.3 }}
        //   // initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        //   // animate={ANIMATIONS_FM_SLIDEIN}
        //   // exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
        //   data-value={subcategory.id}
        //   onClick={categorySwitchHandler}
        //   className={`${classes[`subcategory__link`]} ${
        //     activeSubcategory === subcategory.id ? classes.active : ""
        //   }`}
        // >
        //   {subcategory.name}
        //   {guideHomeState?.active && i === 0 && <OpenCategoryGuide />}
        // </motion.li>
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
      {/* {activeSubcategory && <ModelsList />} */}
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
