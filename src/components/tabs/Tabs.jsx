import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import { modelTypes } from "../../variables/constants";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import LinkA from "../ui/LinkA";
import Guide from "../ui/guide/Guide";
import Modal from "../ui/Modal";
import ArrowRightSvg from "../../assets/ArrowRight";
import { useState } from "react";
// import LoraForm from "../forms/lora/LoraForm";
// import GeneralForm from "../forms/general/GeneralForm";
// import EmbeddingsForm from "../forms/embeddings/EmbeddingsForm";

const Tabs = () => {
  const [guideIsOpen, setGuideIsOpen] = useState(true);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const activeCategory = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const formIsOpen = useSelector((state) => state.used.formIsOpen);
  const sidepanelIsOpen = useSelector((state) => state.used.panelIsOpen);
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
            <div className={classes.tip}>
              <p className={classes["tip__content__text"]}>
                To add a model, open the side panel using the button on the
                right and click "New resource". Copy the model ID or URL from
                the{" "}
                <LinkA external href="https://civitai.com">
                  Civitai
                </LinkA>{" "}
                , fill in the remaining fields and click "Save".
              </p>
              {guideIsOpen && sidepanelIsOpen && (
                <Guide
                  className={classes.guide}
                  stage={formIsOpen ? 2 : 1}
                  onClose={() => {
                    setGuideIsOpen(false);
                  }}
                ></Guide>
              )}
            </div>
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
