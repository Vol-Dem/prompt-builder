import React, { useEffect, useState } from "react";
import classes from "./UsedModelsPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import UsedCard from "../used-card/UsedCard";
import { usedModelsActions } from "../../store/usedModels";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";

const UsedModelsPanel = () => {
  const [panelIsOpen, setPanelIsOpen] = useState(true);
  const [formIsOpen, setFormIsOpen] = useState(false);
  const usedModels = useSelector((state) => state.used.models);
  const dispatch = useDispatch();

  useEffect(() => {
    const transitionEnd = () => {
      dispatch(usedModelsActions.panelState(panelIsOpen));
    };
    document.addEventListener("transitionend", transitionEnd);
    return () => {
      document.removeEventListener("transitionend", transitionEnd);
    };
  }, [panelIsOpen, dispatch]);

  const openPanelHandler = () => {
    setPanelIsOpen((prevState) => !prevState);
  };
  const openFormHandler = () => {
    setFormIsOpen((prevState) => !prevState);
  };

  const usedModelsHtml = usedModels.map((model, i) => {
    return <UsedCard key={i} previewData={model} />;
  });

  return (
    <aside
      className={`${classes.container} ${
        panelIsOpen ? classes["container--open"] : ""
      }`}
    >
      <button onClick={openPanelHandler} className={classes["btn__open"]}>
        l
      </button>
      <div
        className={`${classes.panel} ${
          panelIsOpen ? classes["panel--open"] : ""
        }`}
      >
        {panelIsOpen && (
          <button className={classes["btn-forms"]} onClick={openFormHandler}>
            Forms
          </button>
        )}
        {formIsOpen && (
          <div className={classes.forms}>
            <h3>Checkpoint</h3>
            <UpdateModelForm formType="Checkpoint" />
            <h3>Lora</h3>
            <UpdateModelForm />
          </div>
        )}
        {!formIsOpen && (
          <>
            <h3>Used models</h3>
            <ul className={classes["model-cards"]}>{usedModelsHtml}</ul>
          </>
        )}
      </div>
    </aside>
  );
};

export default UsedModelsPanel;
