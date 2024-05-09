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

const firestore = getFirestore(firebaseApp);

const amountPerPage = 4;

const ModelsList = () => {
  const loraItems = useSelector((state) => state.tabs.modelsData);
  const isLoading = useSelector((state) => state.tabs.isLoading);
  const isLastPage = useSelector((state) => state.tabs.isLastPage);
  const endPage = useRef(null);
  const isIntersecting = useIntersection(endPage, false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLastPage && isIntersecting && !!loraItems.length) {
      dispatch(getModelsPreview());
      console.log("INT", isIntersecting);
    }
  }, [isIntersecting, dispatch, isLastPage, loraItems.length]);

  const loraHtml = loraItems.map((item, i) => {
    return <PreviewCard previewData={item} key={i} />;
  });

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{loraHtml}</div>
      {isLoading && <Spinner size="medium" />}
      {!loraHtml.length && (
        <div className={classes.empty}>This category is empty</div>
      )}

      <div ref={endPage}>END</div>
      {!isLoading && !isLastPage && (
        <button
          onClick={() => {
            // getModelsPreview();
            dispatch(getModelsPreview());
          }}
        >
          more
        </button>
      )}
    </div>
  );
};

export default ModelsList;
