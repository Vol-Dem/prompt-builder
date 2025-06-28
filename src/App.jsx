import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./components/layout/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { lazy, useEffect } from "react";
import { initAuth } from "./store/auth";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "./firebase-config";
import { tabActions } from "./store/tabs";
import ErrorPage from "./components/pages/ErrorPage";
import { generalActions } from "./store/general";
import { checkIsMobile } from "./utils/generalUtils";
import { imagesActions } from "./store/images";
import { promptActions } from "./store/prompt";

const About = lazy(() => import("./components/pages/About"));
const ToS = lazy(() => import("./components/pages/ToS"));
const PrivacyPolicy = lazy(() => import("./components/pages/PrivacyPolicy"));
const Model = lazy(() => import("./components/pages/Model"));
const Images = lazy(() => import("./components/pages/Images"));
const SearchPage = lazy(() => import("./components/pages/SearchPage"));
const Profile = lazy(() => import("./components/pages/Profile"));
const ImageCollection = lazy(() =>
  import("./components/pages/ImageCollection")
);
const CollectionEdit = lazy(() => import("./components/pages/CollectionEdit"));
const Edit = lazy(() => import("./components/pages/Edit"));
const Tabs = lazy(() => import("./components/tabs/Tabs"));
const Home = lazy(() => import("./components/pages/Home"));
const Landing = lazy(() => import("./components/landing/Landing"));

const firestore = getFirestore(firebaseApp);

function App() {
  const uid = useSelector((state) => state.auth.user.uid);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const initialAuth = useSelector((state) => state.auth.initialAuth);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(generalActions.setIsMobile(checkIsMobile()));
    dispatch(initAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(firestore, "users", uid), (doc) => {
      const data = doc.data();
      if (data?.categoriesById) {
        dispatch(tabActions.setCategories(data?.categoriesById));
      }
      if (data?.imageCategories)
        dispatch(imagesActions.setImageCategories(data.imageCategories));
      if (data?.presets) dispatch(promptActions.setPresets(data.presets));
    });

    return () => {
      unsub();
    };
  }, [uid, dispatch]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" errorElement={<ErrorPage />} element={<Layout />}>
        {!isAuth && initialAuth && (
          <Route
            path="/"
            errorElement={<ErrorPage />}
            element={<Landing title="AIDE-TOOLS" />}
          ></Route>
        )}
        {isAuth && (
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
          </Route>
        )}
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
        <Route
          path="images"
          errorElement={<ErrorPage />}
          element={<Images title="Images" />}
        ></Route>
        <Route
          path="images/:collectionId"
          errorElement={<ErrorPage />}
          element={<ImageCollection title="Collection" />}
        ></Route>
        <Route
          path="images/:collectionId/edit"
          errorElement={<ErrorPage />}
          element={<CollectionEdit title="Collection" />}
        ></Route>
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
