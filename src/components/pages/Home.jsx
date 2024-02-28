import classes from "./Home.module.scss";
import Prompt from "../../components/prompt/Prompt";
import { Outlet } from "react-router-dom";
import UsedModelsPanel from "../used-models-panel/UsedModelsPanel";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import { useEffect } from "react";
import { tabActions } from "../../store/tabs";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";

const firestore = getFirestore(firebaseApp);

function Home() {
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const uid = useSelector((state) => state.auth.user.uid);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(firestore, "users", uid), (doc) => {
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(source);
      const data = doc.data();
      console.log(data?.categories);
      dispatch(tabActions.setCategories(data?.categories));
    });

    return () => {
      unsub();
    };
  }, [uid, dispatch]);

  const nsfwSwitchHandler = () => {
    dispatch(modelActions.setNsfwMode(!isNsfwMode));
  };

  return (
    <div className={classes["wrap"]}>
      <header className="Home-header"></header>
      <button onClick={nsfwSwitchHandler}>{`H: ${
        isNsfwMode ? "ON" : "OFF"
      }`}</button>
      <Prompt />
      <div className={classes["config"]}>
        <Outlet />
        <UsedModelsPanel />
      </div>
    </div>
  );
}

export default Home;
