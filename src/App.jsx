import Home from "./components/pages/Home";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Model from "./components/pages/Model";
import Tabs from "./components/tabs/Tabs";
import Layout from "./components/layout/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { initAuth } from "./store/auth";
import SearchPage from "./components/pages/SearchPage";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "./firebase-config";
import { tabActions } from "./store/tabs";
import Profile from "./components/pages/Profile";
import About from "./components/pages/About";
import Edit from "./components/pages/Edit";
import ErrorPage from "./components/pages/ErrorPage";
import ToS from "./components/pages/ToS";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import { getAppInfo } from "./store/notification";
import { generalActions } from "./store/general";
import { checkIsMobile } from "./utils/generalUtils";

const firestore = getFirestore(firebaseApp);

function App() {
  const uid = useSelector((state) => state.auth.user.uid);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(generalActions.setIsMobile(checkIsMobile()));
    dispatch(getAppInfo());
    dispatch(initAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(firestore, "users", uid), (doc) => {
      const data = doc.data();
      if (data?.categoriesById) {
        dispatch(tabActions.setCategories(data?.categoriesById));
      }
    });

    return () => {
      unsub();
    };
  }, [uid, dispatch]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" errorElement={<ErrorPage />} element={<Layout />}>
        <Route
          path="/"
          errorElement={<ErrorPage />}
          element={<Home title="AIDE-TOOLS" />}
        >
          <Route
            path="/"
            errorElement={<ErrorPage />}
            element={<Tabs />}
          ></Route>
          <Route
            path="models/:modelId"
            errorElement={<ErrorPage />}
            element={<Model title="Model" />}
          ></Route>
          <Route
            path="models/:modelId/edit"
            errorElement={<ErrorPage />}
            element={<Edit title="Edit" />}
          ></Route>
        </Route>
        <Route
          path="search"
          errorElement={<ErrorPage />}
          element={<SearchPage title="Search" />}
        ></Route>
        <Route
          path="profile"
          errorElement={<ErrorPage />}
          element={<Profile title="Profile" />}
        ></Route>
        <Route
          path="about"
          errorElement={<ErrorPage />}
          element={<About title="About" />}
        ></Route>
        <Route
          path="tos"
          errorElement={<ErrorPage />}
          element={<ToS title="Terms of Service" />}
        ></Route>
        <Route
          path="privacy"
          errorElement={<ErrorPage />}
          element={<PrivacyPolicy title="Privacy Policy" />}
        ></Route>
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
