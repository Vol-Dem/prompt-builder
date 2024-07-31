import React, { useCallback, useEffect, useRef, useState } from "react";
import classes from "./ModelsList.module.scss";
import PreviewCard from "../previewCard/PreviewCard";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { getModelsPreview, tabActions } from "../../store/tabs";
import Spinner from "../ui/Spinner";
import useIntersection from "../../hooks/use-intersection";
import Select from "../ui/Select";
import usePageEnd from "../../hooks/use-page-end";
import { useOnlineStatus } from "../../hooks/use-online-status";
import ErrorMessage from "../ui/ErrorMessage";
import { OFFLINE_ERROR_MESSAGE } from "../../variables/constants";

const firestore = getFirestore(firebaseApp);

const amountPerPage = 4;
const sortTypes = [
  { name: "Newest", value: "createdAt" },
  { name: "Name", value: "name" },
];
const modelTypes = [
  { name: "-", value: "-" },
  { name: "SD 3", value: "SD 3" },
  { name: "Pony", value: "Pony" },
  { name: "SDXL", value: "SDXL 1.0" },
  { name: "SD 1.5", value: "SD 1.5" },
  { name: "Other", value: "Other" },
];

const ModelsList = () => {
  // const [sortType, setSortType] = useState("createdAt");
  // const [modelType, setModelType] = useState("");
  const modelsData = useSelector((state) => state.tabs.modelsData);
  const isLoading = useSelector((state) => state.tabs.isLoading);
  const isLastPage = useSelector((state) => state.tabs.isLastPage);
  const sortBy = useSelector((state) => state.tabs.sortBy);
  const modelType = useSelector((state) => state.tabs.modelType);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const errorMessage = useSelector((state) => state.tabs.errorMessage);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const endPage = useRef(null);
  // const isIntersecting = useIntersection(endPage, false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const isPageEnd = usePageEnd(100);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("MPAGE", isPageEnd);
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  useEffect(() => {
    // console.log(activeTab, modelsData.tab);
    // console.log(activeCategory, modelsData.category);
    // console.log(activeSubcategory, modelsData.subcategory);
    // console.log(nsfwMode, modelsData.nsfw);
    if (
      activeTab === modelsData.tab &&
      activeCategory === modelsData.category &&
      activeSubcategory === modelsData.subcategory &&
      nsfwMode !== modelsData.nsfw
    ) {
      console.log("UPDATED");
      // dispatch(getModelsPreview(false, nsfwMode));
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
    console.log(modelsData);
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
        console.log("START FETCH");
        dispatch(getModelsPreview(true, nsfwMode));
      }, 1000);
      console.log("INT", isIntersecting, nsfwMode);
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
          // label="Sort"
          name="sort"
          // id={id}
          selected={sortBy}
          onChange={(value) => {
            // setSortType(value);
            dispatch(tabActions.setSortBy(value));
            dispatch(tabActions.setModelsData([]));
            dispatch(getModelsPreview(false, nsfwMode));
          }}
          options={sortSelectOption}
          className={classes.select}
        />
        {/* <span>Model type</span> */}
        <Select
          // label="Model"
          name="model"
          // id={id}
          selected={modelType}
          onChange={(value) => {
            console.log("TYPE", modelType, "-------");
            // setModelType(value);
            dispatch(tabActions.setModelType(value));
            dispatch(tabActions.setModelsData([]));
            dispatch(getModelsPreview(false, nsfwMode));
          }}
          options={modelTypes}
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
      {/* {!isLoading && !isLastPage && (
        <button
          onClick={() => {
            // getModelsPreview();
            dispatch(getModelsPreview());
          }}
        >
          more
        </button>
      )} */}

      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ModelsList;
