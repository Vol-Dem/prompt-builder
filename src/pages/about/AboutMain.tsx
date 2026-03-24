import ImageComparisonSlider from "../../components/ui/image-comparison-slider/ImageComparisonSlider";
import NotificationMessage from "../../components/ui/NotificationMessage";
import H1 from "../../components/ui/text/H1";
import List from "../../components/ui/text/List";
import ListItem from "../../components/ui/text/ListItem";
import Text from "../../components/ui/text/Text";
import TextContentBlock from "../../components/ui/text/TextContentBlock";
import TextHighlight from "../../components/ui/text/TextHighlight";
import Video from "../../components/ui/Video";
import classes from "./AboutMain.module.scss";
import AboutContentWrap from "../../components/about/layout/AboutContentWrap";
import introWebm from "../../assets/home/intro-s.webp";
import introMp4 from "../../assets/home/intro.mp4";
import compSliderLeftImg from "../../assets/guide/prompt-text.webp";
import compSliderRightImg from "../../assets/guide/prompt-tags.webp";
import patreonLogoWhite from "../../assets/patreon-w.png";
import kofiLogoDark from "../../assets/kofi_bg_tag_dark.webp";

/**
 * Content for the About page "About" section.
 *
 * @component
 * @returns {JSX.Element} The "About" section content.
 */
const AboutMain = () => {
  return (
    <AboutContentWrap>
      <H1 id="#about">About</H1>
      <TextContentBlock>
        <Text>
          This platform offers a variety of features, such as using trigger
          words from models and images as tags for quick and easy modification
          of prompts, adding current models and image references to the sidebar
          for quick access, extended configuration options, and other
          customization features.
        </Text>
        <Text>
          AIDE-TOOLS provides a centralized solution for storing and managing
          collections. It is versatile and independent of popular web
          interfaces, so you can use the generated prompt in any web interface
          or for online generation on Civitai.
        </Text>
        <div className={classes["video-container"]}>
          <Video
            playsInline
            disablePictureInPicture
            controls
            width={1280}
            height={720}
            poster={introWebm}
            className={classes["video"]}
          >
            <source src={introMp4} type="video/mp4" />
          </Video>
        </div>
      </TextContentBlock>
      <TextContentBlock>
        <Text>
          With the help of the AIDE-TOOLS platform you can create your own
          collection of your favorite models and easily work with them:
        </Text>
        <List>
          <ListItem>
            <TextHighlight>Split your prompt into tags</TextHighlight>{" "}
            automatically with the option to switch between modes at any moment
            and make your prompt building clear and effortless
          </ListItem>
          <ListItem>
            <TextHighlight>Track and remove duplicates</TextHighlight>: each
            duplicate is highlighted in a unique color that makes it easy to
            manage.
          </ListItem>
          <ListItem>
            <TextHighlight>Easily insert BREAKs</TextHighlight> using a separate
            button to organize your prompt and improve its logic and
            readability.
          </ListItem>
          <ListItem>
            <TextHighlight>Use drag and drop</TextHighlight> to quickly adjust
            the position of trigger words.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Adjust the weight and content of trigger words
            </TextHighlight>{" "}
            by simply clicking on a tag.
            <ImageComparisonSlider
              imgWidth="1714"
              imgHeight="626"
              className={classes.comparison}
              srcLeft={compSliderLeftImg}
              srcRight={compSliderRightImg}
            />
          </ListItem>
          <ListItem>
            <TextHighlight>
              Add trigger words to the prompt from models and images
            </TextHighlight>{" "}
            with just one click using the built-in tag system.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Easily track which trigger words are already in the prompt
            </TextHighlight>
            : each trigger word present in the prompt is highlighted, making it
            simple to manage them.
          </ListItem>
          <ListItem>
            <TextHighlight>Save and organize reference images</TextHighlight> by
            saving them to a specific model or by creating themed collections.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Assign preview images to models and collections
            </TextHighlight>{" "}
            for easier browsing and visual structure, with the option to set
            separate ones for SFW and NSFW modes.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Edit, organize and update model information
            </TextHighlight>
            : edit existing model information and add additional data, add
            activation tag, set the recommended weight.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Split trigger words by related groups (positive, negative, helper)
            </TextHighlight>{" "}
            to easily work with them. Add or remove an entire group of trigger
            words with ease, without worrying about duplicates.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Create sets of trigger words for generating specific outfits,
              appearances, or other concepts
            </TextHighlight>
            , and assign preview images to easily tell them apart.
          </ListItem>
          <ListItem>
            <TextHighlight>Mark versions as downloaded</TextHighlight> to easily
            track which ones you already have.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Pin models, collections, and images to the sidebar
            </TextHighlight>{" "}
            and quickly switch between them.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Create presets of positive and negative trigger words
            </TextHighlight>
            , and easily add them to your prompt.
          </ListItem>
          <ListItem>
            <TextHighlight>
              Search for models and image collections
            </TextHighlight>{" "}
            by name, tag, or file name and add them directly from the search
            results.
            <TextHighlight>
              {" "}
              Get quick access to desired categories or subcategories
            </TextHighlight>{" "}
            through the quick search field.
          </ListItem>
        </List>
      </TextContentBlock>
      <NotificationMessage type="notification" className={classes.notification}>
        <p>
          This is a non-profit project that exists thanks to your support. If
          you like AIDE-TOOLS, support the project on{" "}
          <a
            href="https://www.patreon.com/aidetools"
            target="_blank"
            rel="noreferrer nofollow noopener"
          >
            <img
              width={520}
              height={108}
              loading="lazy"
              src={patreonLogoWhite}
              alt="https://www.patreon.com/aidetools"
              className={classes["img-link"]}
            />
          </a>{" "}
          or{" "}
          <a
            href="https://ko-fi.com/J3J31052RE"
            target="_blank"
            rel="noreferrer nofollow noopener"
          >
            <img
              width={341}
              height={129}
              loading="lazy"
              src={kofiLogoDark}
              alt="https://ko-fi.com/J3J31052RE"
              className={classes["img-link"]}
            />
          </a>
        </p>
      </NotificationMessage>
    </AboutContentWrap>
  );
};

export default AboutMain;
