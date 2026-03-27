import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
 * @returns {JSX.Element} Right sidebar model/collection form controller.
 */
const RightSidebarForm = () => {
  const [resourceType, setResourceType] = useState("model");
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const formIsOpen = useSelector((state) => state.used.formIsOpen);
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading,
  );
  const userDataLoadError = useSelector(
    (state) => state.auth.userDataLoadError,
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
