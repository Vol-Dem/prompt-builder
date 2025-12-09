import Image from "../ui/image/Image";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutTopPanel.module.scss";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextContentBlock from "../ui/text/TextContentBlock";
import TextButtonTertiary from "../ui/text/text-buttons/TextButtonTertiary";
import H3 from "../ui/text/H3";
import TextImageMenu from "../ui/text/text-buttons/TextImageMenu";
import NotificationMessage from "../ui/NotificationMessage";
import AboutContentWrap from "./layout/AboutContentWrap";
import H1 from "../ui/text/H1";
import AboutSection from "./layout/AboutSection";

/**
 * Content for the About page "Top Panel" section.
 *
 * @component
 * @returns {JSX.Element} The "Top Panel" section content.
 */
const AboutTopPanel = () => {
  return (
    <AboutContentWrap>
      <H1 id="top">Top Panel</H1>
      <TextContentBlock>
        <AboutSection id="search">
          <H3>Search</H3>
          <Text>
            The quick search shows the first five results and allows you to
            search not only for models but also for subcategories, and open them
            by click. By pressing the Enter button or{" "}
            <TextButtonTertiary>Show More</TextButtonTertiary>, you will go to
            the search page where you can see all results for models.
          </Text>
          <TextImageBlock col={2}>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/17-search.jpg")}
              alt="Search"
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
              alt="Search 2"
              srcSet={require("../../assets/about/17-search-2.webp")}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="queue">
          <H3>Download Queue</H3>
          <Text>
            When you click the <TextHighlight>Save</TextHighlight> button on the
            image, it is added to the{" "}
            <TextHighlight>uploading queue</TextHighlight> in the Top Bar.
          </Text>
          <Text>
            Images <TextHighlight>successfully</TextHighlight> saved to a model
            or collection are displayed in the download queue under{" "}
            <span className={classes.green}>-Completed-</span>. You can use the
            use the Uploading queue to{" "}
            <TextHighlight>quickly access</TextHighlight> your recently saved
            images
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/15-queue-complete.jpg")}
              alt="Queue"
              srcSet={require("../../assets/about/15-queue-complete.webp")}
              type="image/webp"
            />
          </TextImageBlock>
          <Text>
            If there are any <TextHighlight>connection issues</TextHighlight>{" "}
            with the server (maintenance on Civitai, etc) or if the internet
            connection is lost during the upload, the image will be moved to{" "}
            <span className={classes.red}>-Rejected-</span>. When the connection
            is restored, press the{" "}
            <TextButtonTertiary>Retry all</TextButtonTertiary> button in the
            download window to continue the upload. If the upload does not
            resume, try again later.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/15-queue.jpg")}
              alt="Queue 2"
              srcSet={require("../../assets/about/15-queue.webp")}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="mode">
          <H3>SFW and NSFW Modes</H3>
          <Text>
            You can use the toggle switch to change between SFW and NSFW modes.
            Models marked by the author on Civitai as NSFW will not be displayed
            in SFW mode. You can mark a model as NSFW or remove the mark in
            General Settings.
          </Text>
          <Text>
            For each model or tag set you can set two versions of the preview:
            SFW and NSFW. They will be displayed depending on the current mode.
            To do this, on the Model page use the image menu <TextImageMenu />{" "}
            and select <TextHighlight>"Set as Preview"</TextHighlight>. If the
            NSFW mode is enabled, the menu will also include the option{" "}
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
              alt="Switch"
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
        </AboutSection>
      </TextContentBlock>
    </AboutContentWrap>
  );
};

export default AboutTopPanel;
