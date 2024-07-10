import { useEffect } from "react";
import classes from "./Home.module.scss";
// import Prompt from "../../components/prompt/Prompt";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth";
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
      <div className={classes["config"]}>
        <Outlet />
      </div>
      {!isAuth && location?.pathname === "/" && (
        <div className={classes["intro"]}>
          <p className={classes["intro__text"]}>
            Welcome to AIDE-TOOLS – a platform that will allow you to create
            your own collection of models for generating images and easily work
            with prompts.
          </p>
          <p className={classes["intro__text"]}>
            I created this project for personal use to make prompt building fast
            and convenient, developed and added here many features that create a
            comfortable space for working with models, references and images and
            greatly simplify the work of building prompts for generating images.
            And now I am sharing this convenient tool with you.
          </p>
          <p className={classes["intro__text"]}>
            You can learn about the capabilities of the service in the{" "}
            <Link className={classes.link} to="about">
              "About"
            </Link>{" "}
            section.
          </p>
          <p className={classes["intro__text"]}>
            This is a non-commercial project, so if you like using this
            platform, support me on{" "}
            <a
              className={classes.link}
              href="https://www.patreon.com/aidetools"
              target="_blank"
              rel="noreferrer nofollow"
            >
              Patreon
            </a>{" "}
            and{" "}
            <a
              className={classes.link}
              href="https://ko-fi.com/J3J31052RE"
              target="_blank"
              rel="noreferrer nofollow"
            >
              Ko-fi
            </a>
            . There you can also leave your suggestions for this project.
          </p>
          <p className={classes["intro__text"]}>
            To get started,{" "}
            <span className={classes.link} onClick={openAuthHandler}>
              create an account or log in
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;
