import { useEffect } from "react";
import classes from "./About.module.scss";
import LinkA from "../ui/LinkA";
// import Image from "../ui/image/Image";
import TextHighlight from "../ui/text/TextHighlight";
import ImageComparisonSlider from "../ImageComparisonSlider/ImageComparisonSlider";
import NotificationMessage from "../ui/NotificationMessage";
import AboutStartAddingModels from "../about/AboutStartAddingModels";
import AboutWorkingWithPrompts from "../about/AboutWorkingWithPrompts";
import H2 from "../ui/text/H2";
import Text from "../ui/text/Text";
import TextContentBlock from "../ui/text/TextContentBlock";
import AboutModelSettings from "../about/AboutModelSettings";
import AboutModelPage from "../about/AboutModelPage";
import AboutImageCollections from "../about/AboutImageCollections";
import AboutTopPanel from "../about/AboutTopPanel";
import AboutSidebar from "../about/AboutSidebar";
import AboutCategoryEdit from "../about/AboutCategoryEdit";
import Video from "../ui/Video";
import AboutNav from "../about/about-nav/AboutNav";
import AboutMain from "../about/AboutMain";
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
        {/*
        <AboutMain/> 
      </TextContentBlock>
      <AboutStartAddingModels />
      <AboutCategoryEdit />
      <AboutWorkingWithPrompts />
      <AboutModelPage />
      <AboutModelSettings />
      <AboutImageCollections />
      <AboutTopPanel />
      <AboutSidebar /> */}
      </div>
    </div>
  );
};

export default About;
