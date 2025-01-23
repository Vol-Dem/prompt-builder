import classes from "./Prompt.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import TagsTextarea from "../ui/TagsTextarea";
import ButtonTertiary from "../ui/ButtonTertiary";
import { memo, useEffect, useRef, useState } from "react";
import Presets from "../presets/Presets";
import ArrowDownSvg from "../../assets/ArrowDownSvg";
import ArrowUp from "../../assets/ArrowUp";
import { authActions } from "../../store/auth";
import PromptGuide from "../ui/guide/model/PromptGuide";
import { AnimatePresence } from "framer-motion";
import Modal from "../ui/Modal";
import { PlusIcon } from "@heroicons/react/24/outline";

const positiveMinHeight = 100;
const negativeMinHeight = 60;

const Prompt = memo(() => {
  const [copiedType, setCopiedType] = useState("");
  const [presetsIsOpen, setPresetsIsOpen] = useState(false);
  const [positivePromptHeight, setPositivePromptHeight] =
    useState(positiveMinHeight);
  const [negativePromptHeight, setNegativePromptHeight] =
    useState(negativeMinHeight);
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curNegPrompt = useSelector((state) => state.prompt.curNegPrompt);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const promptTextMode = useSelector((state) => state.prompt.isTextMode);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const timeoutCopiedRef = useRef(null);
  const showPromptBtnRef = useRef(null);
  const promptContainerRef = useRef(null);

  useEffect(() => {
    // if (promptContainerRef?.current?.offsetHeight) return;
    // console.log("PROMPT", promptContainerRef.current.offsetHeight);
    dispatch(
      promptActions.setPromptHeight(promptContainerRef.current.offsetHeight)
    );
    dispatch(
      promptActions.setPromptBtnHeight(showPromptBtnRef.current.offsetHeight)
    );
  }, [promptContainerRef?.current?.offsetHeight, promptIsOpen, dispatch]);

  const openPromptHandler = () => {
    dispatch(promptActions.setPromptIsOpen(!promptIsOpen));
  };

  const promptHandler = (e) => {
    dispatch(promptActions.setCurrentPrompt(e.target.value));
  };

  const negPromptHandler = (e) => {
    dispatch(promptActions.setCurrentNegPrompt(e.target.value));
  };

  const copyToClipboardHandler = (e) => {
    const type = e.target.closest(`.${classes["btn-copy"]}`).dataset.type;
    const promptData = type === "positive" ? curPrompt : curNegPrompt;
    navigator.clipboard.writeText(promptData);
    setCopiedType(type);
    if (timeoutCopiedRef.current) {
      clearTimeout(timeoutCopiedRef.current);
    }
    timeoutCopiedRef.current = setTimeout(() => {
      setCopiedType("");
    }, 1000);
  };

  const textModeHandler = (e) => {
    const isTextMode = e.target.dataset.type === "text";
    dispatch(promptActions.setTextMode(isTextMode));
  };

  const clearPositivePromptHandler = () => {
    dispatch(promptActions.setCurrentPrompt(""));
    dispatch(promptActions.setCurPromptArr([]));
  };

  const clearNegativePromptHandler = () => {
    dispatch(promptActions.setCurrentNegPrompt(""));
    dispatch(promptActions.setCurNegPromptArr([]));
  };

  const clearPromptHandler = () => {
    dispatch(promptActions.clearPrompt());
  };

  const openPresetsHandler = () => {
    if (!isAuth) {
      dispatch(authActions.openAuthForm(true));
    } else {
      setPresetsIsOpen(true);
    }
  };

  const onMouseDown = (e) => {
    const promptType = e.target.dataset.type;
    const startHeight =
      promptType === "positive" ? positivePromptHeight : negativePromptHeight;
    const minHeight =
      promptType === "positive" ? positiveMinHeight : negativeMinHeight;
    const startY = e.clientY;

    const onMouseMove = (moveEvent) => {
      const newHeight = startHeight + (moveEvent.clientY - startY);
      // setWidth(Math.max(50, newWidth)); // Min size
      if (promptType === "positive") {
        setPositivePromptHeight(Math.max(minHeight, newHeight));
        // dispatch(
        //   promptActions.setPromptHeight({ type: "positive", value: newHeight })
        // );
      }
      if (promptType === "negative") {
        setNegativePromptHeight(Math.max(minHeight, newHeight));
        // dispatch(
        //   promptActions.setPromptHeight({ type: "negative", value: newHeight })
        // );
      }
      dispatch(
        promptActions.setPromptHeight(promptContainerRef.current.offsetHeight)
      );
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const addBreakHandler = () => {
    dispatch(
      promptActions.addTagToPrompt({ type: "positive", value: "BREAK" })
    );
  };

  return (
    <div className={classes.wrap}>
      <div
        className={`${classes.container} ${
          promptIsOpen ? classes["container--open"] : ""
        }`}
      >
        <div className={`${classes.content}`}>
          <div
            ref={promptContainerRef}
            className={`${classes["prompt__content-wrap"]}`}
          >
            <div className={classes.settings}>
              <div className={classes.label}>View:</div>
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

              <ButtonTertiary type="button" onClick={openPresetsHandler}>
                Presets
              </ButtonTertiary>
              <ButtonTertiary
                type="button"
                onClick={addBreakHandler}
                className={classes[""]}
              >
                <PlusIcon className={classes["plus-icon"]} /> BREAK
              </ButtonTertiary>

              <div className={classes["btn-container"]}>
                <ButtonTertiary
                  type="button"
                  onClick={clearPromptHandler}
                  className={classes["btn-clear"]}
                >
                  Clear all
                </ButtonTertiary>
                <div
                  className={`${classes["btn-container"]} ${classes["btn-container--fields"]}`}
                >
                  <ButtonTertiary
                    type="button"
                    onClick={clearPositivePromptHandler}
                    className={classes["btn-clear"]}
                  >
                    Clear positive
                  </ButtonTertiary>
                  <ButtonTertiary
                    type="button"
                    onClick={clearNegativePromptHandler}
                    className={classes["btn-clear"]}
                  >
                    Clear negative
                  </ButtonTertiary>
                </div>
              </div>
            </div>
            <PromptGuide />
            <div className={classes.field}>
              <div
                className={classes["prompt"]}
                style={{
                  height: `${positivePromptHeight}px`,
                }}
              >
                {!promptTextMode && (
                  <TagsTextarea
                    // data={curPrompt}
                    promptType="positive"
                    aditionalPlacegholder="Add tags from the model or image tag list, or switch view to text mode to enter manually"
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
                    className={classes["prompt__textarea"]}
                  ></textarea>
                )}
                <div
                  onMouseDown={onMouseDown}
                  className={classes["prompt__resize-box"]}
                  data-type="positive"
                ></div>
              </div>
              <button
                type="button"
                data-type="positive"
                onClick={copyToClipboardHandler}
                className={classes["btn-copy"]}
                title="Copy"
              >
                {copiedType !== "positive" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                )}
                {copiedType === "positive" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={classes.copied}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className={`${classes.field} ${classes["field--neg"]}`}>
              <div
                className={`${classes.prompt} ${classes["prompt--neg"]}`}
                style={{
                  height: `${negativePromptHeight}px`,
                }}
              >
                {!promptTextMode && (
                  <TagsTextarea
                    // data={curNegPrompt}
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
                    className={`${classes["prompt__textarea"]}`}
                  ></textarea>
                )}
                <div
                  onMouseDown={onMouseDown}
                  className={classes["prompt__resize-box"]}
                  data-type="negative"
                ></div>
              </div>
              <button
                type="button"
                data-type="negative"
                onClick={copyToClipboardHandler}
                className={classes["btn-copy"]}
                title="Copy"
              >
                {copiedType !== "negative" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                )}
                {copiedType === "negative" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={classes.copied}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          ref={showPromptBtnRef}
          type="button"
          className={classes["btn-open"]}
          onClick={openPromptHandler}
        >
          {promptIsOpen ? (
            <>
              <ArrowUp />
              Hide prompt
            </>
          ) : (
            <>
              <ArrowDownSvg />
              Show prompt
            </>
          )}
        </button>
        <AnimatePresence>
          {presetsIsOpen && (
            <Modal
              title="Presets"
              onClose={() => {
                setPresetsIsOpen(false);
              }}
            >
              <Presets
                onClose={() => {
                  setPresetsIsOpen(false);
                }}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default Prompt;
