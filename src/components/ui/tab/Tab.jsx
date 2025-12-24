import classes from "./Tab.module.scss";

const Tab = ({ tabsNames, openTabHandler, children }) => {
  const tabsHtml = tabsNames.map((tab, i) => (
    <li key={i} id={tab} onClick={openTabHandler}>
      {tab}
    </li>
  ));

  return (
    <div>
      <ul className={classes.tabs}>{tabsHtml}</ul>
      <div>{children}</div>
    </div>
  );
};

export default Tab;
