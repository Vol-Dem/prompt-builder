import classes from "./Subcategories.module.scss";
import ModelsList from "../lora/ModelsList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";

const Subcategories = () => {
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const currTab = useSelector((state) => state.tabs.currTab);
  const catigories = useSelector((state) => state.tabs.categoriesData);
  // const subcats = useSelector((state) => state.tabs.subcategories);
  const loraSubcategories = useSelector((state) => state.tabs.modelsData);
  // const subcategories = catigories[activeCategory];
  // const uid = useSelector((state) => state.auth.user.uid);

  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentSubcategory(e.target.id));
  };

  const subcategoriesHtml = catigories[currTab][activeCategory]
    ?.toSorted()
    .map((category) => {
      return (
        <div
          id={category}
          onClick={categorySwitchHandler}
          key={category}
          className={`${classes[`subcategory__link`]} ${
            activeSubcategory === category ? classes.active : ""
          }`}
        >
          {category}
        </div>
      );
    });

  return (
    <div className={classes.category}>
      <div className={classes["subcategories"]}>{subcategoriesHtml}</div>
      {activeSubcategory && <ModelsList loraItems={loraSubcategories} />}
    </div>
  );
};

export default Subcategories;
