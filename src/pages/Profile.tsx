import { UserCircleIcon } from "@heroicons/react/24/outline";

import classes from "./Profile.module.scss";
import { authActions } from "../store/auth";
import {
  ERROR_MESSAGE_AUTH,
  VALIDATION_EMAIL_MAX_LENGTH,
  VALIDATION_PASSWORD_MAX_LENGTH,
  VALIDATION_USERNAME_MAX_LENGTH,
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
import useProfileEditingController from "../hooks/use-profile-editing-controller";
import usePageTitle from "../hooks/use-page-title";

interface ProfileProps {
  title: string;
}

const changeEmailActive = false;

const Profile = ({ title }: ProfileProps) => {
  const { name, email, password, status } = useProfileEditingController();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.user);
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const reAuthIsOpen = useAppSelector((state) => state.auth.reAuthFormIsOpen);
  const uid = useAppSelector((state) => state.auth.user.uid);

  usePageTitle(title);

  const closeReAuth = () => {
    dispatch(authActions.setReauthFormIsOpen(false));
  };

  const nameForm = (
    <form onSubmit={name.onSubmit} className={classes["profile__form"]}>
      <div>
        <span className={classes["profile__field-name"]}>Name:</span>{" "}
        {!name.isActive && (
          <span>{userData.userName || userData?.email?.split("@")[0]}</span>
        )}
      </div>
      <div className={classes["profile__field"]}>
        {name.isActive && (
          <>
            <Input
              id="name"
              name="name"
              type="text"
              className={`${classes["auth__input"]} ${
                status.showErrorMessage && !name.input.isValid ? classes.invalid : ""
              }`}
              onChange={name.input.onChange}
              validation={{
                disableErrorOnBlur: true,
                required: true,
                maxLength: VALIDATION_USERNAME_MAX_LENGTH,
              }}
              showError={status.showErrorMessage}
              value={name.input.value}
              autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        <ButtonTertiary
          className={classes["btn"]}
          type="button"
          onClick={name.onToggle}
        >
          {!name.isActive ? "Change" : "Cancel"}
        </ButtonTertiary>
      </div>
    </form>
  );

  const emailForm = (
    <form onSubmit={email.onSubmit} className={classes["profile__form"]}>
      <div>
        <span className={classes["profile__field-name"]}>Email:</span>{" "}
        {!email.isActive && <span>{userData.email}</span>}
      </div>
      <div className={classes["profile__field"]}>
        {email.isActive && (
          <>
            <Input
              id="email"
              name="email"
              type="email"
              className={`${classes["auth__input"]} ${
                status.showErrorMessage && !email.input.isValid ? classes.invalid : ""
              }`}
              onChange={email.input.onChange}
              validation={{
                required: true,
                email: true,
                maxLength: VALIDATION_EMAIL_MAX_LENGTH,
              }}
              showError={status.showErrorMessage}
              value={email.input.value}
              autoFocus={true}
            />
            <Input
              label="Password"
              id="cur-password"
              name="cur-password"
              type="password"
              className={`${classes["auth__input"]} ${
                status.showErrorMessage && !password.next.isValid ? classes.invalid : ""
              }`}
              onChange={password.current.onChange}
              validation={{
                disableErrorOnBlur: true,
              }}
              showError={status.showErrorMessage}
              value={password.current.value}
              autoFocus={true}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        {changeEmailActive && (
          <ButtonTertiary
            className={classes["btn"]}
            type="button"
            onClick={email.onToggle}
          >
            {!email.isActive ? "Change" : "Cancel"}
          </ButtonTertiary>
        )}
      </div>
    </form>
  );

  const passForm = (
    <form onSubmit={password.onSubmit} className={classes["profile__form"]}>
      <div className={classes["profile__pass-field"]}>
        {password.isActive && (
          <>
            <Input
              label="Current password"
              id="cur-password"
              name="cur-password"
              type="password"
              className={`${classes["auth__input"]} ${
                status.showErrorMessage && !password.next.isValid ? classes.invalid : ""
              }`}
              onChange={password.current.onChange}
              validation={{
                disableErrorOnBlur: true,
              }}
              showError={status.showErrorMessage}
              value={password.current.value}
              autoFocus={true}
            />
            <Input
              label="New password"
              id="password"
              name="password"
              type="password"
              className={`${classes["auth__input"]} ${
                status.showErrorMessage && !password.next.isValid ? classes.invalid : ""
              }`}
              onChange={password.next.onChange}
              validation={{
                required: true,
                password: true,
                maxLength: VALIDATION_PASSWORD_MAX_LENGTH,
                disableErrorOnBlur: true,
              }}
              showError={status.showErrorMessage}
              value={password.next.value}
            />
            <ButtonTertiary className={classes["btn"]}>Submit</ButtonTertiary>
          </>
        )}
        <ButtonTertiary
          className={classes["btn"]}
          type="button"
          onClick={password.onToggle}
        >
          {!password.isActive ? "Change password" : "Cancel"}
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

            {status.errorMessageAuth && (
              <ErrorMessage className={classes["auth__error"]}>
                {status.errorMessageAuth}
              </ErrorMessage>
            )}
            {status.errorMessage && (
              <ErrorMessage className={classes["auth__error"]}>
                {status.errorMessage}
              </ErrorMessage>
            )}
            {!userData.emailVerified && <VerifyEmailMessage />}
            {status.successMessageAuth && (
              <SuccessMessage className={classes["auth__error"]}>
                {status.successMessageAuth}
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
