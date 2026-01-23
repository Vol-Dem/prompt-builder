import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { lazy, useEffect } from "react";

import Layout from "./components/layout/layout/Layout";
import { initAuth } from "./store/auth";
import ErrorPage from "./components/pages/ErrorPage";
import { generalActions } from "./store/general";
import { checkIsMobile } from "./utils/generalUtils";
import AboutMain from "./components/pages/about/AboutMain";
import AboutStartAddingModels from "./components/pages/about/AboutStartAddingModels";
import AboutCategoryEdit from "./components/pages/about/AboutCategoryEdit";
import AboutWorkingWithPrompts from "./components/pages/about/AboutWorkingWithPrompts";
import AboutModelPage from "./components/pages/about/AboutModelPage";
import AboutModelSettings from "./components/pages/about/AboutModelSettings";
import AboutImageCollections from "./components/pages/about/AboutImageCollections";
import AboutTopPanel from "./components/pages/about/AboutTopPanel";
import AboutSidebar from "./components/pages/about/AboutSidebar";
import Models from "./components/pages/Models";

const About = lazy(() => import("./components/pages/About"));
const ToS = lazy(() => import("./components/pages/ToS"));
const PrivacyPolicy = lazy(() => import("./components/pages/PrivacyPolicy"));
const Model = lazy(() => import("./components/pages/Model"));
const Collections = lazy(() => import("./components/pages/Collections"));
const SearchPage = lazy(() => import("./components/pages/SearchPage"));
const Profile = lazy(() => import("./components/pages/Profile"));
const Collection = lazy(() => import("./components/pages/Collection"));
const CollectionEdit = lazy(() => import("./components/pages/CollectionEdit"));
const Edit = lazy(() => import("./components/pages/Edit"));
const Landing = lazy(() => import("./components/pages/Landing"));

/**
 * Root application component.
 *
 * Responsibilities:
 * - Initializes authentication and device state
 * - Preloads heavy routes in development
 * - Defines the full React Router structure
 * - Handles conditional landing vs. models routing
 *
 * Routes include:
 * - Models
 * - Model editor
 * - Image collections
 * - Search
 * - Profile
 * - About documentation pages
 * - Legal pages (ToS, Privacy)
 *
 * @returns {JSX.Element} Root RouterProvider with all app routes.
 */
function App() {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const initialAuth = useSelector((state) => state.auth.initialAuth);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(generalActions.setIsMobile(checkIsMobile()));
    dispatch(initAuth());
  }, [dispatch]);

  //Removes delay on first navigation in dev mode
  useEffect(() => {
    import("./components/pages/Model");
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: !isAuth && initialAuth,
          element: <Landing title="AIDE-TOOLS" />,
          errorElement: <ErrorPage />,
        },
        {
          index: isAuth,
          element: <Models title="Models" />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/models/:modelId",
          id: "model-data",
          // loader: someLoader,
          children: [
            {
              index: true,
              element: <Model title="Model" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "edit",
              element: <Edit title="Edit" />,
              errorElement: <ErrorPage />,
            },
          ],
        },
        {
          path: "images",
          errorElement: <ErrorPage />,
          children: [
            {
              index: true,
              element: <Collections title="Collections" />,
              errorElement: <ErrorPage />,
            },
            {
              path: ":collectionId",
              id: "collection-data",
              // loader: someLoader,
              children: [
                {
                  index: true,
                  element: <Collection title="Collection" />,
                  errorElement: <ErrorPage />,
                },
                {
                  path: "edit",
                  element: <CollectionEdit title="Collection" />,
                  errorElement: <ErrorPage />,
                },
              ],
            },
          ],
        },
        {
          path: "/search",
          element: <SearchPage title="Search" />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/profile",
          element: <Profile title="Profile" />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/about",
          element: <About title="About" />,
          errorElement: <ErrorPage />,
          children: [
            {
              index: true,
              element: <AboutMain title="About" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "start-adding-models",
              element: <AboutStartAddingModels title="Start: Adding Models" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "category-edit",
              element: <AboutCategoryEdit title="Category edit" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "working-with-prompts",
              element: <AboutWorkingWithPrompts title="Working with Prompts" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "model-page",
              element: <AboutModelPage title="Model Page" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "model-settings",
              element: <AboutModelSettings title="Model Settings" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "image-collections",
              element: <AboutImageCollections title="Image collections" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "top-panel",
              element: <AboutTopPanel title="Top Panel" />,
              errorElement: <ErrorPage />,
            },
            {
              path: "sidebar",
              element: <AboutSidebar title="Sidebar" />,
              errorElement: <ErrorPage />,
            },
          ],
        },
        {
          path: "/tos",
          element: <ToS title="Terms of Service" />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/privacy",
          element: <PrivacyPolicy title="Privacy Policy" />,
          errorElement: <ErrorPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
