import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";

import classes from "./About.module.scss";
import AboutNav from "../components/about/about-nav/AboutNav";
import Spinner from "../components/ui/Spinner";
import { smoothScroll } from "../utils/generalUtils";
import usePageTitle from "../hooks/use-page-title";

interface AboutProps {
  title: string;
}

type AboutRouteHandle = { pageTitle?: string };

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
 * @param props.title - Fallback title when child route metadata is absent.
 *
 * @returns About page layout.
 */
const About = ({ title }: AboutProps) => {
  const matches = useMatches();
  const pageTitle = matches.reduce((matchedTitle, match) => {
    const handle = match.handle as AboutRouteHandle | undefined;
    return handle?.pageTitle ?? matchedTitle;
  }, title);
  usePageTitle(pageTitle);

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
