import { useEffect, useMemo, useRef, useState } from "react";
import classes from "./ModelsList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  getModelsPreview,
  switchPreviewFullView,
  tabActions,
} from "../../store/tabs";
import Spinner from "../ui/Spinner";
import Select from "../ui/Select";
import NotificationMessage from "../ui/NotificationMessage";
import { useOnlineStatus } from "../../hooks/use-online-status";
import ErrorMessage from "../ui/ErrorMessage";
import {
  GUIDE_STEP_OPEN_MODEL,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
} from "../../variables/constants";
import OpenModelGuide from "../ui/guide/home/OpenModelGuide";
import { guideActions } from "../../store/guide";
import ButtonTertiary from "../ui/ButtonTertiary";
import { Bars2Icon, Bars4Icon } from "@heroicons/react/24/outline";
import useIntersection from "../../hooks/use-intersection";
import PreviewCard from "../preview-card/PreviewCard";

const sortTypes = [
  { name: "Newest", value: "createdAt" },
  { name: "Name", value: "name" },
];
const baseModelsDef = [{ name: "-", value: "-" }];

const ModelsList = () => {
  const modelsData = useSelector((state) => state.tabs.modelsData);
  const isLoading = useSelector((state) => state.tabs.isLoading);
  const isLastPage = useSelector((state) => state.tabs.isLastPage);
  const sortBy = useSelector((state) => state.tabs.sortBy);
  const modelType = useSelector((state) => state.tabs.modelType);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const errorMessage = useSelector((state) => state.tabs.errorMessage);
  const baseModels = useSelector((state) => state.tabs.baseModels);
  const previewFullView = useSelector((state) => state.tabs.previewFullView);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const guideState = useSelector((state) => state.guide.home);
  const endPageRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`
  );
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();

  const getAllModels = useMemo(
    () =>
      activeTab === "all" ||
      activeCategory === "all" ||
      activeSubcategory === "all",
    [activeTab, activeCategory, activeSubcategory]
  );

  const getSubcategoryModels = useMemo(
    () => activeTab && activeCategory && activeSubcategory,
    [activeTab, activeCategory, activeSubcategory]
  );

  const baseModelsData = !baseModels?.length
    ? baseModelsDef
    : [
        ...baseModelsDef,
        ...baseModels?.map((model) => {
          return { name: model, value: model };
        }),
      ];

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall]);

  useEffect(() => {
    if (
      guideState?.step < GUIDE_STEP_OPEN_MODEL &&
      modelsData?.previews?.length
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "home",
          value: GUIDE_STEP_OPEN_MODEL,
        })
      );
    }
  }, [guideState, modelsData?.previews, dispatch]);

  useEffect(() => {
    if (modelsData?.previews?.length && nsfwMode !== modelsData.nsfw) {
      dispatch(tabActions.resetModelsData());
    }
  }, [dispatch, modelsData, nsfwMode]);

  useEffect(() => {
    const loadMore = !!modelsData?.previews?.length;
    if (
      isIntersecting &&
      !isLastPage &&
      isOnline &&
      (getSubcategoryModels || getAllModels)
    ) {
      setIsIntersecting(false);
      dispatch(
        getModelsPreview(
          activeTab,
          activeCategory,
          activeSubcategory,
          loadMore,
          nsfwMode
        )
      );
    }
  }, [
    dispatch,
    modelsData,
    nsfwMode,
    isLastPage,
    isOnline,
    activeTab,
    activeCategory,
    activeSubcategory,
    getAllModels,
    getSubcategoryModels,
    isIntersecting,
  ]);

  const loraHtml = modelsData?.previews?.map((item, i) => {
    return <PreviewCard key={i} item={item} fullView={previewFullView} />;
  });

  const sortSelectOption = sortTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  return (
    <div className={classes["container"]}>
      {activeSubcategory && (
        <div className={classes.panel}>
          <span className={classes["panel__title"]}>Sort by:</span>
          <Select
            id="sort"
            name="sort"
            selected={sortBy}
            onChange={(value) => {
              dispatch(tabActions.setSortBy(value));
              dispatch(tabActions.setModelsData([]));
              dispatch(
                getModelsPreview(
                  activeTab,
                  activeCategory,
                  activeSubcategory,
                  false,
                  nsfwMode
                )
              );
            }}
            options={sortSelectOption}
            className={classes.select}
          />
          <Select
            id="model"
            name="model"
            selected={modelType}
            onChange={(value) => {
              dispatch(tabActions.setModelType(value));
              dispatch(tabActions.setModelsData([]));
              dispatch(
                getModelsPreview(
                  activeTab,
                  activeCategory,
                  activeSubcategory,
                  false,
                  nsfwMode
                )
              );
            }}
            options={baseModelsData}
            className={classes.select}
          />
          <div className={classes["panel__view"]}>
            <ButtonTertiary
              type="button"
              className={`${classes["panel__btn"]} ${
                !previewFullView ? classes["panel__btn--active"] : ""
              }`}
              onClick={() => {
                dispatch(switchPreviewFullView(false));
              }}
              title="Short view"
            >
              <Bars2Icon className={classes["panel__btn-icon"]} />
            </ButtonTertiary>
            <ButtonTertiary
              type="button"
              className={`${classes["panel__btn"]} ${
                previewFullView ? classes["panel__btn--active"] : ""
              }`}
              onClick={() => {
                dispatch(switchPreviewFullView(true));
              }}
              title="Expanded view"
            >
              <Bars4Icon className={classes["panel__btn-icon"]} />
            </ButtonTertiary>
          </div>
        </div>
      )}
      <div
        className={`${classes["category"]} ${
          previewFullView ? classes["category__full"] : ""
        }`}
      >
        {loraHtml}
      </div>
      {guideState?.active && !isLoading && !!loraHtml?.length && (
        <OpenModelGuide />
      )}
      {!loraHtml?.length &&
        !errorMessage &&
        !isLoading &&
        isOnline &&
        (getAllModels || getSubcategoryModels) && (
          <NotificationMessage className={classes.empty} type="notification">
            This category is empty. Try changing the filter.
          </NotificationMessage>
        )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPageRef}></div>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ModelsList;
