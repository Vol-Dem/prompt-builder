import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { lazy, useEffect } from "react";

import Layout from "./components/layout/layout/Layout";
import { initAuth } from "./store/auth";
import ErrorPage from "./pages/ErrorPage";
import { generalActions } from "./store/general";
import { checkIsMobile } from "./utils/generalUtils";
import AboutMain from "./pages/about/AboutMain";
import AboutStartAddingModels from "./pages/about/AboutStartAddingModels";
import AboutCategoryEdit from "./pages/about/AboutCategoryEdit";
import AboutWorkingWithPrompts from "./pages/about/AboutWorkingWithPrompts";
import AboutModelPage from "./pages/about/AboutModelPage";
import AboutModelSettings from "./pages/about/AboutModelSettings";
import AboutImageCollections from "./pages/about/AboutImageCollections";
import AboutTopPanel from "./pages/about/AboutTopPanel";
import AboutSidebar from "./pages/about/AboutSidebar";
import Models from "./pages/Models";

const About = lazy(() => import("./pages/About"));
const ToS = lazy(() => import("./pages/ToS"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Model = lazy(() => import("./pages/Model"));
const Collections = lazy(() => import("./pages/Collections"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Profile = lazy(() => import("./pages/Profile"));
const Collection = lazy(() => import("./pages/Collection"));
const CollectionEdit = lazy(() => import("./pages/CollectionEdit"));
const Edit = lazy(() => import("./pages/Edit"));
const Landing = lazy(() => import("./pages/Landing"));

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
    import("./pages/Model");
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
