import { useState } from "react";
import Input from "../../ui/Input";
import classes from "./ReAuthForm.module.scss";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { useDispatch, useSelector } from "react-redux";
import {
  authActions,
  authRequest,
  authWithGoogle,
  reAuthUser,
  resetUserPassword,
} from "../../../store/auth";
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
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import ButtonTertiary from "../../ui/ButtonTertiary";

const provider = new GoogleAuthProvider();
const auth = getAuth();

const ReAuthForm = () => {
  const [password, setPassword] = useState({
    value: "",
    isValid: false,
  });
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const errorMessageAuth = useSelector((state) => state.auth.errorMessage);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
    };
  }, [dispatch]);

  const authHandlerPass = async (e) => {
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

    if (!password.isValid) {
      dispatch(authActions.setErrorMessage(DEF_INPUT_ERROR_MESSAGE));
    } else {
      dispatch(reAuthUser("pass", password.value));
    }
  };

  const authHandlerPopup = async (e) => {
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

    dispatch(reAuthUser("popup", password.value));
  };

  return (
    <section className={classes.auth}>
      <form onSubmit={authHandlerPass} className={classes["auth__form"]}>
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

        {errorMessageAuth && (
          <ErrorMessage className={classes["auth__error"]}>
            {errorMessageAuth}
          </ErrorMessage>
        )}
        <div className={classes["auth__controls"]}>
          <Buttton
            disabled={isLoading}
            className={classes["auth__btn--submit"]}
          >
            {isLoading && <Spinner size="small" />}
            <span>Submit</span>
          </Buttton>
        </div>
      </form>
      <Buttton onClick={authHandlerPopup}>Google</Buttton>
    </section>
  );
};

export default ReAuthForm;
