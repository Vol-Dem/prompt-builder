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
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { initAuth } from "./store/auth";

function App() {
  // const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<Tabs />}></Route>
          <Route path="model/:modelId" element={<Model />}></Route>
        </Route>
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
