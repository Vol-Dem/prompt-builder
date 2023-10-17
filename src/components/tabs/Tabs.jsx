import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import LoraForm from "../forms/lora/LoraForm";
import GeneralForm from "../forms/general/GeneralForm";
import EmbeddingsForm from "../forms/embeddings/EmbeddingsForm";

const Tabs = () => {
  const activeCategory = useSelector((state) => state.tabs.currTab);
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    console.log("RESET");
    dispatch(tabActions.reset());
    dispatch(tabActions.setCurrentTab(e.target.id));
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
            id="models preview"
            onClick={categorySwitchHandler}
            className={`${classes[`category__link`]} ${
              activeCategory === "models preview" ? classes.active : ""
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
        </div>
        <div>{activeCategory && <Categories category={activeCategory} />}</div>
      </div>
      <div className={classes.forms}>
        <h3>Lora</h3>
        <LoraForm />
        <h3>General</h3>
        <GeneralForm />
        <h3>Embeddings</h3>
        <EmbeddingsForm />
      </div>
    </>
  );
};

export default Tabs;
