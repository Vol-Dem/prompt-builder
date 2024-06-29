import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import classes from "./Profile.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  authActions,
  changeUserName,
  changeUserPassword,
} from "../../store/auth";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useEffect, useState } from "react";
// import ButttonSecondary from "../../components/ui/ButtonSecondary";
import { ReactComponent as UserIcon } from "./../../assets/user.svg";
import ButtonTertiary from "../ui/ButtonTertiary";
import {
  DEF_INPUT_ERROR_MESSAGE,
  OFFLINE_ERROR_MESSAGE,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from "../../variables/constants";

const Profile = ({ title }) => {
  const [userName, setUserName] = useState({
    value: "",
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: "",
    isValid: false,
  });
  const [changeNameIsActive, setChangeNameIsActive] = useState(false);
  const [changePassIsActive, setChangePassIsActive] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const errorMessageAuth = useSelector((state) => state.auth.errorMessage);
  const userData = useSelector((state) => state.auth.user);

  useEffect(() => {
    document.title = title;
  }, [title]);

  //Switch visibility of change name form
  const changeNameIsActiveHandler = () => {
    setUserName({
      value: "",
      isValid: false,
    });
    setChangeNameIsActive((prevState) => !prevState);
  };

  //Switch visibility of change password form
  const changePassIsActiveHandler = () => {
    setPassword({
      value: "",
      isValid: false,
    });
    setChangePassIsActive((prevState) => !prevState);
  };

  //Retrive data from form and dispatch changeUserPassword action with new password
  const changePasswordHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
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

    dispatch(changeUserPassword(password.value));
  };

  //Retrive data from form and dispatch changeUserName action with new name
  const changeNameHandler = (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(authActions.setErrorMessage(""));
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

  const passForm = (
    <form onSubmit={changePasswordHandler} className={classes["profile__form"]}>
      <div>Password: {!changePassIsActive && <span>********</span>}</div>
      <div className={classes["profile__field"]}>
        {changePassIsActive && (
          <>
            <Input
              // label="Password"
              name="password"
              type="password"
              // input={{ disabled: isLoading }}
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
              autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        <ButtonTertiary
          className={classes["btn"]}
          type="button"
          onClick={changePassIsActiveHandler}
        >
          {!changePassIsActive ? "Change" : "Cancel"}
        </ButtonTertiary>
      </div>
    </form>
  );

  return (
    <section className={classes.profile}>
      <Card>
        <div className={classes["profile__container"]}>
          <div className={classes["profile__img"]}>
            <UserIcon />
          </div>
          <div>
            <h1 className={classes["profile__title"]}>Profile</h1>
            <div className={classes["profile__info"]}>
              <div className={classes["profile__element"]}>{nameForm}</div>
              <div className={classes["profile__element"]}>
                <div>Email: {userData.email}</div>
              </div>
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
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default Profile;
