// import React, { useState } from "react";
import classes from "./Prompt.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import TagsTextarea from "../ui/TagsTextarea";
import Arrow from "../ui/Arrow";
import ButtonTertiary from "../ui/ButtonTertiary";
// import Buttton from "../ui/Button";

const Prompt = () => {
  // const [promptIsOpen, setPromptIsOpen] = useState(true);
  // const [promptTextMode, setPromptTextMode] = useState(false);
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curNegPrompt = useSelector((state) => state.prompt.curNegPrompt);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const promptTextMode = useSelector((state) => state.prompt.isTextMode);
  const dispatch = useDispatch();

  const openPromptHandler = () => {
    // setPromptIsOpen((prevState) => !prevState);
    dispatch(promptActions.setPromptIsOpen(!promptIsOpen));
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
    dispatch(promptActions.setTextMode(isTextMode));
  };

  const clearPromptHandler = () => {
    dispatch(promptActions.clearPrompt());
  };

  return (
    <div
      className={`${classes.container} ${
        promptIsOpen ? classes["container--open"] : ""
      }`}
    >
      <div className={`${classes.content}`}>
        <>
          <div className={classes.settings}>
            <label htmlFor="prompt" className={classes.label}>
              View:
            </label>
            <div className={classes["mode-switch"]}>
              <button
                data-type="text"
                onClick={textModeHandler}
                className={`${classes["btn-mode"]}  ${
                  promptTextMode ? classes["btn-mode--active"] : ""
                }`}
              >
                Text
              </button>
              <button
                data-type="tag"
                onClick={textModeHandler}
                className={`${classes["btn-mode"]}  ${
                  !promptTextMode ? classes["btn-mode--active"] : ""
                }`}
              >
                Tags
              </button>
            </div>
            <ButtonTertiary type="button" onClick={clearPromptHandler}>
              Clear
            </ButtonTertiary>
          </div>

          <div className={classes.field}>
            {!promptTextMode && (
              <TagsTextarea
                data={curPrompt}
                promptType="positive"
                placeholder="Prompt (tags mode)"
                className={classes["tagarea"]}
              />
            )}
            {promptTextMode && (
              <textarea
                id="prompt"
                name="prompt"
                placeholder="Prompt (text mode)"
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
                promptType="negative"
                placeholder="Negative prompt (tags mode)"
                className={`${classes["tagarea"]} ${classes["tagarea--neg"]}`}
              />
            )}
            {promptTextMode && (
              <textarea
                id="neg-prompt"
                name="neg-prompt"
                placeholder="Negative prompt (text mode)"
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
      <button
        type="button"
        className={classes["btn-open"]}
        onClick={openPromptHandler}
      >
        {promptIsOpen ? (
          <>
            <Arrow direction="up" />
            Hide prompt
          </>
        ) : (
          <>
            <Arrow direction="down" />
            Show prompt
          </>
        )}
      </button>
    </div>
  );
};

export default Prompt;
