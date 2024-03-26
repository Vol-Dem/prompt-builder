import classes from "./Header.module.scss";

const Header = (props) => {
  return (
    <header
      className={`${classes.header} ${true ? classes["header--sticky"] : ""}`}
    >
      {props.children}
    </header>
  );
};

export default Header;
