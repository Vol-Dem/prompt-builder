import React, { useState } from "react";
import classes from "./Prompt.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";

const Prompt = () => {
  const [promptIsOpen, setPromptIsOpen] = useState(true);
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curNegPrompt = useSelector((state) => state.prompt.curNegPrompt);
  const dispatch = useDispatch();

  const openPromptHandler = () => {
    setPromptIsOpen((prevState) => !prevState);
  };

  const promptHandler = (e) => {
    dispatch(promptActions.setCurrentPrompt(e.target.value));
  };

  const negPromptHandler = (e) => {
    dispatch(promptActions.setCurrentNegPrompt(e.target.value));
  };

  const copyToClipboardHandler = (e) => {
    navigator.clipboard.writeText(curPrompt);
  };

  return (
    <div
      className={`${classes.container} ${
        promptIsOpen ? classes["container--open"] : ""
      }`}
    >
      <div className={`${classes.content}`}>
        <div>
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
              onChange={negPromptHandler}
              value={curNegPrompt}
              className={classes.prompt}
            ></textarea>
            <button type="button" onClick={copyToClipboardHandler}>
              Copy
            </button>
          </div>
        </div>
      </div>
      <button className={classes["btn__open"]} onClick={openPromptHandler}>
        \/
      </button>
    </div>
  );
};

export default Prompt;
