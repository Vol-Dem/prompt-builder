import classes from "./Subcategories.module.scss";
import ModelsList from "../lora/ModelsList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import ButtonTertiary from "../ui/ButtonTertiary";
import { useState } from "react";
import Modal from "../ui/Modal";
import CategoriesForm from "../forms/categories-form/CategoriesForm";
import EditSvg from "../../assets/EditSvg";

const Subcategories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);

  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentSubcategory(e.target.id));
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
        <li
          id={subcategory.id}
          onClick={categorySwitchHandler}
          key={i}
          className={`${classes[`subcategory__link`]} ${
            activeSubcategory === subcategory.id ? classes.active : ""
          }`}
        >
          {subcategory.name}
        </li>
      );
    });

  const editCategoriesHandler = () => {
    setEditIsOpen(true);
  };

  return (
    <div className={classes.category}>
      <div className={classes["subcategories-container"]}>
        <ul className={classes["subcategories"]}>{subcategoriesHtml}</ul>
        <ButtonTertiary
          className={classes["subcategories__edit"]}
          type="button"
          onClick={editCategoriesHandler}
        >
          <EditSvg />
        </ButtonTertiary>
      </div>

      {activeSubcategory && <ModelsList />}
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
    </div>
  );
};

export default Subcategories;
