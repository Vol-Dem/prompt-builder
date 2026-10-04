import { useState, type ChangeEvent, type SubmitEvent } from "react";

import { authActions } from "../store/auth";
import { changeUserEmail, changeUserName, changeUserPassword } from "../store/authThunks";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_OFFLINE } from "../variables/constants";

/** Owns profile drafts and editing actions; validation rules and page UI stay in Profile. */
const useProfileEditingController = () => {
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
  const changeEmailHandler = async (e: SubmitEvent<HTMLFormElement>) => {
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
    e: SubmitEvent<HTMLFormElement>,
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
  const changeNameHandler = (e: SubmitEvent<HTMLFormElement>) => {
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

  const changeNameInput = (e: ChangeEvent<HTMLInputElement>, isValid: boolean | null) => {
    setUserName({ value: e.target.value, isValid: isValid === null ? true : isValid });
  };

  const changeEmailInput = (e: ChangeEvent<HTMLInputElement>, isValid: boolean | null) => {
    setEmail({ value: e.target.value, isValid: isValid === null ? true : isValid });
  };

  const changeOldPasswordInput = (e: ChangeEvent<HTMLInputElement>, isValid: boolean | null) => {
    setOldPassword({ value: e.target.value, isValid: isValid === null ? true : isValid });
  };

  const changePasswordInput = (e: ChangeEvent<HTMLInputElement>, isValid: boolean | null) => {
    setPassword({ value: e.target.value, isValid: isValid === null ? true : isValid });
  };

  return {
    name: {
      input: { ...userName, onChange: changeNameInput },
      isActive: changeNameIsActive,
      onToggle: changeNameIsActiveHandler,
      onSubmit: changeNameHandler,
    },
    email: {
      input: { ...email, onChange: changeEmailInput },
      isActive: changeEmailIsActive,
      onToggle: changeEmailIsActiveHandler,
      onSubmit: changeEmailHandler,
    },
    password: {
      current: { ...oldPassword, onChange: changeOldPasswordInput },
      next: { ...password, onChange: changePasswordInput },
      isActive: changePassIsActive,
      onToggle: changePassIsActiveHandler,
      onSubmit: changePasswordHandler,
    },
    status: { showErrorMessage, errorMessage, errorMessageAuth, successMessageAuth },
  };
};

export default useProfileEditingController;
