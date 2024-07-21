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
import { authFromRedirect, initAuth } from "./store/auth";
import SearchPage from "./components/pages/SearchPage";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "./firebase-config";
import { tabActions } from "./store/tabs";
import Profile from "./components/pages/Profile";
import About from "./components/pages/About";
import { savePost } from "./store/upload";
import Edit from "./components/pages/Edit";
import ErrorPage from "./components/pages/ErrorPage";
import { getAuth, getRedirectResult } from "firebase/auth";
const auth = getAuth(firebaseApp);

const firestore = getFirestore(firebaseApp);

function App() {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const uid = useSelector((state) => state.auth.user.uid);
  // const queue = useSelector((state) => state.upload.queue);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(initAuth());
    // dispatch(authFromRedirect());
    // getRedirectResult(auth)
    //   .then((result) => {
    //     // This gives you a Google Access Token. You can use it to access Google APIs.
    //     // const credential = GoogleAuthProvider.credentialFromResult(result);
    //     // const token = credential.accessToken;

    //     // The signed-in user info.
    //     const user = result?.user;
    //     console.log(result);
    //     console.log(user);
    //     // IdP data available using getAdditionalUserInfo(result)
    //     // ...
    //   })
    //   .catch((error) => {
    //     // Handle Errors here.
    //     console.log(error);
    //     console.log(error.code);
    //     console.log(error.message);
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // The email of the user's account used.
    //     // const email = error?.customData?.email;
    //     // The AuthCredential type that was used.
    //     // const credential = GoogleAuthProvider.credentialFromError(error);
    //     // console.log(credential);
    //     // ...
    //   });
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
      <Route path="/" errorElement={<ErrorPage />} element={<Layout />}>
        <Route
          path="/"
          errorElement={<ErrorPage />}
          element={<Home title="Prompt builder" />}
        >
          <Route
            path="/"
            errorElement={<ErrorPage />}
            element={<Tabs />}
          ></Route>
          <Route
            path="model/:modelId"
            errorElement={<ErrorPage />}
            element={<Model title="Model" />}
          ></Route>
          <Route
            path="model/:modelId/edit"
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
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
