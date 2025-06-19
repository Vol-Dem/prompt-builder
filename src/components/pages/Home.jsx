import { lazy, useEffect } from "react";
import classes from "./Home.module.scss";
import { Outlet, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Landing from "../landing/Landing";
// const Landing = lazy(() => import("../landing/Landing"));

function Home({ title }) {
  // const isAuth = useSelector((state) => state.auth.isLoggedIn);
  // const initialAuth = useSelector((state) => state.auth.initialAuth);
  // const location = useLocation();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={classes["wrap"]}>
      <div className={classes["config"]}>
        <Outlet />
      </div>
      {/* {!isAuth && initialAuth && location?.pathname === "/" && <Landing />} */}
    </div>
  );
}

export default Home;
