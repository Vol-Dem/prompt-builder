import Subcategories from "../subcategories/Subcategories";
import classes from "./Categories.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";

const Categories = () => {
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentCategory(e.target.id));
    // dispatch(tabActions.setCurrentSubcategory(""));
    // dispatch(tabActions.setModelsData([]));
  };

  const catHtml = categories?.hasOwnProperty(activeTab)
    ? Object.keys(categories[activeTab])
        .toSorted()
        .map((key) => {
          return (
            <div
              id={key}
              onClick={categorySwitchHandler}
              key={key}
              className={`${classes[`category__link`]} ${
                activeCategory === key ? classes.active : ""
              }`}
            >
              {key}
            </div>
          );
        })
    : [];

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{catHtml}</div>
      {activeCategory && (
        <Subcategories
          subcategories={categories[activeTab][activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      {!categories && <div>Nothing is here...</div>}
    </div>
  );
};

export default Categories;
