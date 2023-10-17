import React, { useState } from "react";
import classes from "./Tab.module.scss";

const Tab = (props) => {
  const [curTab, setCurTab] = useState([]);

  const openTabHandler = (e) => {
    setCurTab(e.target.id);
    console.log(e.target.id);
    console.log(props.children);
    console.log(curTab);
  };

  const tabsHtml = props.tabsNames.map((tab, i) => (
    <li key={i} id={tab} onClick={openTabHandler}>
      {tab}
    </li>
  ));

  return (
    <div>
      <ul className={classes.tabs}>{tabsHtml}</ul>
      <div>{props.children}</div>
    </div>
  );
};

export default Tab;
