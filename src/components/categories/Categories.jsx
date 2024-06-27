import Subcategories from "../subcategories/Subcategories";
import classes from "./Categories.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import ButtonTertiary from "../ui/ButtonTertiary";
import { useState } from "react";
import Modal from "../ui/Modal";
import CategoriesForm from "../forms/categories-form/CategoriesForm";
import EditSvg from "../../assets/EditSvg";

const Categories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentCategory(e.target.id));
    // dispatch(tabActions.setCurrentSubcategory(""));
    // dispatch(tabActions.setModelsData([]));
  };

  // const catHtml = categories?.hasOwnProperty(activeTab)
  //   ? Object.keys(categories[activeTab])
  //       .toSorted()
  //       .map((key) => {
  //         return (
  //           <div
  //             id={key}
  //             onClick={categorySwitchHandler}
  //             key={key}
  //             className={`${classes[`category__link`]} ${
  //               activeCategory === key ? classes.active : ""
  //             }`}
  //           >
  //             {key}
  //           </div>
  //         );
  //       })
  //   : [];
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
            <li
              id={category.id}
              onClick={categorySwitchHandler}
              key={i}
              className={`${classes[`category__link`]} ${
                activeCategory === category.id ? classes.active : ""
              }`}
            >
              {category.name}
            </li>
          );
        })
    : [];

  const editCategoriesHandler = () => {
    setEditIsOpen(true);
  };

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>
        <ul className={classes["category__list"]}>{catHtml}</ul>
        {categories && (
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
      {activeCategory && activeTab && categories && (
        <Subcategories
          subcategories={categories[activeTab][activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      {!categories && <div>Nothing is here...</div>}
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
    </div>
  );
};

export default Categories;
