import {
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  FolderArrowDownIcon,
  FolderPlusIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "../ui/image/Image";
import LinkA from "../ui/LinkA";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutTopPanel.module.scss";
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
import TextButtonSaved from "../ui/text/text-buttons/TextButtonSaved";
import TextButtonCollection from "../ui/text/text-buttons/TextButtonCollection";
import AboutAddImageById from "./AboutAddImageById";

const AboutTopPanel = () => {
  return (
    <>
      <H2 id="top">Top Panel</H2>
      <TextContentBlock>
        <H3 id="search">Search</H3>
        <Text>
          The quick search shows the first five results and allows you to search
          not only for models but also for categories or subcategories, and open
          them by click. By pressing the Enter button or{" "}
          <TextButtonTertiary>Show More</TextButtonTertiary>, you will go to the
          search page where you can see all results for models.
        </Text>
        <Text>
          The sidebar gives you quick access to the models and images you want
          to use right now. You can add up to three reference images and as many
          models as you like.
        </Text>
        <TextImageBlock col={2}>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/17-search.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/17-search.webp")}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/17-search-2.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/17-search-2.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <H3 id="queue">Download Queue</H3>
        <Text>
          When you click the image <TextHighlight>Download</TextHighlight>{" "}
          button, the image is added to the{" "}
          <TextHighlight>uploading queue</TextHighlight> in the Top Bar.
        </Text>
        <Text>
          Images <TextHighlight>successfully</TextHighlight> saved to a model or
          collection are displayed in the download queue in{" "}
          <span className={classes.green}>-Completed-</span>. You can use the
          download queue to <TextHighlight>quickly access</TextHighlight> the
          locations where you saved the latest images.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/15-queue-complete.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/15-queue-complete.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          If there are any <TextHighlight>connection issues</TextHighlight> with
          the server (maintenance on Civitai, etc) or if the internet connection
          is lost during the upload, the image will be moved to{" "}
          <span className={classes.red}>-Rejected-</span>. When the connection
          is restored, press the{" "}
          <TextButtonTertiary>Retry all</TextButtonTertiary> button in the
          download window to continue the upload. If the upload does not resume,
          try again after later.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/15-queue.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/15-queue.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <H3 id="nsfw">SFW and NSFW Modes</H3>
        <Text>
          You can use the toggle switch to change between SFW and NSFW modes.
          Models marked by the author on Civitai as NSFW will not be displayed
          in SFW mode. You can mark a model as NSFW or remove the mark in
          General Settings.
        </Text>
        <Text>
          For each model or tag set you can set two versions of the preview: SFW
          and NSFW. They will be displayed depending on the current mode. To do
          this, on the Model page use the image menu <TextImageMenu /> and
          select <TextHighlight>"Set as Preview"</TextHighlight>. If the NSFW
          mode is enabled, the menu will also include the option{" "}
          <TextHighlight>"Set as NSFW Preview"</TextHighlight>.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/16-nsfw.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/16-nsfw.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <NotificationMessage
          type="notification"
          className={classes.notification}
        >
          <Text>
            If you have SFW mode enabled, images marked by the author as NSFW
            will not be displayed among the model images and generation
            examples.
          </Text>
        </NotificationMessage>
      </TextContentBlock>
    </>
  );
};

export default AboutTopPanel;
