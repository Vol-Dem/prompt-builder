import { useState } from "react";
import Input from "../../ui/Input";
import classes from "./AuthForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { useDispatch, useSelector } from "react-redux";
import {
  authActions,
  authRequest,
  authWithGoogle,
  resetUserPassword,
} from "../../../store/auth";
import Buttton from "../../ui/Button";
import { useValidation } from "../../../hooks/use-validation";
import { useEffect } from "react";
import ButttonSecondary from "../../ui/ButtonSecondary";
import {
  AGREEMENT_MESSAGE,
  DEF_INPUT_ERROR_MESSAGE,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  PASSWORD_MAX_LENGTH,
} from "../../../variables/constants";
import Checkbox from "../../ui/Checkbox";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import ButtonTertiary from "../../ui/ButtonTertiary";
import LinkA from "../../ui/LinkA";
import SuccessMessage from "../../ui/SuccessMessage";
import { Link } from "react-router-dom";

const provider = new GoogleAuthProvider();
const auth = getAuth();

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [resetPasswordIsOpen, setResetPasswordIsOpen] = useState(false);
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
  // const [showEmailError, setShowEmailError] = useState(false);
  // const [showPasswordError, setShowPasswordError] = useState(false);

  // const [emailState, validateEmail] = useValidation({
  //   email: true,
  //   required: true,
  // });
  // const { isValid: emailIsValid, errorMessage: emailErrorMessage } = emailState;

  // const [passwordState, validatePassword] = useValidation({
  //   required: true,
  //   password: true,
  // });
  // const { isValid: passwordIsValid, errorMessage: passwordErrorMessage } =
  //   passwordState;

  const errorMessageAuth = useSelector((state) => state.auth.errorMessage);
  const successMessage = useSelector((state) => state.auth.successMessage);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const showResetPassword = useSelector(
    (state) => state.auth.showResetPassword
  );

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
      dispatch(authActions.setSuccessMessage(""));
      dispatch(authActions.setShowResetPassword(false));
    };
  }, [dispatch]);

  // const validateEmailOnChange = (e) => {
  //   setEmail(e.target.value);
  //   validateEmail(e.target.value);
  // };

  // const validatePasswordOnChange = (e) => {
  //   setPassword(e.target.value);
  //   validatePassword(e.target.value);
  // };

  // const showEmailErrorHandler = () => {
  //   setShowEmailError(true);
  // };
  // const showPasswordErrorHandler = () => {
  //   setShowPasswordError(true);
  // };

  const authHandler = async (e) => {
    e.preventDefault();
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    setShowErrorMessage(true);
    // validateEmail(email);
    // validatePassword(password);
    // setShowEmailError(true);
    // setShowPasswordError(true);
    // console.log("WTF", emailErrorMessage);
    if (!navigator?.onLine) {
      dispatch(authActions.setErrorMessage(OFFLINE_ERROR_MESSAGE));
      return;
    }

    if (!agreement && !isLogin) {
      dispatch(authActions.setErrorMessage(AGREEMENT_MESSAGE));
      return;
    }

    if (!email.isValid || !password.isValid) {
      dispatch(authActions.setErrorMessage(DEF_INPUT_ERROR_MESSAGE));
    } else {
      dispatch(authRequest(isLogin, email.value, password.value));
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

  // const authWithGoogleHandler = async () => {
  //   await signInWithPopup(auth, provider)
  //     .then((result) => {
  //       // This gives you a Google Access Token. You can use it to access the Google API.
  //       const credential = GoogleAuthProvider.credentialFromResult(result);
  //       const token = credential.accessToken;
  //       // The signed-in user info.
  //       const user = result.user;
  //       // IdP data available using getAdditionalUserInfo(result)
  //       // ...
  //       console.log(credential);
  //       console.log(token);
  //       console.log(user);
  //     })
  //     .catch((error) => {
  //       // Handle Errors here.
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       // The email of the user's account used.
  //       const email = error.customData.email;
  //       // The AuthCredential type that was used.
  //       const credential = GoogleAuthProvider.credentialFromError(error);
  //       console.log("ERR");
  //       console.log(errorCode);
  //       console.log(errorMessage);
  //       console.log(email);
  //       console.log(credential);
  //       // ...
  //     });
  // };

  const resetPassHandler = (e) => {
    e.preventDefault();
    dispatch(resetUserPassword(email.value));
  };

  const resetPasswordForm = (
    <form onSubmit={resetPassHandler} className={classes["auth__form"]}>
      <Input
        label="Email"
        name="email"
        type="email"
        input={{ disabled: isLoading }}
        className={`${classes["auth__input"]} ${
          showErrorMessage && !email.isValid ? classes.invalid : ""
        }`}
        // onBlur={showEmailErrorHandler}
        // error={showEmailError && emailErrorMessage}
        autoFocus={true}
        onChange={(e, isValid) => {
          setEmail({ value: e.target.value, isValid });
        }}
        validation={{
          required: true,
          email: true,
          maxLength: EMAIL_MAX_LENGTH,
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
      <Buttton>Reset password</Buttton>
    </form>
  );

  return (
    <section className={classes.auth}>
      {!showResetPassword && (
        <h3 className={classes["auth__title"]}>
          {isLogin ? "Log in" : "Sign Up"}
        </h3>
      )}
      {showResetPassword && resetPasswordForm}
      {!showResetPassword && (
        <form onSubmit={authHandler} className={classes["auth__form"]}>
          {isLogin && (
            <Buttton
              type="button"
              onClick={() => {
                dispatch(authWithGoogle());
              }}
            >
              <img
                className={classes["icon"]}
                alt="google-icon"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              ></img>{" "}
              Sign in with Google
            </Buttton>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            input={{ disabled: isLoading }}
            className={`${classes["auth__input"]} ${
              showErrorMessage && !email.isValid ? classes.invalid : ""
            }`}
            // onBlur={showEmailErrorHandler}
            // error={showEmailError && emailErrorMessage}
            autoFocus={true}
            onChange={(e, isValid) => {
              setEmail({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              email: true,
              maxLength: EMAIL_MAX_LENGTH,
            }}
            showError={showErrorMessage}
            value={email.value}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            input={{ disabled: isLoading }}
            className={`${classes["auth__input"]} ${
              showErrorMessage && !password.isValid ? classes.invalid : ""
            }`}
            // onBlur={showPasswordErrorHandler}
            // error={showPasswordError && passwordErrorMessage}
            onChange={(e, isValid) => {
              setPassword({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              password: true,
              maxLength: PASSWORD_MAX_LENGTH,
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
              {/* <span>Forgot your password?</span> */}
              {/* <span></span> */}
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
            <Buttton
              disabled={isLoading}
              className={classes["auth__btn--submit"]}
            >
              {isLoading && <Spinner size="small" />}
              <span>{isLogin ? "Log in" : "Sign up"}</span>
            </Buttton>
          </div>
        </form>
      )}
      {isLogin && (
        <div className={classes["privacy"]}>
          {/* I have read and agree to the{" "} */}
          By continuing, you are indicating that you accept our
          <Link className={classes.link} to="tos" target="blank">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className={classes.link} to="privacy" target="blank">
            Privacy Policy
          </Link>
        </div>
      )}
    </section>
  );
};

export default AuthForm;
