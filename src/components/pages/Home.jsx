import classes from "./Home.module.scss";
// import Prompt from "../../components/prompt/Prompt";
import { Outlet } from "react-router-dom";
// import UsedModelsPanel from "../used-models-panel/UsedModelsPanel";
// import { useDispatch, useSelector } from "react-redux";
// import { modelActions } from "../../store/model";
// import { useEffect } from "react";
// import { tabActions } from "../../store/tabs";
// import { doc, getFirestore, onSnapshot } from "firebase/firestore";
// import firebaseApp from "../../firebase-config";

// const firestore = getFirestore(firebaseApp);

function Home() {
  // const uid = useSelector((state) => state.auth.user.uid);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (!uid) return;
  //   const unsub = onSnapshot(doc(firestore, "users", uid), (doc) => {
  //     const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
  //     console.log(source);
  //     const data = doc.data();
  //     console.log(data?.categoriesById);
  //     dispatch(tabActions.setCategories(data?.categoriesById));
  //   });

  //   return () => {
  //     unsub();
  //   };
  // }, [uid, dispatch]);

  return (
    <div className={classes["wrap"]}>
      <header className="Home-header"></header>
      {/* <button
        onClick={nsfwSwitchHandler}
        className={`${classes["mode-switch"]} ${
          isNsfwMode ? classes["mode-switch--active"] : ""
        }`}
      >{`H: ${isNsfwMode ? "ON" : "OFF"}`}</button> */}
      {/* <Prompt /> */}
      <div className={classes["config"]}>
        <Outlet />
        {/* <UsedModelsPanel /> */}
      </div>
    </div>
  );
}

export default Home;
