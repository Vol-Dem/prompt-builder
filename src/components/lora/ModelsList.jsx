import React, { useEffect, useState } from "react";
import classes from "./ModelsList.module.scss";
import PreviewCard from "../previewCard/PreviewCard";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { tabActions } from "../../store/tabs";
import Spinner from "../ui/Spinner";

const firestore = getFirestore(firebaseApp);

const ModelsList = ({ loraItems }) => {
  const [isLoading, setIsLoading] = useState(false);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const uid = useSelector((state) => state.auth.user.uid);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!activeSubcategory) return;
    const getModelsPreview = async () => {
      try {
        // console.log(activeTab);
        // console.log(activeCategory);
        // console.log(activeSubcategory);
        setIsLoading(true);
        const q = query(
          collection(firestore, "users", uid, `preview`),
          where("modelType", "==", activeTab),
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
        setIsLoading(false);
      } catch (err) {
        console.log(err.message);
        setIsLoading(false);
      }
    };
    getModelsPreview();
  }, [uid, activeCategory, activeSubcategory, activeTab, dispatch]);

  const loraHtml = loraItems.map((item, i) => {
    return <PreviewCard previewData={item} key={item.id} />;
  });

  return (
    <div className={classes["container"]}>
      {isLoading && <Spinner />}
      {!isLoading && <div className={classes["category"]}>{loraHtml}</div>}
      {!loraHtml.length && (
        <div className={classes.empty}>This category is empty</div>
      )}
    </div>
  );
};

export default ModelsList;
