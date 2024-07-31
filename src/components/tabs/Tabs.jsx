import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import { modelTypes } from "../../variables/constants";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
// import LoraForm from "../forms/lora/LoraForm";
// import GeneralForm from "../forms/general/GeneralForm";
// import EmbeddingsForm from "../forms/embeddings/EmbeddingsForm";

const Tabs = () => {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const activeCategory = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading
  );
  const userDataLoadError = useSelector(
    (state) => state.auth.userDataLoadError
  );
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
        {!!modelTypesHtml?.length && (
          <ul className={classes["tag-menu__labels"]}>{modelTypesHtml}</ul>
        )}
        {activeCategory && (
          <div>
            <Categories category={activeCategory} />
          </div>
        )}
        {!userDataIsLoading &&
          !modelTypesHtml?.length &&
          !userDataLoadError &&
          isAuth && (
            <span className={classes.tip}>
              Use "New resource" button at the top right to add your first model
            </span>
          )}
        {userDataIsLoading && (
          <div>
            <Spinner size="medium" />
          </div>
        )}
        {userDataLoadError && <ErrorMessage>{userDataLoadError}</ErrorMessage>}
      </div>
    </>
  );
};

export default Tabs;
