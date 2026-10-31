import Card from "./Card";
import Button from "./buttons/Button";
import classes from "./ErrorFallback.module.scss";
import { ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

type ErrorFallbackProps = { status?: number };

/** Recovery UI that also works outside the router and Redux provider. */
const ErrorFallback = ({ status }: ErrorFallbackProps) => {
  const title = "Sorry, an unexpected error has occurred.";

  return (
    <section role="alert" className={classes.fallback}>
      <Card className={classes.card}>
        <h1
          className={status === undefined ? classes.subtitle : classes.status}
        >
          {status ?? title}
        </h1>
        {status !== undefined && <p className={classes.subtitle}>{title}</p>}
        <p className={classes.message}>
          <i>{ERROR_MESSAGE_DEFAULT}</i>
        </p>
        <div className={classes.actions}>
          <Button type="button" onClick={() => location.reload()}>
            Reload
          </Button>
          <a href="/">Home</a>
        </div>
      </Card>
    </section>
  );
};

export default ErrorFallback;
