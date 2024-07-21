import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import classes from "./Profile.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  authActions,
  changeUserEmail,
  changeUserName,
  changeUserPassword,
} from "../../store/auth";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useEffect, useState } from "react";
// import ButttonSecondary from "../../components/ui/ButtonSecondary";
import { ReactComponent as UserIcon } from "./../../assets/user.svg";
import ButtonTertiary from "../ui/ButtonTertiary";
import {
  AUTH_ERROR_MESSAGE,
  DEF_INPUT_ERROR_MESSAGE,
  EMAIL_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from "../../variables/constants";
import SuccessMessage from "../ui/SuccessMessage";
import firebaseApp from "../../firebase-config";
import { getAuth, sendEmailVerification } from "firebase/auth";
import ReAuthForm from "../forms/ReAuth/ReAuthForm";
import Modal from "../ui/Modal";
import WarningMessage from "../ui/WarningMessage";

const auth = getAuth(firebaseApp);

const Profile = ({ title }) => {
  const [userName, setUserName] = useState({
    value: "",
    isValid: false,
  });
  const [email, setEmail] = useState({
    value: "",
    isValid: false,
  });
  const [oldPassword, setOldPassword] = useState({
    value: "",
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: "",
    isValid: false,
  });
  const [changeNameIsActive, setChangeNameIsActive] = useState(false);
  const [changeEmailIsActive, setChangeEmailIsActive] = useState(false);
  const [changePassIsActive, setChangePassIsActive] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();
  const errorMessageAuth = useSelector((state) => state.auth.errorMessage);
  const successMessageAuth = useSelector((state) => state.auth.successMessage);
  const userData = useSelector((state) => state.auth.user);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const reAuthIsOpen = useSelector((state) => state.auth.reAuthFormIsOpen);

  useEffect(() => {
    document.title = title;
  }, [title]);

  const closeReAuth = () => {
    dispatch(authActions.setReauthFormIsOpen(false));
  };

  //Switch visibility of change name form
  const changeNameIsActiveHandler = () => {
    setUserName({
      value: "",
      isValid: false,
    });
    setChangeNameIsActive((prevState) => !prevState);
  };

  //Switch visibility of change email form
  const changeEmailIsActiveHandler = () => {
    setEmail({
      value: "",
      isValid: false,
    });
    setChangeEmailIsActive((prevState) => !prevState);
  };

  //Switch visibility of change password form
  const changePassIsActiveHandler = () => {
    setPassword({
      value: "",
      isValid: false,
    });
    setChangePassIsActive((prevState) => !prevState);
  };

  //Retrive data from form and dispatch changeUserEmail action with new email
  const changeEmailHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    if (!email.isValid) {
      setErrorMessage(DEF_INPUT_ERROR_MESSAGE);
      setShowErrorMessage(true);
      return;
    }

    if (!navigator?.onLine) {
      setErrorMessage(OFFLINE_ERROR_MESSAGE);
      setShowErrorMessage(true);
      return;
    }

    dispatch(changeUserEmail(email.value));
    setChangePassIsActive(false);
  };

  //Retrive data from form and dispatch changeUserPassword action with new password
  const changePasswordHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    if (!password.isValid) {
      setErrorMessage(DEF_INPUT_ERROR_MESSAGE);
      setShowErrorMessage(true);
      return;
    }

    if (!navigator?.onLine) {
      setErrorMessage(OFFLINE_ERROR_MESSAGE);
      setShowErrorMessage(true);
      return;
    }

    dispatch(changeUserPassword(password.value, oldPassword.value));
    setPassword({
      value: "",
      isValid: false,
    });
    setOldPassword({
      value: "",
      isValid: false,
    });
    // setChangePassIsActive(false);
  };

  //Retrive data from form and dispatch changeUserName action with new name
  const changeNameHandler = (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    if (!userName.isValid) {
      setErrorMessage(DEF_INPUT_ERROR_MESSAGE);
      setShowErrorMessage(true);
      return;
    }

    if (!navigator?.onLine) {
      setErrorMessage(OFFLINE_ERROR_MESSAGE);
      setShowErrorMessage(true);
      return;
    }

    dispatch(changeUserName(userName.value));
    setChangeNameIsActive(false);
  };

  const nameForm = (
    <form onSubmit={changeNameHandler} className={classes["profile__form"]}>
      <div>
        Name:{" "}
        {!changeNameIsActive && (
          <span>{userData.userName || userData.email.split("@")[0]}</span>
        )}
      </div>
      <div className={classes["profile__field"]}>
        {changeNameIsActive && (
          <>
            <Input
              name="name"
              type="text"
              // input={{ disabled: isLoading }}
              className={`${classes["auth__input"]} ${
                showErrorMessage && !userName.isValid ? classes.invalid : ""
              }`}
              // onBlur={showPasswordErrorHandler}
              // error={showPasswordError && passwordErrorMessage}
              onChange={(e, isValid) => {
                setUserName({ value: e.target.value, isValid });
              }}
              validation={{
                disableErrorOnBlur: true,
                required: true,
                maxLength: USERNAME_MAX_LENGTH,
              }}
              showError={showErrorMessage}
              value={userName.value}
              autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        <ButtonTertiary
          className={classes["btn"]}
          type="button"
          onClick={changeNameIsActiveHandler}
        >
          {!changeNameIsActive ? "Change" : "Cancel"}
        </ButtonTertiary>
      </div>
    </form>
  );

  const emailForm = (
    <form onSubmit={changeEmailHandler} className={classes["profile__form"]}>
      <div>Email: {!changeEmailIsActive && <span>{userData.email}</span>}</div>
      <div className={classes["profile__field"]}>
        {changeEmailIsActive && (
          <>
            <Input
              // label="Password"
              name="email"
              type="email"
              // input={{ disabled: isLoading }}
              className={`${classes["auth__input"]} ${
                showErrorMessage && !email.isValid ? classes.invalid : ""
              }`}
              // onBlur={showPasswordErrorHandler}
              // error={showPasswordError && passwordErrorMessage}
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
              autoFocus={true}
            />
            <Input
              label="Password"
              name="cur-password"
              type="password"
              // input={{ disabled: isLoading }}
              className={`${classes["auth__input"]} ${
                showErrorMessage && !password.isValid ? classes.invalid : ""
              }`}
              // onBlur={showPasswordErrorHandler}
              // error={showPasswordError && passwordErrorMessage}
              onChange={(e, isValid) => {
                setOldPassword({ value: e.target.value, isValid });
              }}
              validation={{
                disableErrorOnBlur: true,
                // required: true,
                // password: true,
                // maxLength: PASSWORD_MAX_LENGTH,
              }}
              showError={showErrorMessage}
              value={oldPassword.value}
              autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        {false && (
          <ButtonTertiary
            className={classes["btn"]}
            type="button"
            onClick={changeEmailIsActiveHandler}
          >
            {!changeEmailIsActive ? "Change" : "Cancel"}
          </ButtonTertiary>
        )}
      </div>
    </form>
  );

  const passForm = (
    <form onSubmit={changePasswordHandler} className={classes["profile__form"]}>
      {/* <div>Password: {!changePassIsActive && <span>********</span>}</div> */}
      <div className={classes["profile__pass-field"]}>
        {changePassIsActive && (
          <>
            <Input
              label="Current password"
              name="cur-password"
              type="password"
              // input={{ disabled: isLoading }}
              className={`${classes["auth__input"]} ${
                showErrorMessage && !password.isValid ? classes.invalid : ""
              }`}
              // onBlur={showPasswordErrorHandler}
              // error={showPasswordError && passwordErrorMessage}
              onChange={(e, isValid) => {
                setOldPassword({ value: e.target.value, isValid });
              }}
              validation={{
                disableErrorOnBlur: true,
                // required: true,
                // password: true,
                // maxLength: PASSWORD_MAX_LENGTH,
              }}
              showError={showErrorMessage}
              value={oldPassword.value}
              autoFocus={true}
            />
            <Input
              label="New password"
              name="password"
              type="password"
              className={`${classes["auth__input"]} ${
                showErrorMessage && !password.isValid ? classes.invalid : ""
              }`}
              onChange={(e, isValid) => {
                setPassword({ value: e.target.value, isValid });
              }}
              validation={{
                required: true,
                password: true,
                maxLength: PASSWORD_MAX_LENGTH,
                disableErrorOnBlur: true,
              }}
              showError={showErrorMessage}
              value={password.value}
              // autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        <ButtonTertiary
          className={classes["btn"]}
          type="button"
          onClick={changePassIsActiveHandler}
        >
          {!changePassIsActive ? "Change password" : "Cancel"}
        </ButtonTertiary>
      </div>
    </form>
  );

  const resendVerificationEmailHandler = async () => {
    await sendEmailVerification(auth.currentUser);
    setSuccessMessage("Check your email");
  };

  const profileHtml = (
    <Card>
      <div className={classes["profile__container"]}>
        <div className={classes["profile__img"]}>
          <UserIcon />
        </div>
        <div>
          <h1 className={classes["profile__title"]}>Profile</h1>
          <div className={classes["profile__info"]}>
            <div className={classes["profile__element"]}>{nameForm}</div>
            {/* <div className={classes["profile__element"]}>
              <div>Email: {userData.email}</div>
            </div> */}
            <div className={classes["profile__element"]}>{emailForm}</div>
            <div className={classes["profile__element"]}>{passForm}</div>

            {errorMessageAuth && (
              <ErrorMessage className={classes["auth__error"]}>
                {errorMessageAuth}
              </ErrorMessage>
            )}
            {errorMessage && (
              <ErrorMessage className={classes["auth__error"]}>
                {errorMessage}
              </ErrorMessage>
            )}
            {!userData.emailVerified && (
              <WarningMessage>
                Email is not verified{" "}
                <span
                  className={classes.link}
                  onClick={resendVerificationEmailHandler}
                >
                  resend request
                </span>{" "}
              </WarningMessage>
            )}
            {successMessage && (
              <SuccessMessage className={classes["auth__error"]}>
                {successMessage}
              </SuccessMessage>
            )}
            {successMessageAuth && (
              <SuccessMessage className={classes["auth__error"]}>
                {successMessageAuth}
              </SuccessMessage>
            )}
            {reAuthIsOpen && (
              <Modal onClose={closeReAuth}>
                <ReAuthForm />
              </Modal>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <section className={classes.profile}>
      {isAuth && profileHtml}

      {!isAuth && <ErrorMessage>{AUTH_ERROR_MESSAGE}</ErrorMessage>}
    </section>
  );
};

export default Profile;
