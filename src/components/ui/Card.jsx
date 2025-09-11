import classes from "./Card.module.scss";

function Card({ children, className, ...props }) {
  return (
    <div className={`${classes.card} ${className || ""}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
