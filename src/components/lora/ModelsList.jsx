import React, { useEffect, useRef, useState } from "react";
import classes from "./ModelsList.module.scss";
import PreviewCard from "../previewCard/PreviewCard";
import { useDispatch, useSelector } from "react-redux";
import { getModelsPreview, tabActions } from "../../store/tabs";
import Spinner from "../ui/Spinner";
import Select from "../ui/Select";
import usePageEnd from "../../hooks/use-page-end";
import { useOnlineStatus } from "../../hooks/use-online-status";
import ErrorMessage from "../ui/ErrorMessage";
import { OFFLINE_ERROR_MESSAGE } from "../../variables/constants";

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
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const endPage = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const isPageEnd = usePageEnd(100);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  const baseModelsData = !baseModels?.length
    ? baseModelsDef
    : [
        ...baseModelsDef,
        ...baseModels?.map((model) => {
          return { name: model, value: model };
        }),
      ];

  useEffect(() => {
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  useEffect(() => {
    if (
      activeTab === modelsData.tab &&
      activeCategory === modelsData.category &&
      activeSubcategory === modelsData.subcategory &&
      nsfwMode !== modelsData.nsfw
    ) {
      dispatch(tabActions.resetModelsData());
      dispatch(tabActions.setIsLastPage(false));
    }
  }, [
    dispatch,
    modelsData,
    nsfwMode,
    activeCategory,
    activeSubcategory,
    activeTab,
  ]);

  useEffect(() => {
    if (!modelsData?.previews?.length && !isLastPage && isOnline) {
      dispatch(getModelsPreview(false, nsfwMode));
    }
  }, [dispatch, modelsData, nsfwMode, isLastPage, isOnline]);

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !!modelsData?.previews?.length &&
      isOnline
    ) {
      clearTimeout(timeoutRef.current);
      setIsIntersecting(false);
      timeoutRef.current = setTimeout(() => {
        dispatch(getModelsPreview(true, nsfwMode));
      }, 1000);
    }
  }, [isIntersecting, dispatch, isLastPage, modelsData, nsfwMode, isOnline]);

  const loraHtml = modelsData?.previews?.map((item, i) => {
    return <PreviewCard previewData={item} key={i} />;
  });

  let sortSelectOption = sortTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  return (
    <div className={classes["container"]}>
      <div className={classes.panel}>
        <span className={classes["panel__title"]}>Sort by:</span>
        <Select
          name="sort"
          selected={sortBy}
          onChange={(value) => {
            dispatch(tabActions.setSortBy(value));
            dispatch(tabActions.setModelsData([]));
            dispatch(getModelsPreview(false, nsfwMode));
          }}
          options={sortSelectOption}
          className={classes.select}
        />
        <Select
          name="model"
          selected={modelType}
          onChange={(value) => {
            dispatch(tabActions.setModelType(value));
            dispatch(tabActions.setModelsData([]));
            dispatch(getModelsPreview(false, nsfwMode));
          }}
          options={baseModelsData}
          className={classes.select}
        />
      </div>

      <div className={classes["category"]}>{loraHtml}</div>

      {!loraHtml?.length && !errorMessage && !isLoading && isOnline && (
        <div className={classes.empty}>This category is empty</div>
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!isOnline && <ErrorMessage>{OFFLINE_ERROR_MESSAGE}</ErrorMessage>}
      <div ref={endPage}></div>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ModelsList;
