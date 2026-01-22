import { NavLink, useRouteError } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Card from "../ui/Card";
import classes from "./ErrorPage.module.scss";
import Buttton from "../ui/buttons/Button";
import { authActions } from "../../store/auth";
import Modal from "../ui/Modal";
import AuthForm from "../forms/Auth/AuthForm";
import { ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

/**
 * Error page.
 *
 * High-level route responsible for displaying application errors
 * (e.g. 404 and unexpected route failures).
 *
 * Responsibilities:
 * - Displays error status and user-friendly messages.
 * - Provides navigation back to the home page.
 * - Prompts unauthenticated users to sign in (for 404 cases).
 *
 * Side effects:
 * - Opens and closes the authentication modal via Redux.
 *
 * @component
 * @returns {JSX.Element} Error page layout.
 */
const ErrorPage = () => {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const error = useRouteError();
  const dispatch = useDispatch();

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };

  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  return (
    <section className={classes["error-page"]}>
      <Card className={classes["error-card"]}>
        {error?.status && (
          <h1 className={classes["error-page__title"]}>{error.status}</h1>
        )}
        <p className={classes["error-page__subtitle"]}>
          Sorry, an unexpected error has occurred.
        </p>
        <p className={classes["error-page__message"]}>
          {error.status !== 404 && <i>{ERROR_MESSAGE_DEFAULT}</i>}
          {error.status === 404 && <i>Page not found</i>}
        </p>
        {!isAuth && error.status === 404 && (
          <Buttton onClick={openAuth} className={classes["btn-auth"]}>
            Sign In
          </Buttton>
        )}
        {error.status === 404 && (
          <NavLink to="/" className={classes["error-page__link"]}>
            Home
          </NavLink>
        )}
      </Card>
      {authIsOpen && (
        <Modal onClose={closeAuth}>
          <AuthForm />
        </Modal>
      )}
    </section>
  );
};

export default ErrorPage;
