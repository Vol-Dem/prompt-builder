import { PlusIcon } from "@heroicons/react/24/outline";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import ButtonTertiary from "../../ui/ButtonTertiary";
import InfoPrompt from "../../ui/guide/info/InfoPrompt";
import classes from "./PromptSettings.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../../store/prompt";
import { useState } from "react";
import { authActions } from "../../../store/auth";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal";
import InfoPresets from "../../ui/guide/info/InfoPresets";
import Presets from "../../presets/Presets";
import PromptModeSwitch from "../prompt-mode-switch/PromptModeSwitch";
import PromptClear from "../prompt-clear/PromptClear";

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
      promptActions.addTagToPrompt({ type: "positive", value: "BREAK" })
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
