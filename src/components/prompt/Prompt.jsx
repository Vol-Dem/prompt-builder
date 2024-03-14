import React, { useState } from "react";
import classes from "./Prompt.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import TagsTextarea from "../ui/TagsTextarea";
import Buttton from "../ui/Button";

const Prompt = () => {
  const [promptIsOpen, setPromptIsOpen] = useState(true);
  const [promptTextMode, setPromptTextMode] = useState(false);
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
    const promptData =
      e.target.dataset.type === "positive" ? curPrompt : curNegPrompt;
    navigator.clipboard.writeText(promptData);
  };

  const textModeHandler = (e) => {
    const isTextMode = e.target.dataset.type === "text";
    setPromptTextMode(isTextMode);
  };

  return (
    <div
      className={`${classes.container} ${
        promptIsOpen ? classes["container--open"] : ""
      }`}
    >
      <div className={`${classes.content}`}>
        <>
          <div>
            <label htmlFor="prompt" className={classes.label}>
              Prompt
            </label>
            <div className={classes["btn-type-container"]}>
              <button
                data-type="text"
                onClick={textModeHandler}
                className={`${classes["btn-prompt-type"]} ${
                  promptTextMode ? classes["btn-prompt-type--active"] : ""
                }`}
              >
                text
              </button>
              <button
                data-type="tag"
                onClick={textModeHandler}
                className={`${classes["btn-prompt-type"]} ${
                  !promptTextMode ? classes["btn-prompt-type--active"] : ""
                }`}
              >
                tags
              </button>
            </div>
          </div>

          <div className={classes.field}>
            {!promptTextMode && (
              <TagsTextarea
                data={curPrompt}
                placeholder="Prompt"
                className={classes["tagarea"]}
              />
            )}
            {promptTextMode && (
              <textarea
                id="prompt"
                name="prompt"
                placeholder="Enter your prompt"
                onChange={promptHandler}
                value={curPrompt}
                className={classes.prompt}
              ></textarea>
            )}
            <button
              type="button"
              data-type="positive"
              onClick={copyToClipboardHandler}
              className={classes["btn-copy"]}
            >
              Copy
            </button>
          </div>
          {/* <label htmlFor="neg-prompt">Neg Prompt</label> */}
          <div className={`${classes.field} ${classes["field--neg"]}`}>
            {!promptTextMode && (
              <TagsTextarea
                data={curNegPrompt}
                placeholder="Negative prompt"
                className={`${classes["tagarea"]} ${classes["tagarea--neg"]}`}
              />
            )}
            {promptTextMode && (
              <textarea
                id="neg-prompt"
                name="neg-prompt"
                placeholder="Enter your negative prompt"
                onChange={negPromptHandler}
                value={curNegPrompt}
                className={`${classes.prompt} ${classes["prompt--neg"]}`}
              ></textarea>
            )}
            <button
              type="button"
              data-type="negative"
              onClick={copyToClipboardHandler}
              className={classes["btn-copy"]}
            >
              Copy
            </button>
          </div>
        </>
      </div>
      <button className={classes["btn__open"]} onClick={openPromptHandler}>
        \/
      </button>
    </div>
  );
};

export default Prompt;
