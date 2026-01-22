import {
  Bars2Icon,
  Bars4Icon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Image from "../../ui/image/Image";
import classes from "./AboutSidebar.module.scss";
import Text from "../../ui/text/Text";
import TextImageBlock from "../../ui/text/TextImageBlock";
import TextContentBlock from "../../ui/text/TextContentBlock";
import TextButtonTertiary from "../../ui/text/text-buttons/TextButtonTertiary";
import TextButtonSquare from "../../ui/text/text-buttons/TextButtonSquare";
import AboutContentWrap from "../../about/layout/AboutContentWrap";
import H1 from "../../ui/text/H1";
import H3 from "../../ui/text/H3";
import AboutSection from "../../about/layout/AboutSection";
import sidebar1 from "../../../assets/about/18-sidebar-1.jpg";
import sidebar1Webp from "../../../assets/about/18-sidebar-1.webp";
import sidebar2 from "../../../assets/about/18-sidebar-2.jpg";
import sidebar2Webp from "../../../assets/about/18-sidebar-2.webp";

/**
 * Content for the About page "Sidebar" section.
 *
 * @component
 * @returns {JSX.Element} The "Sidebar" section content.
 */
const AboutSidebar = () => {
  return (
    <AboutContentWrap>
      <H1 id="sidebar" className={classes["about__h2"]}>
        Sidebar
      </H1>
      <TextContentBlock>
        <Text>
          The sidebar gives you quick access to the models and images you want
          to use right now.
        </Text>
        <AboutSection id="references">
          <H3>Adding References</H3>
          <Text className={classes["about__text"]}>
            To add an image as a reference, go to the model page and click the{" "}
            <TextButtonSquare>
              <PlusIcon />
            </TextButtonSquare>{" "}
            on the desired image. The{" "}
            <TextButtonSquare>
              <PlusIcon />
            </TextButtonSquare>{" "}
            will turn into a{" "}
            <TextButtonSquare className={classes.check}>
              <CheckIcon />
            </TextButtonSquare>
            , you can click it again to remove the image from the sidebar. You
            can also remove an image directly from the sidebar by clicking{" "}
            <XMarkIcon
              className={`${classes["svg"]} ${classes["svg--medium"]}`}
            />
            . If you've already added three images, the{" "}
            <TextButtonSquare>
              <PlusIcon />
            </TextButtonSquare>{" "}
            button on other images will be disabled until you remove at least
            one from the sidebar. To view details of a reference image, click it
            in the sidebar. A pop-up window will show details about the
            generation, including the prompt, used resources, and more.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={sidebar1}
              alt="Sidebar"
              srcSet={sidebar1Webp}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="addmodels">
          <H3>Adding Models</H3>
          <Text className={classes["about__text"]}>
            To add a model to the sidebar, click the{" "}
            <TextButtonSquare>
              <PlusIcon />
            </TextButtonSquare>{" "}
            on the model card or the{" "}
            <TextButtonSquare>
              <PlusIcon />
            </TextButtonSquare>{" "}
            next to the name on the model page.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={sidebar2}
              alt="Sidebar 2"
              srcSet={sidebar2Webp}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="expanded">
          <H3>Expanded and Compact View</H3>
          <Text className={classes["about__text"]}>
            You can toggle the model info display in the sidebar between compact
            and expanded views using the{" "}
            <TextButtonSquare>
              <Bars2Icon />
            </TextButtonSquare>{" "}
            and{" "}
            <TextButtonSquare>
              <Bars4Icon />
            </TextButtonSquare>{" "}
            buttons. In the compact view, you&rsquo;ll see the image, name,
            version, and model type. In the expanded view, you&rsquo;ll also see
            the weight, activation tag, and trigger words. You can add or remove
            trigger words from the prompt by clicking them in the sidebar, just
            like on the model page.
          </Text>
          <Text>
            To clear all references and models from the sidebar, use the{" "}
            <TextButtonTertiary>
              <TrashIcon /> Clear
            </TextButtonTertiary>{" "}
            button.
          </Text>
        </AboutSection>
      </TextContentBlock>
    </AboutContentWrap>
  );
};

export default AboutSidebar;
