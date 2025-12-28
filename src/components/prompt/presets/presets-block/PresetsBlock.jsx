import classes from "./PresetsBlock.module.scss";

const PresetsBlock = ({ title, children }) => {
  return (
    <div>
      <div className={classes[`title`]}>{title}:</div>
      <div className={classes[`content`]}>{children}</div>
    </div>
  );
};

export default PresetsBlock;
