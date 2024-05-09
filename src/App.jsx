// import classes from "./App.module.css";
// import Lora from "./components/lora/ModelsList";
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
import { savePost } from "./store/upload";

const firestore = getFirestore(firebaseApp);

function App() {
  // const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const uid = useSelector((state) => state.auth.user.uid);
  // const queue = useSelector((state) => state.upload.queue);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(firestore, "users", uid), (doc) => {
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(source);
      const data = doc.data();
      console.log(data);
      console.log(data?.categoriesById);
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
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home title="Prompt builder" />}>
          <Route path="/" element={<Tabs />}></Route>
          <Route
            path="model/:modelId"
            element={<Model title="Model" />}
          ></Route>
        </Route>
        <Route path="search" element={<SearchPage title="Search" />}></Route>
        <Route path="profile" element={<Profile title="Profile" />}></Route>
        <Route path="about" element={<About title="About" />}></Route>
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
