import {
  Bars2Icon,
  Bars4Icon,
  CheckIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "../ui/image/Image";
import LinkA from "../ui/LinkA";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutSidebar.module.scss";
import H2 from "../ui/text/H2";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextContentBlock from "../ui/text/TextContentBlock";
import TextButtonCreate from "../ui/text/text-buttons/TextButtonCreate";
import TextButtonTertiary from "../ui/text/text-buttons/TextButtonTertiary";
import ImageComparisonSlider from "../ImageComparisonSlider/ImageComparisonSlider";
import TextButtonAll from "../ui/text/text-buttons/TextButtonAll";
import H3 from "../ui/text/H3";
import Video from "../ui/Video";
import TextImageMenu from "../ui/text/text-buttons/TextImageMenu";
import NotificationMessage from "../ui/NotificationMessage";
import TextButtonSquare from "../ui/text/text-buttons/TextButtonSquare";

const AboutSidebar = () => {
  return (
    <>
      {" "}
      <H2 id="sidebar" className={classes["about__h2"]}>
        Sidebar
      </H2>
      <TextContentBlock>
        <p id="references" className={classes["about__text"]}>
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
          , you can click it again to remove the image from the sidebar. You can
          also remove an image directly from the sidebar by clicking{" "}
          <XMarkIcon
            className={`${classes["svg"]} ${classes["svg--medium"]}`}
          />
          . If you've already added three images, the{" "}
          <TextButtonSquare>
            <PlusIcon />
          </TextButtonSquare>{" "}
          button on other images will be inactive until you remove at least one
          from the sidebar. To view information about an added reference image,
          click on it in the sidebar. A pop-up window will show details about
          the generation, including the prompt, used resources, and more.
        </p>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/18-sidebar-1.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/18-sidebar-1.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <p id="addmodels" className={classes["about__text"]}>
          To add a model to the sidebar, click the{" "}
          <TextButtonSquare>
            <PlusIcon />
          </TextButtonSquare>{" "}
          on the model card or the{" "}
          <TextButtonSquare>
            <PlusIcon />
          </TextButtonSquare>{" "}
          next to the name on the model page.
        </p>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/18-sidebar-2.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/18-sidebar-2.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <p id="expanded" className={classes["about__text"]}>
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
        </p>
        <Text>
          To clear all references and models from the sidebar, use the{" "}
          <TextButtonTertiary>
            <TrashIcon /> Clear
          </TextButtonTertiary>{" "}
          button.
        </Text>
      </TextContentBlock>
    </>
  );
};

export default AboutSidebar;
