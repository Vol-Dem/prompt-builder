import React, { useEffect } from "react";
// import { useEffect, useState } from "react";
// import Category from "../subcategories/Subcategories";
import classes from "./ModelsList.module.scss";
// import { db } from "../../firebase-config";
// import { onValue, ref, set } from "firebase/database";
// import Tag from "../tag/Tag";
import PreviewCard from "../previewCard/PreviewCard";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from "firebase/firestore";
// import Subcategory from "../subcategory/Subcategory";
import firebaseApp from "../../firebase-config";
import { tabActions } from "../../store/tabs";

const firestore = getFirestore(firebaseApp);

const ModelsList = ({ loraItems }) => {
  const activeTab = useSelector((state) => state.tabs.currTab);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const uid = useSelector((state) => state.auth.user.uid);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!activeSubcategory) return;
    const getModelsPreview = async () => {
      const q = query(
        collection(firestore, "users", uid, `${activeTab} preview`),
        where("main", "==", activeCategory),
        where("sub", "array-contains", activeSubcategory)
        // orderBy("id", "desc")
      );
      const querySnapshot = await getDocs(q);
      const modelsData = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });
      console.log(modelsData);

      dispatch(tabActions.setModelsData(modelsData));
    };
    getModelsPreview();
  }, [uid, activeCategory, activeSubcategory, firestore]);

  const loraHtml = loraItems.map((item, i) => {
    return <PreviewCard previewData={item} key={item.id} />;
  });

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{loraHtml}</div>
    </div>
  );
};

export default ModelsList;
