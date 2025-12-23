import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import classes from "./About.module.scss";
import AboutNav from "../about/about-nav/AboutNav";

const About = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={classes.about}>
      <AboutNav />
      <div className={classes["about__content"]}>
        <Outlet />
      </div>
    </div>
  );
};

export default About;
