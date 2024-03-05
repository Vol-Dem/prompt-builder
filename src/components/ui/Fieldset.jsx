import classes from "./Fieldset.module.scss";

const Fieldset = (props) => {
  const { legend, className } = props;
  return (
    <fieldset className={`${classes.fieldset} ${className || ""}`}>
      <legend className={classes.legend}>{legend}</legend>
      {props.children}
    </fieldset>
  );
};

export default Fieldset;
