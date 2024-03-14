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

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  const [emailState, validateEmail] = useValidation("email");
  const { isValid: emailIsValid, errorMessage: emailErrorMessage } = emailState;

  const [passwordState, validatePassword] = useValidation("password");
  const { isValid: passwordIsValid, errorMessage: passwordErrorMessage } =
    passwordState;

  const errorMessageAuth = useSelector((state) => state.auth.errorMessage);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
    };
  }, [dispatch]);

  const validateEmailOnChange = (e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  const validatePasswordOnChange = (e) => {
    setPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const showEmailErrorHandler = () => {
    setShowEmailError(true);
  };
  const showPasswordErrorHandler = () => {
    setShowPasswordError(true);
  };

  const signIn = async (e) => {
    e.preventDefault();
    validateEmail(email);
    validatePassword(password);
    setShowEmailError(true);
    setShowPasswordError(true);

    if (!emailIsValid || !passwordIsValid) {
      dispatch(authActions.setErrorMessage("Invalid input data"));
    } else {
      dispatch(authRequest(isLogin, email, password));
    }
  };

  const signUp = () => {
    dispatch(authActions.setErrorMessage(""));
    setIsLogin((state) => !state);
  };

  return (
    <section className={classes.auth}>
      <h3 className={classes["auth__title"]}>
        {isLogin ? "Log in" : "Sign Up"}
      </h3>
      <form onSubmit={signIn} className={classes["auth__form"]}>
        <Input
          label="Email"
          name="email"
          type="email"
          input={{ disabled: isLoading }}
          className={`${classes["auth__input"]} ${
            showEmailError && !emailIsValid ? classes.invalid : ""
          }`}
          onBlur={showEmailErrorHandler}
          error={showEmailError && emailErrorMessage}
          autoFocus={true}
          onChange={validateEmailOnChange}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          input={{ disabled: isLoading }}
          className={`${classes["auth__input"]} ${
            showPasswordError && !passwordIsValid ? classes.invalid : ""
          }`}
          onBlur={showPasswordErrorHandler}
          error={showPasswordError && passwordErrorMessage}
          onChange={validatePasswordOnChange}
        />
        {errorMessageAuth && (
          <ErrorMessage className={classes["auth__error"]}>
            {errorMessageAuth}
          </ErrorMessage>
        )}
        <div className={classes["auth__controls"]}>
          <ButttonSecondary type="button" onClick={signUp} disabled={isLoading}>
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
