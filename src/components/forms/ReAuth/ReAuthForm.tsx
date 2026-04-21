import { useState, type MouseEvent, type SubmitEvent } from "react";
import { useEffect } from "react";

import Input from "../../ui/forms/Input";
import classes from "./ReAuthForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { authActions, reAuthUser } from "../../../store/auth";
import Button from "../../ui/buttons/Button";
import {
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_OFFLINE,
  VALIDATION_PASSWORD_MAX_LENGTH,
} from "../../../variables/constants";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Re-authentication form component.
 *
 * Provides re-authentication flows.
 * Handles form validation, loading and error states.
 *
 * Responsibilities:
 * - Validates password inputs.
 * - Submits re-authentication requests via Redux actions.
 * - Displays backend and client-side error messages.
 *
 * Side effects:
 * - Dispatches reAuthUser.
 *
 * @component
 * @returns Re-authentication form.
 */
const ReAuthForm = () => {
  const [password, setPassword] = useState({
    value: "",
    isValid: false,
  });
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const errorMessageAuth = useAppSelector((state) => state.auth.errorMessage);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
    };
  }, [dispatch]);

  const authHandlerPass = async (e: SubmitEvent) => {
    e.preventDefault();
    dispatch(authActions.setErrorMessage(""));
    setShowErrorMessage(true);
    if (!navigator?.onLine) {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_OFFLINE));
      return;
    }

    if (!password.isValid) {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_INPUT_DEF));
    } else {
      dispatch(reAuthUser("pass", password.value));
    }
  };

  const authHandlerPopup = async (e: MouseEvent) => {
    e.preventDefault();
    dispatch(authActions.setErrorMessage(""));
    setShowErrorMessage(true);
    if (!navigator?.onLine) {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_OFFLINE));
      return;
    }

    dispatch(reAuthUser("popup", password.value));
  };

  return (
    <section className={classes.auth}>
      <form onSubmit={authHandlerPass} className={classes["auth__form"]}>
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          disabled={isLoading}
          className={`${classes["auth__input"]} ${
            showErrorMessage && !password.isValid ? classes.invalid : ""
          }`}
          onChange={(e, isValid) => {
            setPassword({
              value: e.target.value,
              isValid: isValid === null ? true : isValid,
            });
          }}
          validation={{
            required: true,
            password: true,
            maxLength: VALIDATION_PASSWORD_MAX_LENGTH,
          }}
          showError={showErrorMessage}
          value={password.value}
        />

        {errorMessageAuth && (
          <ErrorMessage className={classes["auth__error"]}>
            {errorMessageAuth}
          </ErrorMessage>
        )}
        <div className={classes["auth__controls"]}>
          <Button disabled={isLoading} className={classes["auth__btn--submit"]}>
            {isLoading && <Spinner size="small" />}
            <span>Submit</span>
          </Button>
        </div>
      </form>
      <Button onClick={authHandlerPopup}>Google</Button>
    </section>
  );
};

export default ReAuthForm;
