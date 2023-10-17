import React from "react";
import classes from "./Prompt.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";

const Prompt = () => {
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const dispatch = useDispatch();

  const promptHandler = (e) => {
    // setPrompt(e.target.value);
    console.log(curPrompt);
    dispatch(promptActions.setCurrentPrompt(e.target.value));
  };

  const copyToClipboardHandler = (e) => {
    navigator.clipboard.writeText(curPrompt);
  };

  return (
    <div className={classes.container}>
      <label htmlFor="prompt">Prompt</label>
      <div className={classes.field}>
        <textarea
          id="prompt"
          name="prompt"
          rows="5"
          cols="70"
          placeholder="Enter your prompt"
          onChange={promptHandler}
          value={curPrompt}
          className={classes.prompt}
        ></textarea>
        <button type="button" onClick={copyToClipboardHandler}>
          Copy
        </button>
      </div>
      <div className={classes.field}>
        <textarea
          id="neg-prompt"
          name="neg-prompt"
          rows="3"
          cols="70"
          placeholder="Enter your negative prompt"
          onChange={promptHandler}
          value={curPrompt}
          className={classes.prompt}
        ></textarea>
        <button type="button" onClick={copyToClipboardHandler}>
          Copy
        </button>
      </div>
    </div>
  );
};

export default Prompt;
