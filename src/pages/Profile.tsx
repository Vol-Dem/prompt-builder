import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";

import classes from "./Profile.module.scss";
import {
  authActions,
  changeUserEmail,
  changeUserName,
  changeUserPassword,
} from "../store/auth";
import {
  ERROR_MESSAGE_AUTH,
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_EMAIL_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  VALIDATION_PASSWORD_MAX_LENGTH,
  VALIDATION_USERNAME_MAX_LENGTH,
  DEFAULT_PAGE_TITLE,
} from "../variables/constants";
import Card from "../components/ui/Card";
import Input from "../components/ui/forms/Input";
import ErrorMessage from "../components/ui/ErrorMessage";
import ButtonTertiary from "../components/ui/buttons/ButtonTertiary";
import SuccessMessage from "../components/ui/SuccessMessage";
import ReAuthForm from "../components/forms/ReAuth/ReAuthForm";
import Modal from "../components/ui/Modal";
import VerifyEmailMessage from "../components/general-elements/verify-email-message/VerifyEmailMessage";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";

interface ProfileProps {
  title: string;
}

const changeEmailActive = false;

const Profile = ({ title }: ProfileProps) => {
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
  const dispatch = useAppDispatch();
  const errorMessageAuth = useAppSelector((state) => state.auth.errorMessage);
  const successMessageAuth = useAppSelector(
    (state) => state.auth.successMessage,
  );
  const userData = useAppSelector((state) => state.auth.user);
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const reAuthIsOpen = useAppSelector((state) => state.auth.reAuthFormIsOpen);
  const uid = useAppSelector((state) => state.auth.user.uid);

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
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
  const changeEmailHandler = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    if (!email.isValid) {
      setErrorMessage(ERROR_MESSAGE_INPUT_DEF);
      setShowErrorMessage(true);
      return;
    }

    if (!navigator?.onLine) {
      setErrorMessage(ERROR_MESSAGE_OFFLINE);
      setShowErrorMessage(true);
      return;
    }

    dispatch(changeUserEmail(email.value));
    setChangePassIsActive(false);
  };

  //Retrive data from form and dispatch changeUserPassword action with new password
  const changePasswordHandler = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    if (!password.isValid) {
      setErrorMessage(ERROR_MESSAGE_INPUT_DEF);
      setShowErrorMessage(true);
      return;
    }

    if (!navigator?.onLine) {
      setErrorMessage(ERROR_MESSAGE_OFFLINE);
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
  };

  //Retrive data from form and dispatch changeUserName action with new name
  const changeNameHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    if (!userName.isValid) {
      setErrorMessage(ERROR_MESSAGE_INPUT_DEF);
      setShowErrorMessage(true);
      return;
    }

    if (!navigator?.onLine) {
      setErrorMessage(ERROR_MESSAGE_OFFLINE);
      setShowErrorMessage(true);
      return;
    }

    dispatch(changeUserName(userName.value));
    setChangeNameIsActive(false);
  };

  const nameForm = (
    <form onSubmit={changeNameHandler} className={classes["profile__form"]}>
      <div>
        <span className={classes["profile__field-name"]}>Name:</span>{" "}
        {!changeNameIsActive && (
          <span>{userData.userName || userData?.email?.split("@")[0]}</span>
        )}
      </div>
      <div className={classes["profile__field"]}>
        {changeNameIsActive && (
          <>
            <Input
              id="name"
              name="name"
              type="text"
              className={`${classes["auth__input"]} ${
                showErrorMessage && !userName.isValid ? classes.invalid : ""
              }`}
              onChange={(e, isValid) => {
                setUserName({
                  value: e.target.value,
                  isValid: isValid === null ? true : isValid,
                });
              }}
              validation={{
                disableErrorOnBlur: true,
                required: true,
                maxLength: VALIDATION_USERNAME_MAX_LENGTH,
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
      <div>
        <span className={classes["profile__field-name"]}>Email:</span>{" "}
        {!changeEmailIsActive && <span>{userData.email}</span>}
      </div>
      <div className={classes["profile__field"]}>
        {changeEmailIsActive && (
          <>
            <Input
              id="email"
              name="email"
              type="email"
              className={`${classes["auth__input"]} ${
                showErrorMessage && !email.isValid ? classes.invalid : ""
              }`}
              onChange={(e, isValid) => {
                setEmail({
                  value: e.target.value,
                  isValid: isValid === null ? true : isValid,
                });
              }}
              validation={{
                required: true,
                email: true,
                maxLength: VALIDATION_EMAIL_MAX_LENGTH,
              }}
              showError={showErrorMessage}
              value={email.value}
              autoFocus={true}
            />
            <Input
              label="Password"
              id="cur-password"
              name="cur-password"
              type="password"
              className={`${classes["auth__input"]} ${
                showErrorMessage && !password.isValid ? classes.invalid : ""
              }`}
              onChange={(e, isValid) => {
                setOldPassword({
                  value: e.target.value,
                  isValid: isValid === null ? true : isValid,
                });
              }}
              validation={{
                disableErrorOnBlur: true,
              }}
              showError={showErrorMessage}
              value={oldPassword.value}
              autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        {changeEmailActive && (
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
      <div className={classes["profile__pass-field"]}>
        {changePassIsActive && (
          <>
            <Input
              label="Current password"
              id="cur-password"
              name="cur-password"
              type="password"
              className={`${classes["auth__input"]} ${
                showErrorMessage && !password.isValid ? classes.invalid : ""
              }`}
              onChange={(e, isValid) => {
                setOldPassword({
                  value: e.target.value,
                  isValid: isValid === null ? true : isValid,
                });
              }}
              validation={{
                disableErrorOnBlur: true,
              }}
              showError={showErrorMessage}
              value={oldPassword.value}
              autoFocus={true}
            />
            <Input
              label="New password"
              id="password"
              name="password"
              type="password"
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
                disableErrorOnBlur: true,
              }}
              showError={showErrorMessage}
              value={password.value}
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

  const profileHtml = (
    <Card>
      <div className={classes["profile__container"]}>
        <div className={classes["profile__img"]}>
          <UserCircleIcon />
        </div>
        <div>
          <h1 className={classes["profile__title"]}>Profile</h1>
          <div className={classes["profile__info"]}>
            <div className={classes["profile__element"]}>
              <span className={classes["profile__field-name"]}>UID:</span> {uid}
            </div>
            <div className={classes["profile__element"]}>{nameForm}</div>
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
            {!userData.emailVerified && <VerifyEmailMessage />}
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

      {!isAuth && <ErrorMessage>{ERROR_MESSAGE_AUTH}</ErrorMessage>}
    </section>
  );
};

export default Profile;
