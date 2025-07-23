import classes from "./ListItem.module.scss";

const ListItem = ({ id, sub, className, children, ...props }) => {
  return (
    <li id={id} className={`${classes.item} ${sub ? classes['item--sub'] : ''} ${className || ""}`} {...props}>
      {children}
    </li>
  );
};

export default ListItem;