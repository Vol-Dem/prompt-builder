import React, { useState } from "react";
import classes from "./UsedModelsPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import UsedCard from "../used-card/UsedCard";
import { usedModelsActions } from "../../store/usedModels";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import Arrow from "../ui/Arrow";
import ButtonTertiary from "../ui/ButtonTertiary";
import UpdateDb from "../update-db/UpdateDb";

const UsedModelsPanel = () => {
  // const [panelIsOpen, setPanelIsOpen] = useState(true);
  const [formIsOpen, setFormIsOpen] = useState(false);
  // const [fullCardView, setFullCardView] = useState(true);
  const usedModels = useSelector((state) => state.used.models);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const fullCardView = useSelector((state) => state.used.fullCardView);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const transitionEnd = () => {
  //     dispatch(usedModelsActions.panelState(panelIsOpen));
  //   };
  //   document.addEventListener("transitionend", transitionEnd);
  //   return () => {
  //     document.removeEventListener("transitionend", transitionEnd);
  //   };
  // }, [panelIsOpen, dispatch]);

  const openPanelHandler = () => {
    dispatch(usedModelsActions.panelState());
    // setPanelIsOpen((prevState) => !prevState);
  };
  const openFormHandler = () => {
    setFormIsOpen((prevState) => !prevState);
  };

  const chageCardViewHandler = () => {
    // setFullCardView((prevState) => !prevState);
    dispatch(usedModelsActions.cardViewState());
  };

  const usedModelsHtml = usedModels.map((model, i) => {
    return <UsedCard key={i} previewData={model} fullView={fullCardView} />;
  });

  const clearPanelHandler = () => {
    dispatch(usedModelsActions.clearPanel());
  };

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
        {/* <Arrow direction={panelIsOpen ? "right" : "left"} /> */}
        {!panelIsOpen && (
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
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        )}
        {panelIsOpen && (
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
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        )}
      </button>
      <div
        className={`${classes.panel} ${
          panelIsOpen ? classes["panel--open"] : ""
        }`}
      >
        <div className={classes["options"]}>
          <button className={classes["btn-forms"]} onClick={openFormHandler}>
            {!formIsOpen ? (
              <>
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                New resourse
              </>
            ) : (
              "Hide form X"
            )}
          </button>
          <UpdateDb />
          {formIsOpen && (
            <div className={classes.forms}>
              <UpdateModelForm id="side-form" />
            </div>
          )}
          <div className={classes["controls"]}>
            <ButtonTertiary
              type="button"
              // className={classes["controls__btn"]}
              onClick={clearPanelHandler}
            >
              Clear
            </ButtonTertiary>
            <div>
              <ButtonTertiary
                type="button"
                className={`${classes["controls__btn"]} ${
                  !fullCardView ? classes["controls__btn--active"] : ""
                }`}
                onClick={chageCardViewHandler}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.4}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                  />
                </svg>
              </ButtonTertiary>
              <ButtonTertiary
                type="button"
                className={`${classes["controls__btn"]} ${
                  fullCardView ? classes["controls__btn--active"] : ""
                }`}
                onClick={chageCardViewHandler}
              >
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
                    d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                  />
                </svg>
              </ButtonTertiary>
            </div>
          </div>
        </div>

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
