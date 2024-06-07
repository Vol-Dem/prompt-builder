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

const firestore = getFirestore(firebaseApp);

const amountPerPage = 4;

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
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const endPage = useRef(null);
  const isIntersecting = useIntersection(endPage, false);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(activeTab, modelsData.tab);
    console.log(activeCategory, modelsData.category);
    console.log(activeSubcategory, modelsData.subcategory);
    console.log(nsfwMode, modelsData.nsfw);
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
  }, [dispatch, modelsData, nsfwMode, activeCategory, activeSubcategory, activeTab]);

  useEffect(() => {
    console.log(modelsData);
    if (!modelsData?.previews?.length && !isLastPage) {
      dispatch(getModelsPreview(false, nsfwMode));
    }
  }, [dispatch, modelsData, nsfwMode, isLastPage]);

  useEffect(() => {
    if (!isLastPage && isIntersecting && !!modelsData?.previews?.length) {
      dispatch(getModelsPreview(true, nsfwMode));
      console.log("INT", isIntersecting, nsfwMode);
    }
  }, [isIntersecting, dispatch, isLastPage, modelsData, nsfwMode]);

  const loraHtml = modelsData?.previews?.map((item, i) => {
    return <PreviewCard previewData={item} key={i} />;
  });

  const sortTypes = [
    { name: "Newest", value: "createdAt" },
    { name: "Name", value: "name" },
  ];
  const modelTypes = [
    { name: "-", value: "" },
    { name: "SD 1.5", value: "SD 1.5" },
    { name: "SDXL", value: "SDXL 1.0" },
    { name: "Pony", value: "Pony" },
    { name: "Other", value: "Other" },
  ];

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

      {!loraHtml?.length && !isLoading && (
        <div className={classes.empty}>This category is empty</div>
      )}

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
