import classes from "./Maintenance.module.scss";

/**
 * Content for the Maintenance page.
 *
 * @component
 * @returns The Maintenance page content.
 */
const Maintenance = () => {
  return (
    <div className={classes.maintenance}>
      <h1 className={classes["title"]}>We'll be back</h1>
      <p className={classes["text"]}>
        Sorry, we're down for maintenance. Please check back soon
      </p>
    </div>
  );
};

export default Maintenance;
