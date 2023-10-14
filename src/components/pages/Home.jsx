import { useState } from "react";
import GeneralTags from "../categories/Categories";
import classes from "./Home.module.scss";
import GeneralForm from "../../components/forms/general/GeneralForm";
import EmbeddingsForm from "../../components/forms/embeddings/EmbeddingsForm";
import LoraForm from "../../components/forms/lora/LoraForm";
import Prompt from "../../components/prompt/Prompt";
import { Outlet } from "react-router-dom";
import Tabs from "../tabs/Tabs";

function Home() {
  // const [prompt, setPrompt] = useState("");
  // const [activeCategory, setActiveCategory] = useState("");
  // const curPrompt = useSelector((state) => state.prompt.curPrompt);
  // const dispatch = useDispatch();

  // const promptHandler = (e) => {
  //   // setPrompt(e.target.value);
  //   console.log(curPrompt);
  //   dispatch(promptActions.setCurrentPrompt(e.target.value));
  // };

  // const categorySwitchHandler = (e) => {
  //   setActiveCategory(e.target.id);
  // };

  // const copyToClipboardHandler = (e) => {
  //   navigator.clipboard.writeText(curPrompt);
  // };

  return (
    <div className={classes["wrap"]}>
      <header className="Home-header"></header>
      <Prompt />
      <div className={classes["config"]}>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
