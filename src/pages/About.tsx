import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import classes from "./About.module.scss";
import { DEFAULT_PAGE_TITLE } from "../variables/constants";
import AboutNav from "../components/about/about-nav/AboutNav";
import Spinner from "../components/ui/Spinner";
import { smoothScroll } from "../utils/generalUtils";

interface AboutProps {
  title: string;
}

// Commit the scroll effect with the content, after any lazy page has loaded.
const AboutOutlet = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) smoothScroll(location.hash);
  }, [location]);

  return <Outlet />;
};

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
        <Suspense fallback={<Spinner />}>
          <AboutOutlet />
        </Suspense>
      </div>
    </div>
  );
};

export default About;
