import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";

import Layout from "../components/layout/layout/Layout";
import ErrorPage from "../pages/ErrorPage";
import HomeRoute from "./HomeRoute";

const About = lazy(() => import("../pages/About"));
const AboutMain = lazy(() => import("../pages/about/AboutMain"));
const AboutStartAddingModels = lazy(
  () => import("../pages/about/AboutStartAddingModels"),
);
const AboutCategoryEdit = lazy(() => import("../pages/about/AboutCategoryEdit"));
const AboutWorkingWithPrompts = lazy(
  () => import("../pages/about/AboutWorkingWithPrompts"),
);
const AboutModelPage = lazy(() => import("../pages/about/AboutModelPage"));
const AboutModelSettings = lazy(() => import("../pages/about/AboutModelSettings"));
const AboutImageCollections = lazy(
  () => import("../pages/about/AboutImageCollections"),
);
const AboutTopPanel = lazy(() => import("../pages/about/AboutTopPanel"));
const AboutSidebar = lazy(() => import("../pages/about/AboutSidebar"));
const Author = lazy(() => import("../pages/Author"));
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
            element: <AboutMain />,
            handle: { pageTitle: "About" },
            errorElement: <ErrorPage />,
          },
          {
            path: "start-adding-models",
            element: <AboutStartAddingModels />,
            handle: { pageTitle: "Start: Adding Models" },
            errorElement: <ErrorPage />,
          },
          {
            path: "category-edit",
            element: <AboutCategoryEdit />,
            handle: { pageTitle: "Category edit" },
            errorElement: <ErrorPage />,
          },
          {
            path: "working-with-prompts",
            element: <AboutWorkingWithPrompts />,
            handle: { pageTitle: "Working with Prompts" },
            errorElement: <ErrorPage />,
          },
          {
            path: "model-page",
            element: <AboutModelPage />,
            handle: { pageTitle: "Model Page" },
            errorElement: <ErrorPage />,
          },
          {
            path: "model-settings",
            element: <AboutModelSettings />,
            handle: { pageTitle: "Model Settings" },
            errorElement: <ErrorPage />,
          },
          {
            path: "image-collections",
            element: <AboutImageCollections />,
            handle: { pageTitle: "Image collections" },
            errorElement: <ErrorPage />,
          },
          {
            path: "top-panel",
            element: <AboutTopPanel />,
            handle: { pageTitle: "Top Panel" },
            errorElement: <ErrorPage />,
          },
          {
            path: "sidebar",
            element: <AboutSidebar />,
            handle: { pageTitle: "Sidebar" },
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
