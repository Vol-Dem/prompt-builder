// import { useEffect, useState } from "react";
// import GeneralTags from "../categories/Categories";
import classes from "./Home.module.scss";
// import GeneralForm from "../../components/forms/general/GeneralForm";
// import EmbeddingsForm from "../../components/forms/embeddings/EmbeddingsForm";
// import LoraForm from "../../components/forms/lora/LoraForm";
import Prompt from "../../components/prompt/Prompt";
import { Outlet } from "react-router-dom";
// import Tabs from "../tabs/Tabs";
// import { push, ref, set, get } from "firebase/database";
// import { db } from "../../firebase-config";
import UsedModelsPanel from "../used-models-panel/UsedModelsPanel";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";

function Home() {
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const userId = useSelector((state) => state.auth.user.uid);
  const distpatch = useDispatch();
  const nsfwSwitchHandler = () => {
    distpatch(modelActions.setNsfwMode(!isNsfwMode));
  };
  return (
    <div className={classes["wrap"]}>
      <header className="Home-header"></header>
      <button onClick={nsfwSwitchHandler}>{`H: ${
        isNsfwMode ? "ON" : "OFF"
      }`}</button>
      <Prompt />
      <div className={classes["config"]}>
        <Outlet />
        <UsedModelsPanel />
      </div>
    </div>
  );
}

export default Home;
