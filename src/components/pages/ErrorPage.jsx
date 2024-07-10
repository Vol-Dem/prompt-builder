import React from "react";
import { NavLink, useLocation, useRouteError } from "react-router-dom";
import Card from "../ui/Card";
import classes from "./ErrorPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Buttton from "../ui/Button";
import { authActions } from "../../store/auth";
import Header from "../layout/header/Header";
import Modal from "../ui/Modal";
import AuthForm from "../forms/Auth/AuthForm";

const ErrorPage = () => {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const error = useRouteError();
  const dispatch = useDispatch();
  const location = useLocation();
  console.log(location);

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };

  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  console.log(error);
  return (
    <section className={classes["error-page"]}>
      <Card className={classes["error-card"]}>
        <h1 className={classes["error-page__title"]}>{error.status}</h1>
        <p className={classes["error-page__subtitle"]}>
          Sorry, an unexpected error has occurred.
        </p>
        <p className={classes["error-page__message"]}>
          <i>{error.statusText || error.message}</i>
        </p>
        {!isAuth && error.status === 404 && (
          <Buttton onClick={openAuth} className={classes["btn-auth"]}>
            Sign In
          </Buttton>
        )}
        {error.status === 404 && (
          // <div className={classes["error-page__message"]}>
          //   {" "}
          //   Back to{" "}
          <NavLink to="/" className={classes["error-page__link"]}>
            Home
          </NavLink>
          // </div>
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
