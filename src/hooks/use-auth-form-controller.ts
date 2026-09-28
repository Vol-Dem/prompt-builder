import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";

import { authActions } from "../store/auth";
import { authRequest, authWithGoogle } from "../store/authThunks";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { MESSAGE_AGREEMENT, ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_OFFLINE } from "../variables/constants";

/** Owns authentication form state and actions; field validation rules stay in the form. */
const useAuthFormController = () => {
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
  const errorMessageAuth = useAppSelector((state) => state.auth.errorMessage);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showResetPassword = useAppSelector(
    (state) => state.auth.showResetPassword,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(authActions.setErrorMessage(""));
      dispatch(authActions.setSuccessMessage(""));
      dispatch(authActions.setShowResetPassword(false));
    };
  }, [dispatch]);

  const authHandler = async (e: SubmitEvent) => {
    e.preventDefault();
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    setShowErrorMessage(true);
    if (!navigator?.onLine) {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_OFFLINE));
      return;
    }

    if (!agreement && !isLogin) {
      dispatch(authActions.setErrorMessage(MESSAGE_AGREEMENT));
      return;
    }

    if (email.isValid && password.isValid) {
      dispatch(authRequest(isLogin, email.value, password.value));
    } else {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_INPUT_DEF));
    }
  };

  const switchSignType = () => {
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    dispatch(authActions.setShowResetPassword(false));
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

  const changeEmail = (e: ChangeEvent<HTMLInputElement>, isValid: boolean | null) => {
    setEmail({ value: e.target.value, isValid: isValid === null ? true : isValid });
  };

  const changePassword = (e: ChangeEvent<HTMLInputElement>, isValid: boolean | null) => {
    setPassword({ value: e.target.value, isValid: isValid === null ? true : isValid });
  };

  const openPasswordReset = () => {
    dispatch(authActions.setErrorMessage(""));
    dispatch(authActions.setSuccessMessage(""));
    dispatch(authActions.setShowResetPassword(true));
  };

  const signInWithGoogle = () => {
    dispatch(authWithGoogle());
  };

  return {
    fields: {
      email: { ...email, onChange: changeEmail },
      password: { ...password, onChange: changePassword },
      agreement: { checked: agreement, onChange: agreementHandler },
    },
    mode: { isLogin, showResetPassword, onSwitch: switchSignType, openPasswordReset },
    status: { isLoading, errorMessage: errorMessageAuth, showErrorMessage },
    actions: { submit: authHandler, signInWithGoogle },
  };
};

export default useAuthFormController;
