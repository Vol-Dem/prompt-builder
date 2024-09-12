import firebaseApp from "../../firebase-config";
import { getAuth, sendEmailVerification } from "firebase/auth";
import WarningMessage from "../ui/WarningMessage";
import classes from "./VerifyEmailMessage.module.scss";
import { useState } from "react";
import SuccessMessage from "../ui/SuccessMessage";
import ErrorMessage from "../ui/ErrorMessage";
import Spinner from "../ui/Spinner";
import { DEF_ERROR_MESSAGE } from "../../variables/constants";

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

      await sendEmailVerification(auth.currentUser);

      setIsLoading(false);
      setSuccessMessage("Request sent, check your email");
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(DEF_ERROR_MESSAGE);
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
