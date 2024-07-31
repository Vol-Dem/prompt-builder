import { useEffect } from "react";
import classes from "./Home.module.scss";
// import Prompt from "../../components/prompt/Prompt";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth";
import Carousel3d from "../carousel3d/Carousel3d";
import Buttton from "../ui/Button";
import Landing from "../landing/Landing";
// import UsedModelsPanel from "../used-models-panel/UsedModelsPanel";
// import { useDispatch, useSelector } from "react-redux";
// import { modelActions } from "../../store/model";
// import { useEffect } from "react";
// import { tabActions } from "../../store/tabs";
// import { doc, getFirestore, onSnapshot } from "firebase/firestore";
// import firebaseApp from "../../firebase-config";

// const firestore = getFirestore(firebaseApp);

function Home({ title }) {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const location = useLocation();
  const dispatch = useDispatch();
  console.log(location);

  useEffect(() => {
    document.title = title;
  }, [title]);
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

  const openAuthHandler = () => {
    dispatch(authActions.openAuthForm(true));
  };

  return (
    <div className={classes["wrap"]}>
      <div className={classes["config"]}>{isAuth && <Outlet />}</div>
      {!isAuth && location?.pathname === "/" && <Landing />}
    </div>
  );
}

export default Home;
