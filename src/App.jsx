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
import ErrorPage from "./components/pages/ErrorPage";
import { generalActions } from "./store/general";
import { checkIsMobile } from "./utils/generalUtils";
import AboutMain from "./components/about/AboutMain";
import { ABOUT_NAV_DATA } from "./variables/constants";
import AboutStartAddingModels from "./components/about/AboutStartAddingModels";
import AboutCategoryEdit from "./components/about/AboutCategoryEdit";
import AboutWorkingWithPrompts from "./components/about/AboutWorkingWithPrompts";
import AboutModelPage from "./components/about/AboutModelPage";
import AboutModelSettings from "./components/about/AboutModelSettings";
import AboutImageCollections from "./components/about/AboutImageCollections";
import AboutTopPanel from "./components/about/AboutTopPanel";
import AboutSidebar from "./components/about/AboutSidebar";

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

function App() {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const initialAuth = useSelector((state) => state.auth.initialAuth);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(generalActions.setIsMobile(checkIsMobile()));
    dispatch(initAuth());
  }, [dispatch]);

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
        >
          <Route
            path="/about"
            errorElement={<ErrorPage />}
            element={<AboutMain title="About" />}
          ></Route>
          <Route
            path="/about/start-adding-models"
            errorElement={<ErrorPage />}
            element={<AboutStartAddingModels title="Start: Adding Models" />}
          ></Route>
          <Route
            path="/about/category-edit"
            errorElement={<ErrorPage />}
            element={<AboutCategoryEdit title="Category edit" />}
          ></Route>
          <Route
            path="/about/working-with-prompts"
            errorElement={<ErrorPage />}
            element={<AboutWorkingWithPrompts title="Working with Prompts" />}
          ></Route>
          <Route
            path="/about/model-page"
            errorElement={<ErrorPage />}
            element={<AboutModelPage title="Model Page" />}
          ></Route>
          <Route
            path="/about/model-settings"
            errorElement={<ErrorPage />}
            element={<AboutModelSettings title="Model Settings" />}
          ></Route>
          <Route
            path="/about/image-collections"
            errorElement={<ErrorPage />}
            element={<AboutImageCollections title="Image collections" />}
          ></Route>
          <Route
            path="/about/top-panel"
            errorElement={<ErrorPage />}
            element={<AboutTopPanel title="Top Panel" />}
          ></Route>
          <Route
            path="/about/sidebar"
            errorElement={<ErrorPage />}
            element={<AboutSidebar title="Sidebar" />}
          ></Route>
        </Route>
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
