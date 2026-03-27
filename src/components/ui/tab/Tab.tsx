import type { ReactNode } from "react";
import classes from "./Tab.module.scss";

type TabProps = {
  tabsNames: string[];
  openTabHandler: () => void;
  children: ReactNode;
};

const Tab = ({ tabsNames, openTabHandler, children }: TabProps) => {
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
