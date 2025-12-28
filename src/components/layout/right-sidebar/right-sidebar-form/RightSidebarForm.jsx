import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";

import classes from "./RightSidebarForm.module.scss";
import { authActions } from "../../../../store/auth";
import { usedModelsActions } from "../../../../store/usedModels";
import Buttton from "../../../ui/buttons/Button";
import UpdateModelForm from "../../../forms/update-model-form/UpdateModelForm";
import SaveToCollectionForm from "../../../forms/save-to-collection-form/SaveToCollectionForm";
import ErrorMessage from "../../../ui/ErrorMessage";

const RightSidebarForm = () => {
  const [resourceType, setResourceType] = useState("model");
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const formIsOpen = useSelector((state) => state.used.formIsOpen);
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading
  );
  const userDataLoadError = useSelector(
    (state) => state.auth.userDataLoadError
  );
  const dispatch = useDispatch();
  const location = useLocation();

  const resourceTypeHandler = (e) => {
    const type = e.target.dataset.value;
    if (type) {
      setResourceType(type);
    }
  };

  const openFormHandler = () => {
    if (!isAuth) {
      dispatch(authActions.openAuthForm(true));
    } else {
      setResourceType("model");
      dispatch(usedModelsActions.setFormIsOpen(!formIsOpen));
    }
  };

  useEffect(() => {
    if (location?.pathname) {
      dispatch(usedModelsActions.setFormIsOpen(false));
    }
  }, [location?.pathname, dispatch]);

  return (
    <>
      <div className={classes["options__btns"]}>
        {formIsOpen && (
          <div className={classes["options__type"]}>
            <button
              className={`${classes["options__type-btn"]} ${
                resourceType === "model"
                  ? classes["options__type-btn--active"]
                  : ""
              }`}
              onClick={resourceTypeHandler}
              data-value="model"
            >
              Model
            </button>
            <button
              className={`${classes["options__type-btn"]} ${
                resourceType === "collection"
                  ? classes["options__type-btn--active"]
                  : ""
              }`}
              onClick={resourceTypeHandler}
              data-value="collection"
            >
              Collection
            </button>
          </div>
        )}
        <Buttton
          title="Hide form"
          className={`${classes["btn-forms"]} ${
            formIsOpen ? classes["btn-forms--close"] : ""
          }`}
          onClick={openFormHandler}
          disabled={!!userDataLoadError || userDataIsLoading}
        >
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
              New resource
            </>
          ) : (
            <>
              <XMarkIcon />
            </>
          )}
        </Buttton>
      </div>
      <div></div>
      {userDataLoadError && <ErrorMessage>{userDataLoadError}</ErrorMessage>}
      {/* <UpdateDb /> */}
      <AnimatePresence>
        {formIsOpen && isAuth && (
          <div className={classes.forms}>
            {resourceType === "model" && <UpdateModelForm id="side-form" />}
            {resourceType === "collection" && (
              <SaveToCollectionForm id="side-form" />
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebarForm;
