import classes from "./List.module.scss";

const List = ({ id, className, sub, children, ...props }) => {
  return (
    <ul id={id} className={`${classes.list} ${sub ? classes['list--sub'] :''} ${className || ""}`} {...props}>
      {children}
    </ul>
  );
};

export default List;
