import { useState, type SubmitEvent } from "react";

import classes from "./ResetPasswordForm.module.scss";
import Input from "../../ui/forms/Input";
import ErrorMessage from "../../ui/ErrorMessage";
import { resetUserPassword } from "../../../store/auth";
import Button from "../../ui/buttons/Button";
import { VALIDATION_EMAIL_MAX_LENGTH } from "../../../variables/constants";
import SuccessMessage from "../../ui/SuccessMessage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Reset Password form component.
 *
 * Provides password reset flow by submitting the user's email address.
 *
 * Responsibilities:
 * - Validates email input.
 * - Submits password reset requests via Redux actions.
 * - Displays backend and client-side error messages.
 *
 * Side effects:
 * - Dispatches resetUserPassword action.
 *
 * @component
 * @returns Reset Password form.
 */
const ResetPasswordForm = () => {
  const [email, setEmail] = useState({
    value: "",
    isValid: false,
  });
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const errorMessageAuth = useAppSelector((state) => state.auth.errorMessage);
  const successMessage = useAppSelector((state) => state.auth.successMessage);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();

  const resetPassHandler = (e: SubmitEvent) => {
    e.preventDefault();
    setShowErrorMessage(true);

    if (email.isValid) {
      dispatch(resetUserPassword(email.value));
    }
  };

  return (
    <form onSubmit={resetPassHandler} className={classes["auth__form"]}>
      <Input
        label="Email"
        name="email"
        type="email"
        disabled={isLoading}
        className={`${classes["auth__input"]} ${
          showErrorMessage && !email.isValid ? classes.invalid : ""
        }`}
        autoFocus={true}
        onChange={(e, isValid) => {
          setEmail({ value: e.target.value, isValid });
        }}
        validation={{
          required: true,
          email: true,
          maxLength: VALIDATION_EMAIL_MAX_LENGTH,
        }}
        showError={showErrorMessage}
        value={email.value}
      />
      {errorMessageAuth && (
        <ErrorMessage className={classes["auth__error"]}>
          {errorMessageAuth}
        </ErrorMessage>
      )}
      {successMessage && (
        <SuccessMessage className={classes["auth__error"]}>
          {successMessage}
        </SuccessMessage>
      )}
      <Button>Reset password</Button>
    </form>
  );
};

export default ResetPasswordForm;
