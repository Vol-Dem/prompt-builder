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

const Subcategories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const guideHomeState = useSelector((state) => state.guide.home);

  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
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
        <motion.li
          key={`${activeCategory}-${subcategory.id}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          // initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          // animate={ANIMATIONS_FM_SLIDEIN}
          // exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
          data-value={subcategory.id}
          onClick={categorySwitchHandler}
          className={`${classes[`subcategory__link`]} ${
            activeSubcategory === subcategory.id ? classes.active : ""
          }`}
        >
          {subcategory.name}
          {guideHomeState?.active && i === 0 && <OpenCategoryGuide />}
        </motion.li>
      );
    });

  const editCategoriesHandler = () => {
    setEditIsOpen(true);
  };

  return (
    <div className={classes.category}>
      {!!subcategoriesData?.length && (
        <div className={classes["subcategories-container"]}>
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={classes["subcategories"]}
          >
            <motion.li
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              data-value="all"
              onClick={categorySwitchHandler}
              className={`${classes[`subcategory__link`]} ${
                classes[`subcategory__link--all`]
              } ${activeSubcategory === "all" ? classes.active : ""}`}
            >
              All
            </motion.li>
            {subcategoriesHtml}
          </motion.ul>
          <ButtonTertiary
            className={classes["subcategories__edit"]}
            type="button"
            onClick={editCategoriesHandler}
          >
            <EditSvg />
          </ButtonTertiary>
        </div>
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
