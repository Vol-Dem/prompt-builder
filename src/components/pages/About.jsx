import { useEffect } from "react";
import classes from "./About.module.scss";
import AboutNav from "../about/about-nav/AboutNav";
import { Outlet } from "react-router-dom";

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
        <div className="terminal-header__date-time"></div>
        <Outlet />
      </div>
    </div>
  );
};

export default About;
