import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import classes from "./Tabs.module.scss";
import Categories from "../categories/Categories";
import { getModelsPreview, tabActions } from "../../store/tabs";
import { MODEL_TYPES } from "../../variables/constants";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import LinkA from "../ui/LinkA";
import Guide from "../ui/guide/Guide";
import OpenCategoryGuide from "../ui/guide/home/OpenCategoryGuide";
import Modal from "../ui/Modal";
import IntroGuide from "../ui/guide/IntroGuide";
import { guideActions } from "../../store/guide";
import ModelsList from "../models-list/ModelsList";
import CategoryList from "../ui/lists/CategoryList";
import ButtonCategoryAll from "../ui/buttons/ButtonCategoryAll";
import CategoryListItem from "../ui/lists/CategoryListItem";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import NotificationMessage from "../ui/NotificationMessage";
import Text from "../ui/text/Text";

const Tabs = () => {
  const [guideIsOpen, setGuideIsOpen] = useState(true);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
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
    if (activeTab === e.target.dataset.value) return;
    dispatch(tabActions.setCurrentTab(e.target.dataset.value));
    if (e.target.dataset.value === "all") {
      dispatch(
        getModelsPreview(e.target.dataset.value, null, null, false, nsfwMode)
      );
    }
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
        <CategoryListItem
          key={category.id}
          dataValue={category.id}
          onClick={categorySwitchHandler}
          active={activeTab === category.id}
        >
          {category.name}
          {guideHomeState?.active && i === 0 && !activeTab && (
            <OpenCategoryGuide />
          )}
        </CategoryListItem>
      );
    });

  return (
    <>
      <div className={classes["tag-menu"]}>
        {!!modelTypesHtml?.length && (
          <CategoryList
            activeCategory={activeTab}
            onClick={categorySwitchHandler}
            className={classes["tag-menu__labels"]}
          >
            <ButtonCategoryAll
              onClick={categorySwitchHandler}
              className={`${classes[`category__link`]} ${
                activeTab === "all" ? classes.active : ""
              }`}
              activeCategory={activeTab}
            />
            {modelTypesHtml}
          </CategoryList>
        )}
        {activeTab && activeTab !== "all" && (
          <div>
            <Categories category={activeTab} />
          </div>
        )}
        {!userDataIsLoading &&
          !modelTypesHtml?.length &&
          !userDataLoadError &&
          isAuth && (
            <div>
              <NotificationMessage className={classes.notification}>
                <Text>You don't have any models!</Text>
              </NotificationMessage>
              <NotificationMessage className={classes.notification}>
                <Text>
                  To add a model,{" "}
                  <TextHighlight>open the side panel</TextHighlight> using the
                  button on the right and click{" "}
                  <TextButton>New resource</TextButton>. Copy the model{" "}
                  <TextHighlight>ID</TextHighlight> or{" "}
                  <TextHighlight>URL</TextHighlight> from the{" "}
                  <LinkA external href="https://civitai.com">
                    Civitai
                  </LinkA>{" "}
                  , fill in the remaining fields and click{" "}
                  <TextButton className={classes.save}>Save</TextButton>
                </Text>
              </NotificationMessage>
              <p className={classes["tip__content__text"]}></p>
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
              >
                <IntroGuide />
              </Modal>
            )}
        </div>
        {activeTab && <ModelsList />}
      </div>
    </>
  );
};

export default Tabs;
