import React, { useEffect, useState } from "react";
import classes from "./UsedModelsPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import UsedCard from "../used-card/UsedCard";
import { usedModelsActions } from "../../store/usedModels";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import Arrow from "../ui/Arrow";

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
      <button
        type="button"
        title={panelIsOpen ? "Close side panel" : "Open side panel"}
        onClick={openPanelHandler}
        className={classes["btn__open"]}
      >
        <Arrow direction={panelIsOpen ? "right" : "left"} />
      </button>
      <div
        className={`${classes.panel} ${
          panelIsOpen ? classes["panel--open"] : ""
        }`}
      >
        <div className={classes["options"]}>
          <button className={classes["btn-forms"]} onClick={openFormHandler}>
            {!formIsOpen ? "+ New resourse" : "Close form X"}
          </button>
        </div>

        {formIsOpen && (
          <div className={classes.forms}>
            <UpdateModelForm id="side-form" />
          </div>
        )}

        <>
          {/* <h3>Used models</h3> */}
          <ul className={classes["model-cards"]}>
            {!!usedModelsHtml.length && usedModelsHtml}
            {!usedModelsHtml.length && (
              <div className={classes["model-cards__tip"]}>
                Press + in model card to add it to side panel
              </div>
            )}
          </ul>
        </>
      </div>
    </aside>
  );
};

export default UsedModelsPanel;
