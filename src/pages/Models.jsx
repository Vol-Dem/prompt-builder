import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import classes from "./Models.module.scss";
import { getModelsPreview, tabActions } from "../store/tabs";
import { guideActions } from "../store/guide";
import { DEFAULT_PAGE_TITLE, MODEL_TYPES } from "../variables/constants";
import Categories from "../components/models/categories/Categories";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import LinkA from "../components/ui/LinkA";
import QuickStartGuide from "../components/general-elements/guide/QuickStartGuide";
import OpenCategoryGuide from "../components/general-elements/guide/home/OpenCategoryGuide";
import Modal from "../components/ui/Modal";
import IntroGuide from "../components/general-elements/guide/IntroGuide";
import ModelsList from "../components/models/models-list/ModelsList";
import CategoryList from "../components/ui/lists/CategoryList";
import ButtonCategoryAll from "../components/ui/buttons/ButtonCategoryAll";
import CategoryListItem from "../components/ui/lists/CategoryListItem";
import TextButton from "../components/ui/text/text-buttons/TextButton";
import TextHighlight from "../components/ui/text/TextHighlight";
import NotificationMessage from "../components/ui/NotificationMessage";
import Text from "../components/ui/text/Text";

/**
 * Models page.
 *
 * Top-level route responsible for displaying and managing user models.
 *
 * Responsibilities:
 * - Displays model categories and model previews.
 * - Supports switching between categories and "All models" view.
 * - Loads model preview data from Firestore.
 * - Handles loading, empty, and error states.
 * - Integrates onboarding and guide flows.
 * - Updates the document title.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.title - Page title.
 *
 * @returns {JSX.Element} Models page.
 */
const Models = ({ title }) => {
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
    (state) => state.guide.introDisabled,
  );
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading,
  );
  const userDataLoadError = useSelector(
    (state) => state.auth.userDataLoadError,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title]);

  const tabSwitchHandler = (e) => {
    if (activeTab === e.target.dataset.value) return;
    dispatch(tabActions.setCurrentTab(e.target.dataset.value));
    if (e.target.dataset.value === "all") {
      dispatch(
        getModelsPreview(e.target.dataset.value, null, null, false, nsfwMode),
      );
    }
  };

  const modelTypesHtml = Object.keys(categories)
    .map((categoryId) => {
      const modelTypeInfo = MODEL_TYPES.find(
        (modelType) => modelType.value === categoryId,
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
          onClick={tabSwitchHandler}
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
          <CategoryList activeCategory={activeTab} onClick={tabSwitchHandler}>
            <ButtonCategoryAll
              onClick={tabSwitchHandler}
              className={` ${activeTab === "all" ? classes.active : ""}`}
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
                  <QuickStartGuide
                    className={classes.guide}
                    stage={formIsOpen ? 2 : 1}
                    onClose={() => {
                      setGuideIsOpen(false);
                    }}
                  ></QuickStartGuide>
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

export default Models;
