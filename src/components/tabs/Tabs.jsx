import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
// import LoraForm from "../forms/lora/LoraForm";
// import GeneralForm from "../forms/general/GeneralForm";
// import EmbeddingsForm from "../forms/embeddings/EmbeddingsForm";

const Tabs = () => {
  const activeCategory = useSelector((state) => state.tabs.currTab);
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    console.log("RESET");
    // dispatch(tabActions.reset());
    dispatch(tabActions.setCurrentTab(e.target.id));
    dispatch(tabActions.setCurrentSubcategory(""));
  };

  return (
    <>
      <div className={classes["tag-menu"]}>
        <div className={classes["tag-menu__labels"]}>
          <div
            id="general"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "general" ? classes.active : ""
            }`}
          >
            General tags
          </div>
          <div
            id="models"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "models" ? classes.active : ""
            }`}
          >
            Lora
          </div>
          <div
            id="embeddings"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "embeddings" ? classes.active : ""
            }`}
          >
            Embeddings
          </div>
          <div
            id="checkpoints"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "checkpoints" ? classes.active : ""
            }`}
          >
            Checkpoint
          </div>
        </div>
        <div>{activeCategory && <Categories category={activeCategory} />}</div>
      </div>
    </>
  );
};

export default Tabs;
