import { getAuth, sendEmailVerification } from "firebase/auth";
import { useState } from "react";

import firebaseApp from "../../../firebase-config";
import WarningMessage from "../../ui/WarningMessage";
import classes from "./VerifyEmailMessage.module.scss";
import SuccessMessage from "../../ui/SuccessMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import Spinner from "../../ui/Spinner";
import {
  AppError,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";
import { ERROR_MESSAGE_AUTH } from "../../../variables/constants";

const auth = getAuth(firebaseApp);

const VerifyEmailMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resendVerificationEmailHandler = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");
      setIsLoading(true);

      if (!auth.currentUser) {
        throw new AppError(ERROR_MESSAGE_AUTH);
      }

      await sendEmailVerification(auth.currentUser);

      setIsLoading(false);
      setSuccessMessage("Request sent, check your email");
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <WarningMessage>
        <p className={classes.message}>
          Email is not verified. Please follow the link in the email to start
          using the service.
        </p>
        <p className={classes.message}>
          Didn't receive the email?{" "}
          <span
            className={classes.link}
            onClick={resendVerificationEmailHandler}
          >
            Resend request
          </span>
        </p>
      </WarningMessage>
      {isLoading && <Spinner size="small" />}
      {errorMessage && (
        <ErrorMessage className={classes["auth__error"]}>
          {errorMessage}
        </ErrorMessage>
      )}
      {successMessage && (
        <SuccessMessage className={classes["auth__error"]}>
          {successMessage}
        </SuccessMessage>
      )}
    </div>
  );
};

export default VerifyEmailMessage;
