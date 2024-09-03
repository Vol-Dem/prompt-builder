import classes from "./Maintenance.module.scss";

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
