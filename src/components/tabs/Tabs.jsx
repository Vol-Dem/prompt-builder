import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import { MODEL_TYPES } from "../../variables/constants";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import LinkA from "../ui/LinkA";
import Guide from "../ui/guide/Guide";
import { useState } from "react";
import OpenCategoryGuide from "../ui/guide/home/OpenCategoryGuide";
import Modal from "../ui/Modal";
import IntroGuide from "../ui/guide/IntroGuide";
import { guideActions } from "../../store/guide";

const Tabs = () => {
  const [guideIsOpen, setGuideIsOpen] = useState(true);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const activeCategory = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const formIsOpen = useSelector((state) => state.used.formIsOpen);
  const sidepanelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const guideHomeState = useSelector((state) => state.guide.home);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideIntroIsDisabled = useSelector(
    (state) => state.guide.introDisabled
  );
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading
  );
  const userDataLoadError = useSelector(
    (state) => state.auth.userDataLoadError
  );
  const dispatch = useDispatch();

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentTab(e.target.id));
  };

  const modelTypesHtml = Object.keys(categories)
    .map((categoryId) => {
      const modelTypeInfo = MODEL_TYPES.find(
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
          {guideHomeState?.active && i === 0 && !activeCategory && (
            <OpenCategoryGuide />
          )}
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
              {guideIsOpen &&
                sidepanelIsOpen &&
                !authIsOpen &&
                !userDataIsLoading &&
                !userDataLoadError && (
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
        <div className={classes["guide-intro"]}>
          {userDataLoadError && (
            <ErrorMessage>{userDataLoadError}</ErrorMessage>
          )}

          {!guideIntroIsDisabled &&
            !guideIsActive &&
            !!modelTypesHtml?.length && (
              <Modal
                onClose={() => {
                  dispatch(guideActions.setIntroDisabled(true));
                }}
                // disableClass={classes["guide-intro"]}
              >
                <IntroGuide />
              </Modal>
            )}
        </div>
      </div>
    </>
  );
};

export default Tabs;
