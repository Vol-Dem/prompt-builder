import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import { modelTypes } from "../../variables/constants";
// import LoraForm from "../forms/lora/LoraForm";
// import GeneralForm from "../forms/general/GeneralForm";
// import EmbeddingsForm from "../forms/embeddings/EmbeddingsForm";

const Tabs = () => {
  const activeCategory = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    // dispatch(tabActions.reset());
    dispatch(tabActions.setCurrentTab(e.target.id));
    // dispatch(tabActions.setCurrentSubcategory(""));
  };

  const modelTypesHtml = Object.keys(categories)
    .map((categoryId) => {
      const modelTypeInfo = modelTypes.find(
        (modelType) => modelType.value === categoryId
      );

      return {
        id: categoryId,
        name: modelTypeInfo.name,
        position: modelTypeInfo.position,
      };
    })
    .sort((a, b) => a.position - b.position)
    .map((category, i) => {
      return (
        <li
          key={i}
          id={category.id}
          onClick={categorySwitchHandler}
          className={`${classes[`category__link`]} ${
            activeCategory === category.id ? classes.active : ""
          }`}
        >
          {category.name}
        </li>
      );
    });

  return (
    <>
      <div className={classes["tag-menu"]}>
        <ul className={classes["tag-menu__labels"]}>
          {/* <div
            id="general"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "general" ? classes.active : ""
            }`}
          >
            General tags
          </div> */}
          {modelTypesHtml}
          {/* <div
            id="lora"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "lora" ? classes.active : ""
            }`}
          >
            Lora
          </div>
          <div
            id="embedding"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "embedding" ? classes.active : ""
            }`}
          >
            Embeddings
          </div>
          <div
            id="checkpoint"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "checkpoint" ? classes.active : ""
            }`}
          >
            Checkpoint
          </div> */}
        </ul>
        <div>{activeCategory && <Categories category={activeCategory} />}</div>
      </div>
    </>
  );
};

export default Tabs;
