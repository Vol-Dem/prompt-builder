import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Input from "../../ui/forms/Input";
import classes from "./AuthForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import Button from "../../ui/buttons/Button";
import ButtonSecondary from "../../ui/buttons/ButtonSecondary";
import {
  VALIDATION_EMAIL_MAX_LENGTH,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
} from "../../../variables/constants";
import Checkbox from "../../ui/forms/Checkbox";
import LinkA from "../../ui/LinkA";
import GoogleLogo from "../../../assets/google.svg";
import ResetPasswordForm from "../reset-password-form/ResetPasswordForm";
import useAuthFormController from "../../../hooks/use-auth-form-controller";

/** Renders login, registration and password reset with mode-specific validation. */
const AuthForm = () => {
  const { fields, mode, status, actions } = useAuthFormController();

  return (
    <motion.div
      key={mode.isLogin + ""}
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      className={classes.auth}
    >
      {!mode.showResetPassword && (
        <h3 className={classes["auth__title"]}>
          {mode.isLogin ? "Log in" : "Sign Up"}
        </h3>
      )}
      {mode.showResetPassword && <ResetPasswordForm />}
      {!mode.showResetPassword && (
        <form onSubmit={actions.submit} className={classes["auth__form"]}>
          {mode.isLogin && (
            <Button
              type="button"
              onClick={actions.signInWithGoogle}
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
            disabled={status.isLoading}
            className={`${classes["auth__input"]} ${
              status.showErrorMessage && !fields.email.isValid ? classes.invalid : ""
            }`}
            autoFocus={true}
            onChange={fields.email.onChange}
            validation={{
              required: true,
              email: true,
              maxLength: VALIDATION_EMAIL_MAX_LENGTH,
              disableErrorOnBlur: !mode.isLogin ? false : true,
            }}
            showError={status.showErrorMessage}
            value={fields.email.value}
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            disabled={status.isLoading}
            className={`${classes["auth__input"]} ${
              status.showErrorMessage && !fields.password.isValid ? classes.invalid : ""
            }`}
            onChange={fields.password.onChange}
            validation={{
              required: true,
              password: !mode.isLogin,
              disableErrorOnBlur: !mode.isLogin ? false : true,
            }}
            showError={status.showErrorMessage}
            value={fields.password.value}
          />

          {!mode.isLogin && (
            <Checkbox
              id="agreement"
              name="agreement"
              checked={fields.agreement.checked}
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
              onChange={fields.agreement.onChange}
            />
          )}
          {mode.isLogin && (
            <div className={classes["reset"]}>
              <LinkA
                onClick={mode.openPasswordReset}
              >
                Forgot your password?
              </LinkA>
            </div>
          )}
          {status.errorMessage && (
            <ErrorMessage className={classes["auth__error"]}>
              {status.errorMessage}
            </ErrorMessage>
          )}
          <div className={classes["auth__controls"]}>
            <ButtonSecondary
              type="button"
              onClick={mode.onSwitch}
              disabled={status.isLoading}
              className={classes["auth__btn--switch"]}
            >
              {mode.isLogin ? "Create Account" : "Log in"}
            </ButtonSecondary>
            <Button
              disabled={status.isLoading}
              className={classes["auth__btn--submit"]}
            >
              {status.isLoading && <Spinner size="small" />}
              <span>{mode.isLogin ? "Log in" : "Sign up"}</span>
            </Button>
          </div>
        </form>
      )}
      {mode.isLogin && (
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
