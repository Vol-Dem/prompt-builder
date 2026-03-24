import { isRouteErrorResponse, NavLink, useRouteError } from "react-router-dom";

import classes from "./ErrorPage.module.scss";
import { authActions } from "../store/auth";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import Card from "../components/ui/Card";
import Buttton from "../components/ui/buttons/Button";
import Modal from "../components/ui/Modal";
import AuthForm from "../components/forms/Auth/AuthForm";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";

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
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useAppSelector((state) => state.auth.authFormIsOpen);
  const dispatch = useAppDispatch();
  const error = useRouteError() as Error;
  let errorStatus: number | null = null;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
  }

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };

  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  return (
    <section className={classes["error-page"]}>
      <Card className={classes["error-card"]}>
        {errorStatus && (
          <h1 className={classes["error-page__title"]}>{errorStatus}</h1>
        )}
        <p className={classes["error-page__subtitle"]}>
          Sorry, an unexpected error has occurred.
        </p>
        <p className={classes["error-page__message"]}>
          {errorStatus !== 404 && <i>{ERROR_MESSAGE_DEFAULT}</i>}
          {errorStatus === 404 && <i>Page not found</i>}
        </p>
        {!isAuth && errorStatus === 404 && (
          <Buttton onClick={openAuth} className={classes["btn-auth"]}>
            Sign In
          </Buttton>
        )}
        {errorStatus === 404 && (
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
