import { useEffect } from "react";
import classes from "./Home.module.scss";
import { Outlet } from "react-router-dom";

function Home({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={classes["wrap"]}>
      <div className={classes["config"]}>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
