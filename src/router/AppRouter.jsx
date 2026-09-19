import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";

import Layout from "../components/layout/layout/Layout";
import ErrorPage from "../pages/ErrorPage";
import AboutMain from "../pages/about/AboutMain";
import AboutStartAddingModels from "../pages/about/AboutStartAddingModels";
import AboutCategoryEdit from "../pages/about/AboutCategoryEdit";
import AboutWorkingWithPrompts from "../pages/about/AboutWorkingWithPrompts";
import AboutModelPage from "../pages/about/AboutModelPage";
import AboutModelSettings from "../pages/about/AboutModelSettings";
import AboutImageCollections from "../pages/about/AboutImageCollections";
import AboutTopPanel from "../pages/about/AboutTopPanel";
import AboutSidebar from "../pages/about/AboutSidebar";
import HomeRoute from "./HomeRoute";
import Author from "../pages/Author";

const About = lazy(() => import("../pages/About"));
const ToS = lazy(() => import("../pages/ToS"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Model = lazy(() => import("../pages/Model"));
const Collections = lazy(() => import("../pages/Collections"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
const Profile = lazy(() => import("../pages/Profile"));
const Collection = lazy(() => import("../pages/Collection"));
const CollectionEdit = lazy(() => import("../pages/CollectionEdit"));
const Edit = lazy(() => import("../pages/Edit"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/models/:modelId",
        id: "model-data",
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
        path: "/author/:authorName",
        id: "author-data",
        children: [
          {
            index: true,
            element: <Author title="Author" />,
            errorElement: <ErrorPage />,
          },
        ],
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

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
