import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DocumentArrowDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";

import classes from "./RightSidebarForm.module.scss";
import { authActions } from "../../../../store/auth";
import { usedModelsActions } from "../../../../store/usedModels";
import Button from "../../../ui/buttons/Button";
import UpdateModelForm from "../../../forms/update-model-form/UpdateModelForm";
import SaveToCollectionForm from "../../../forms/save-to-collection-form/SaveToCollectionForm";
import ErrorMessage from "../../../ui/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";

/**
 * Right sidebar form controller.
 *
 * Renders a toggle button that opens a form panel inside the right sidebar
 * for adding either a model or a collection, with controls to switch between
 * the two form types.
 *
 * If the user is not authenticated, clicking the button opens the
 * authorization modal instead of the form.
 *
 * The button is disabled while user data is loading.
 *
 * @component
 * @returns Right sidebar model/collection form controller.
 */
const RightSidebarForm = () => {
  const [resourceType, setResourceType] = useState("model");
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const formIsOpen = useAppSelector((state) => state.used.formIsOpen);
  const userDataIsLoading = useAppSelector(
    (state) => state.auth.userDataIsLoading,
  );
  const userDataLoadError = useAppSelector(
    (state) => state.auth.userDataLoadError,
  );
  const dispatch = useAppDispatch();
  const location = useLocation();

  const openFormHandler = () => {
    if (!isAuth) {
      dispatch(authActions.openAuthForm());
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
              onClick={() => setResourceType("model")}
            >
              Model
            </button>
            <button
              className={`${classes["options__type-btn"]} ${
                resourceType === "collection"
                  ? classes["options__type-btn--active"]
                  : ""
              }`}
              onClick={() => setResourceType("collection")}
            >
              Collection
            </button>
          </div>
        )}
        <Button
          title="Hide form"
          className={`${classes["btn-forms"]} ${
            formIsOpen ? classes["btn-forms--close"] : ""
          }`}
          onClick={openFormHandler}
          disabled={!!userDataLoadError || userDataIsLoading}
        >
          {!formIsOpen ? (
            <>
              <DocumentArrowDownIcon />
              New resource
            </>
          ) : (
            <>
              <XMarkIcon />
            </>
          )}
        </Button>
      </div>
      <div></div>
      {userDataLoadError && <ErrorMessage>{userDataLoadError}</ErrorMessage>}
      <AnimatePresence>
        {formIsOpen && isAuth && (
          <div className={classes.forms}>
            {resourceType === "model" && <UpdateModelForm />}
            {resourceType === "collection" && <SaveToCollectionForm />}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebarForm;
