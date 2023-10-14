import classes from "./App.module.css";
import Lora from "./components/lora/ModelsList";
import Home from "./components/pages/Home";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Model from "./components/pages/Model";
import Tabs from "./components/tabs/Tabs";
import Test from "./components/pages/Test";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Home />}>
        <Route path="/" element={<Tabs />}></Route>
        <Route path="model/:modelId" element={<Model />}></Route>
        <Route path="test" element={<Test />}></Route>
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
