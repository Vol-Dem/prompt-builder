import Subcategories from "../subcategories/Subcategories";
import classes from "./Categories.module.scss";
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

const Categories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const guideHomeState = useSelector((state) => state.guide.home);
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading
  );
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentCategory(e.target.dataset.value));
  };

  const catHtml = categories?.hasOwnProperty(activeTab)
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
            <motion.li
              key={`${activeTab}-${category.id}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              // initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
              // animate={ANIMATIONS_FM_SLIDEIN}
              // exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
              data-value={category.id}
              onClick={categorySwitchHandler}
              className={`${classes[`category__link`]} ${
                activeCategory === category.id ? classes.active : ""
              }`}
            >
              {category.name}
              {guideHomeState?.active && !activeCategory && i === 0 && (
                <OpenCategoryGuide />
              )}
            </motion.li>
          );
        })
    : [];

  const editCategoriesHandler = () => {
    setEditIsOpen(true);
  };

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>
        <motion.ul
          // initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          // animate={ANIMATIONS_FM_SLIDEIN}
          // exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
          className={classes["category__list"]}
        >
          <motion.li
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            data-value="all"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "all" ? classes.active : ""
            }`}
          >
            All
          </motion.li>
          {catHtml}
        </motion.ul>
        {!!catHtml?.length && (
          <ButtonTertiary
            type="button"
            className={classes["category__edit"]}
            onClick={editCategoriesHandler}
            title="Edit categories"
          >
            <EditSvg />
          </ButtonTertiary>
        )}
      </div>
      {!catHtml?.length && <div>No categories found</div>}
      {activeCategory && activeTab && categories && (
        <Subcategories
          subcategories={categories[activeTab][activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      {!categories && !userDataIsLoading && <div>Nothing is here...</div>}
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
