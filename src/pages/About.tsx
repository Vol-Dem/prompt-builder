import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import classes from "./About.module.scss";
import { DEFAULT_PAGE_TITLE } from "../variables/constants";
import AboutNav from "../components/about/about-nav/AboutNav";

interface AboutProps {
  title: string;
}

/**
 * About page.
 *
 * High-level route responsible for displaying About section layout
 * and rendering nested subpages.
 *
 * Responsibilities:
 * - Displays right sidebar navigation.
 * - Renders active About subpage content.
 *
 * Side effects:
 * - Sets and restores `document.title`.
 * - Resets scroll position on navigation.
 *
 * @component
 *
 * @param props
 * @param props.title - Page title.
 *
 * @returns About page layout.
 */
const About = ({ title }: AboutProps) => {
  useEffect(() => {
    document.title = title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
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
