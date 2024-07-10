import { useState } from "react";
import Input from "../../ui/Input";
import classes from "./AuthForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { useDispatch, useSelector } from "react-redux";
import { authActions, authRequest } from "../../../store/auth";
import Buttton from "../../ui/Button";
import { useValidation } from "../../../hooks/use-validation";
import { useEffect } from "react";
import ButttonSecondary from "../../ui/ButtonSecondary";
import {
  DEF_INPUT_ERROR_MESSAGE,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  PASSWORD_MAX_LENGTH,
} from "../../../variables/constants";
import Checkbox from "../../ui/Checkbox";

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
  const isLoading = useSelector((state) => state.auth.isLoading);

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
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
      dispatch(authActions.setErrorMessage("agreement"));
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
    <section className={classes.auth}>
      <h3 className={classes["auth__title"]}>
        {isLogin ? "Log in" : "Sign Up"}
      </h3>
      <form onSubmit={authHandler} className={classes["auth__form"]}>
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
              <div>
                I have read and agree to the{" "}
                <a className={classes.link} href="#" target="blank">
                  Terms of service
                </a>
              </div>
            }
            onChange={agreementHandler}
          />
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
    </section>
  );
};

export default AuthForm;
