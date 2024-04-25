import classes from "./Subcategories.module.scss";
import ModelsList from "../lora/ModelsList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import ButtonTertiary from "../ui/ButtonTertiary";
import { useState } from "react";
import Modal from "../ui/Modal";
import CategoriesForm from "../forms/categories-form/CategoriesForm";

const Subcategories = () => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  // const subcats = useSelector((state) => state.tabs.subcategories);
  const loraSubcategories = useSelector((state) => state.tabs.modelsData);
  // const subcategories = categories[activeCategory];
  // const uid = useSelector((state) => state.auth.user.uid);

  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentSubcategory(e.target.id));
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
        <ButtonTertiary type="button" onClick={editCategoriesHandler}>
          Edit
        </ButtonTertiary>
      </div>

      {activeSubcategory && <ModelsList loraItems={loraSubcategories} />}
      {editIsOpen && (
        <Modal
          title="Categories"
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
