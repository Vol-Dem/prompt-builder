import { PlusIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import ButtonInfo from "../../ui/buttons/ButtonInfo";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import InfoPrompt from "../../general-elements/info/InfoPrompt";
import classes from "./PromptSettings.module.scss";
import { promptActions } from "../../../store/prompt";
import { authActions } from "../../../store/auth";
import Modal from "../../ui/Modal";
import InfoPresets from "../../general-elements/info/InfoPresets";
import Presets from "../presets/Presets";
import PromptModeSwitch from "../prompt-mode-switch/PromptModeSwitch";
import PromptClear from "../prompt-clear/PromptClear";

/**
 * Prompt panel controls.
 *
 * Top-level control bar for the prompt panel.
 *
 * Responsibilities:
 * - Switches between text and tag prompt modes.
 * - Opens the presets modal (auth-gated).
 * - Inserts a special "BREAK" tag into the positive prompt.
 * - Displays contextual help tooltips.
 * - Clears prompt content via PromptClear.
 *
 * Side effects:
 * - Opens auth modal if user is not authenticated.
 * - Dispatches prompt mutations.
 *
 * @component
 * @returns {JSX.Element} Prompt settings panel.
 */
const PromptSettings = () => {
  const [presetsIsOpen, setPresetsIsOpen] = useState(false);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const openPresetsHandler = () => {
    if (!isAuth) {
      dispatch(authActions.openAuthForm(true));
    } else {
      setPresetsIsOpen(true);
    }
  };

  const addBreakHandler = () => {
    dispatch(
      promptActions.addTagToPrompt({ type: "positive", value: "BREAK" }),
    );
  };

  return (
    <div className={classes.settings}>
      <div className={classes.label}>View:</div>
      <PromptModeSwitch />
      <ButtonTertiary type="button" onClick={openPresetsHandler}>
        Presets
      </ButtonTertiary>
      <ButtonTertiary type="button" onClick={addBreakHandler}>
        <PlusIcon className={classes["plus-icon"]} /> BREAK
      </ButtonTertiary>
      <ButtonInfo className={classes.info}>
        <InfoPrompt />
      </ButtonInfo>
      <PromptClear />
      <AnimatePresence>
        {presetsIsOpen && (
          <Modal
            title={
              <>
                Presets{" "}
                <ButtonInfo className={classes["btn-info"]}>
                  <InfoPresets />
                </ButtonInfo>{" "}
              </>
            }
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
  );
};

export default PromptSettings;
