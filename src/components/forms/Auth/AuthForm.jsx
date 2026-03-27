import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Input from "../../ui/forms/Input";
import classes from "./AuthForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { authActions, authRequest, authWithGoogle } from "../../../store/auth";
import Button from "../../ui/buttons/Button";
import ButttonSecondary from "../../ui/buttons/ButtonSecondary";
import {
  MESSAGE_AGREEMENT,
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_EMAIL_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
} from "../../../variables/constants";
import Checkbox from "../../ui/forms/Checkbox";
import LinkA from "../../ui/LinkA";
import GoogleLogo from "../../../assets/google.svg";
import ResetPasswordForm from "../reset-password-form/ResetPasswordForm";

/**
 * Authentication form component.
 *
 * Provides login and registration flows with email/password and Google OAuth.
 * Handles form validation, loading and error states, agreement confirmation,
 * password reset flow, and animated transitions between modes.
 *
 * Responsibilities:
 * - Switches between login and sign-up modes.
 * - Validates email and password inputs.
 * - Submits authentication requests via Redux actions.
 * - Displays backend and client-side error messages.
 * - Shows reset-password form when requested.
 * - Prevents submission when offline or when agreement is not accepted.
 *
 * Side effects:
 * - Dispatches authRequest, authWithGoogle and authActions.
 * - Clears auth error/success messages on unmount.
 *
 * @component
 * @returns {JSX.Element} Authentication form.
 */
const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState({
    value: "",
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: "",
    isValid: false,
  });
  const [agreement, setAgreement] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const errorMessageAuth = useSelector((state) => state.auth.errorMessage);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const showResetPassword = useSelector(
    (state) => state.auth.showResetPassword,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
      dispatch(authActions.setSuccessMessage(""));
      dispatch(authActions.setShowResetPassword(false));
    };
  }, [dispatch]);

  const authHandler = async (e) => {
    e.preventDefault();
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    setShowErrorMessage(true);
    if (!navigator?.onLine) {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_OFFLINE));
      return;
    }

    if (!agreement && !isLogin) {
      dispatch(authActions.setErrorMessage(MESSAGE_AGREEMENT));
      return;
    }

    if (email.isValid && password.isValid) {
      dispatch(authRequest(isLogin, email.value, password.value));
    } else {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_INPUT_DEF));
    }
  };

  const switchSignType = () => {
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    dispatch(authActions.setShowResetPassword(false));
    setIsLogin((state) => !state);
    setEmail({
      value: "",
      isValid: false,
    });
    setPassword({
      value: "",
      isValid: false,
    });
    setShowErrorMessage(false);
  };

  const agreementHandler = () => {
    setAgreement((prevState) => !prevState);
  };

  return (
    <motion.div
      key={isLogin}
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      className={classes.auth}
    >
      {!showResetPassword && (
        <h3 className={classes["auth__title"]}>
          {isLogin ? "Log in" : "Sign Up"}
        </h3>
      )}
      {showResetPassword && <ResetPasswordForm />}
      {!showResetPassword && (
        <form onSubmit={authHandler} className={classes["auth__form"]}>
          {isLogin && (
            <Button
              type="button"
              onClick={() => {
                dispatch(authWithGoogle());
              }}
            >
              <img
                src={GoogleLogo}
                alt="Google Logo"
                className={classes["icon"]}
              />
              Sign in with Google
            </Button>
          )}
          <Input
            label="Email"
            id="email"
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
              disableErrorOnBlur: !isLogin ? false : true,
            }}
            showError={showErrorMessage}
            value={email.value}
          />
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
              setPassword({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              password: !isLogin,
              disableErrorOnBlur: !isLogin ? false : true,
            }}
            showError={showErrorMessage}
            value={password.value}
          />

          {!isLogin && (
            <Checkbox
              id="agreement"
              name="agreement"
              checked={agreement}
              label={
                <span>
                  I have read and agree to the{" "}
                  <Link className={classes.link} to="tos" target="blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link className={classes.link} to="privacy" target="blank">
                    Privacy Policy
                  </Link>
                </span>
              }
              onChange={agreementHandler}
            />
          )}
          {isLogin && (
            <div className={classes["reset"]}>
              <LinkA
                onClick={() => {
                  dispatch(authActions.setErrorMessage(""));
                  dispatch(authActions.setSuccessMessage(""));
                  dispatch(authActions.setShowResetPassword(true));
                }}
              >
                Forgot your password?
              </LinkA>
            </div>
          )}
          {errorMessageAuth && (
            <ErrorMessage className={classes["auth__error"]}>
              {errorMessageAuth}
            </ErrorMessage>
          )}
          <div className={classes["auth__controls"]}>
            <ButttonSecondary
              type="button"
              onClick={switchSignType}
              disabled={isLoading}
              className={classes["auth__btn--switch"]}
            >
              {isLogin ? "Create Account" : "Log in"}
            </ButttonSecondary>
            <Button
              disabled={isLoading}
              className={classes["auth__btn--submit"]}
            >
              {isLoading && <Spinner size="small" />}
              <span>{isLogin ? "Log in" : "Sign up"}</span>
            </Button>
          </div>
        </form>
      )}
      {isLogin && (
        <div className={classes["privacy"]}>
          By continuing, you are indicating that you accept our{" "}
          <Link className={classes.link} to="tos" target="blank">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className={classes.link} to="privacy" target="blank">
            Privacy Policy
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default AuthForm;
