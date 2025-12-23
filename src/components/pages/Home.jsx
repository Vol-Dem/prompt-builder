import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import classes from "./Home.module.scss";
import Tabs from "../tabs/Tabs";

function Home({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={classes["wrap"]}>
      <div className={classes["config"]}>
        <Tabs />
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
