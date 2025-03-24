import { useEffect } from "react";
import classes from "./Home.module.scss";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Landing from "../landing/Landing";

function Home({ title }) {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const location = useLocation();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={classes["wrap"]}>
      {isAuth && (
        <div className={classes["config"]}>
          <Outlet />
        </div>
      )}
      {!isAuth && location?.pathname === "/" && <Landing />}
    </div>
  );
}

export default Home;
