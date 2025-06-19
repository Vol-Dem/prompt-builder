import { useEffect } from "react";
import classes from "./About.module.scss";
import LinkA from "../ui/LinkA";
import Image from "../ui/image/Image";
import {
  ArrowDownTrayIcon,
  Bars2Icon,
  Bars4Icon,
  CheckIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  FolderArrowDownIcon,
  FolderPlusIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import TextHighlight from "../ui/text/TextHighlight";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextButtonAll from "../ui/text/text-buttons/TextButtonAll";
import TextButtonTertiary from "../ui/text/text-buttons/TextButtonTertiary";
import TextButtonSaved from "../ui/text/text-buttons/TextButtonSaved";
import TextButtonSquare from "../ui/text/text-buttons/TextButtonSquare";
import TextImageMenu from "../ui/text/text-buttons/TextImageMenu";
import ImageComparisonSlider from "../ImageComparisonSlider/ImageComparisonSlider";
import NotificationMessage from "../ui/NotificationMessage";
import Video from "../ui/Video";
import InfoPostId from "../ui/guide/info/InfoPostId";
import StartAddingModels from "../about/AboutStartAddingModels";
import WorkingWithPrompts from "../about/AboutWorkingWithPrompts";
import AboutStartAddingModels from "../about/AboutStartAddingModels";
import AboutWorkingWithPrompts from "../about/AboutWorkingWithPrompts";
import H2 from "../ui/text/H2";
import Text from "../ui/text/Text";
import TextContentBlock from "../ui/text/TextContentBlock";
import TextImageBlock from "../ui/text/TextImageBlock";
import AboutTagSets from "../about/AboutTagSets";
import AboutModelSettings from "../about/AboutModelSettings";
import AboutModelPage from "../about/AboutModelPage";
import AboutImageCollections from "../about/AboutImageCollections";
import AboutTopPanel from "../about/AboutTopPanel";
import AboutSidebar from "../about/AboutSidebar";
import AboutCategoryEdit from "../about/AboutCategoryEdit";

const About = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  return (
    <div className={classes.about}>
      <div className="terminal-header__date-time"></div>
      <h1 className={classes["about__h1"]}>About</h1>
      <Text>
        This platform offers a variety of features, such as the using trigger
        words from models and images as tags for quick and easy modification of
        prompts, adding current models and image references to the sidebar for
        quick access, and extended configuration options, etc.
      </Text>
      <Text>
        AIDE-TOOLS provides a centralized solution for storing and managing
        collections. It is versatile and independent of popular web interfaces,
        so, you can use the generated prompt in any web interface or for online
        generation on Civitai.
      </Text>
      <div className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}>
        <Image
          loading="lazy"
          width={1909}
          height={918}
          fullView={true}
          className={classes["img"]}
          src={require("../../assets/about/1-start-1.webp")}
          srcSet={require("../../assets/about/1-start-1.webp")}
          alt="about-image"
        />

        <Image
          loading="lazy"
          width={1909}
          height={918}
          fullView={true}
          className={classes["img"]}
          src={require("../../assets/about/1-start-2.webp")}
          srcSet={require("../../assets/about/1-start-2.webp")}
          alt="about-image"
        />
      </div>
      <Text>
        With the help of the AIde-tools platform you can create your own
        collection of your favorite models and easily work with them:
      </Text>
      <TextContentBlock>
        <ul className={classes["about__list"]}>
          <li className={classes["about__list-item"]}>
            Make your prompt building clear and effortless: the system
            automatically{" "}
            <TextHighlight>splits your prompt into tags</TextHighlight> with the
            option to switch between modes at any moment.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>Track and remove duplicates</TextHighlight>: each of
            them has a unique highlighted color that makes it easy to manage.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>Easily insert BREAKs</TextHighlight> using a separate
            button to organize your prompt and improve its logic and
            readability.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>Use drag and drop</TextHighlight> to quickly adjust
            the position of trigger words.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Adjust the weight and content of trigger words
            </TextHighlight>{" "}
            by simply clicking on a tag.
          </li>
          <li>
            <ImageComparisonSlider
              className={classes.comparison}
              srcLeft={require("../../assets/guide/prompt-text.jpg")}
              srcRight={require("../../assets/guide/prompt-tags.jpg")}
            />
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Add trigger words to prompt from models and images
            </TextHighlight>{" "}
            with just one click using the built-in tag system.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Easily track which trigger words are already in the prompt
            </TextHighlight>
            : each trigger word present in the prompt is highlighted, making it
            simple to manage them.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>Save and organize reference images</TextHighlight> by
            saving them to a specific model or by creating themed collections.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Assign preview images to models and collections
            </TextHighlight>{" "}
            for easier browsing and visual structure, with the option to set
            separate ones for SFW and NSFW modes.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Edit, organize and update model information
            </TextHighlight>
            : edit existing model information and add additional, add activation
            tag, set the recommended weight.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Split trigger words by related groups (positive, negative, helper)
            </TextHighlight>{" "}
            to easily work with them. Add or remove an entire group of trigger
            words with ease, without worrying about duplicates.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Create a sets of trigger words for generating specific outfits,
              appearances, or other concepts
            </TextHighlight>
            , and assign preview images to easily tell them apart.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>Mark versions as downloaded</TextHighlight> to easily
            track which ones you already have.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Pin models, collections, and images to the sidebar
            </TextHighlight>{" "}
            and quickly switch between them.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Create presets of positive and negative trigger words
            </TextHighlight>
            , and easily add them to your prompt.
          </li>
          <li className={classes["about__list-item"]}>
            <TextHighlight>
              Search for models and image collections
            </TextHighlight>{" "}
            by name, tag, or file name and add them directly from the search
            results.
            <TextHighlight>
              {" "}
              Get quick access to desired categories or subcategories
            </TextHighlight>{" "}
            through quick search field.
          </li>
        </ul>
      </TextContentBlock>
      <NotificationMessage type="notification" className={classes.notification}>
        <p>
          This is a non-profit project that exists thanks to your support. If
          you like AIDE-TOOLS, support the project on{" "}
          <LinkA
            external={true}
            href="https://www.patreon.com/aidetools"
            smoothScroll
          >
            Patreon
          </LinkA>{" "}
          or{" "}
          <LinkA
            external={true}
            href="https://ko-fi.com/J3J31052RE"
            smoothScroll
          >
            Ko-Fi
          </LinkA>
        </p>
      </NotificationMessage>

      <H2 className={classes["about__h2"]}>Guide</H2>
      <TextContentBlock>
        <ul className={classes["about__list"]}>
          <li className={classes["about__list-item"]}>
            <LinkA href="#start" smoothScroll>
              Start: Adding Models
            </LinkA>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#category" smoothScroll>
              Category edit
            </LinkA>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#prompt" smoothScroll>
              Working with Prompts
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#preset" smoothScroll>
                  Adding Presets
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#model" smoothScroll>
              Model Page
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#sets" smoothScroll>
                  Tag Sets
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#sets" smoothScroll>
                  Tag Sets Preview
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#images" smoothScroll>
                  Generated Images
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#settings" smoothScroll>
              Model Settings
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#gsettings" smoothScroll>
                  General Settings
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#vsettings" smoothScroll>
                  Version Settings
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#collection" smoothScroll>
              Image collections
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#coll-model" smoothScroll>
                  From a model page
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#coll-sidebar" smoothScroll>
                  Through the sidebar
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#coll-post" smoothScroll>
                  Add image by post ID
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#coll-preview" smoothScroll>
                  Collection preview
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#top" smo>
              Top Panel
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#queue" smoothScroll>
                  Download Queue
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#nsfw" smoothScroll>
                  SFW and NSFW Modes
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#search" smoothScroll>
                  Search
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#sidebar" smoothScroll>
              Sidebar
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#references" smoothScroll>
                  Adding References
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#addmodels" smoothScroll>
                  Adding Models
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#expanded" smoothScroll>
                  Expanded and Compact View
                </LinkA>
              </li>
            </ul>
          </li>
        </ul>
      </TextContentBlock>
      <AboutStartAddingModels />
      <AboutCategoryEdit />
      <AboutWorkingWithPrompts />
      <AboutModelPage />
      <AboutModelSettings />
      <AboutImageCollections />
      <AboutTopPanel />
      <AboutSidebar />
    </div>
  );
};

export default About;
