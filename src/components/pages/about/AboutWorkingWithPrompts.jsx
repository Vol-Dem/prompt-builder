import {
  ChevronUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import Image from "../../ui/image/Image";
import TextButton from "../../ui/text/text-buttons/TextButton";
import TextHighlight from "../../ui/text/TextHighlight";
import classes from "./AboutWorkingWithPrompts.module.scss";
import Text from "../../ui/text/Text";
import TextImageBlock from "../../ui/text/TextImageBlock";
import TextContentBlock from "../../ui/text/TextContentBlock";
import TextButtonTertiary from "../../ui/text/text-buttons/TextButtonTertiary";
import ImageComparisonSlider from "../../ui/image-comparison-slider/ImageComparisonSlider";
import TextButtonAll from "../../ui/text/text-buttons/TextButtonAll";
import H3 from "../../ui/text/H3";
import Video from "../../ui/Video";
import NotificationMessage from "../../ui/NotificationMessage";
import AboutContentWrap from "../../about/layout/AboutContentWrap";
import H1 from "../../ui/text/H1";
import AboutSection from "../../about/layout/AboutSection";
import faqPromptPoster from "../../../assets/guide/3-faq-prompt.jpg";
import faqPromptMp4 from "../../../assets/guide/3-faq-prompt.mp4";
import compSliderImgLeft from "../../../assets/guide/prompt-text.webp";
import compSliderImgRight from "../../../assets/guide/prompt-tags.webp";
import prompt from "../../../assets/about/6-prompt.jpg";
import promptWebp from "../../../assets/about/6-prompt.webp";
import tags from "../../../assets/about/7-tags.jpg";
import tagsWebp from "../../../assets/about/7-tags.webp";
import duplicates from "../../../assets/guide/duplicates.png";
import duplicatesWebp from "../../../assets/guide/duplicates.webp";
import tagEdit from "../../../assets/guide/tag-edit.png";
import tagEditWebp from "../../../assets/guide/tag-edit.webp";
import dnd from "../../../assets/guide/dnd.png";
import dndWebp from "../../../assets/guide/dnd.webp";
import presets from "../../../assets/about/8-presets-1.jpg";
import presetsWebp from "../../../assets/about/8-presets-1.webp";
import presetAdd from "../../../assets/guide/preset-add.jpg";
import presetAddWebp from "../../../assets/guide/preset-add.webp";
import preset from "../../../assets/guide/preset.jpg";
import presetWebp from "../../../assets/guide/preset.webp";

/**
 * Content for the About page "Working with Prompts" section.
 *
 * @component
 * @returns {JSX.Element} The "Working with Prompts" section content.
 */
const AboutWorkingWithPrompts = () => {
  return (
    <AboutContentWrap>
      <H1 id="prompt">Working with Prompts</H1>
      <TextContentBlock>
        <Video
          width={1920}
          height={1080}
          playsInline
          loop
          disablePictureInPicture
          preload="none"
          muted
          controls
          poster={faqPromptPoster}
          className={classes.video}
        >
          <source src={faqPromptMp4} type="video/mp4" />
        </Video>
        <Text>
          Prompt input is available in two modes:{" "}
          <TextHighlight>tag mode</TextHighlight> and{" "}
          <TextHighlight>text mode</TextHighlight>.
        </Text>
        <ImageComparisonSlider
          loading="lazy"
          className={classes.comparison}
          imgWidth="1714"
          imgHeight="626"
          srcLeft={compSliderImgLeft}
          srcRight={compSliderImgRight}
        />
        <NotificationMessage>
          <ul className={classes.list}>
            <li className={classes["list__item"]}>
              <span className={classes["btn-type"]}>
                <div className={classes["btn-type__text"]}>Text</div>
                <div className={classes["btn-type__tags"]}>Tags</div>
              </span>{" "}
              — <TextHighlight>Switch between text and tag modes</TextHighlight>
              . Switch to Text Mode to edit the prompt manually. Switching to
              Tag Mode will automatically{" "}
              <TextHighlight>split the prompt into tags</TextHighlight>, which
              you can <TextHighlight>edit</TextHighlight>,{" "}
              <TextHighlight>drag</TextHighlight>, or{" "}
              <TextHighlight>remove</TextHighlight> with a single click.
            </li>
            <li className={classes["list__item"]}>
              <TextButtonTertiary>Presets</TextButtonTertiary> — Allows you to
              create presets of your most frequently used trigger words for both
              the positive and negative prompts.
            </li>
            <li className={classes["list__item"]}>
              <TextButtonTertiary>+ BREAK</TextButtonTertiary> — Lets you insert
              a BREAK into the prompt with one click for better prompt
              structuring.
            </li>
            <li className={classes["list__item"]}>
              <TextButtonTertiary>
                <TrashIcon /> all
              </TextButtonTertiary>{" "}
              <TextButtonTertiary>
                <TrashIcon /> positive
              </TextButtonTertiary>{" "}
              <TextButtonTertiary>
                <TrashIcon /> negative
              </TextButtonTertiary>{" "}
              — You can clear the prompt fields — either the positive, the
              negative, or both at once.
            </li>
            <li className={classes["list__item"]}>
              <span className={classes["resize"]}></span> — Allows you to resize
              the prompt window for more comfortable editing.
            </li>
            <li className={classes["list__item"]}>
              <DocumentDuplicateIcon
                className={`${classes.svg} ${classes.copy}`}
              />{" "}
              — Copy and use the built prompt in the Civitai online generator or
              your local web UI.
            </li>
            <li className={classes["list__item"]}>
              <span className={classes["btn-hide"]}>
                <ChevronUpIcon className={classes.svg} /> Hide prompt
              </span>{" "}
              — Hide the prompt to get more workspace for working with models or
              images.
            </li>
          </ul>
        </NotificationMessage>
        <Text>
          Trigger words of each model, as well as generation prompt of all
          images, are displayed as tags. The tag system allows you to add and
          remove trigger words from the prompt with one click, easily match your
          prompt with the prompt of a generated reference image by seeing which
          trigger words are already used and which need to be added. Tags that
          are already added will be highlighted.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={prompt}
            alt="Prompt"
            srcSet={promptWebp}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          Trigger words received with the model can be divided into groups:
          trigger words, helper words, negative words, and{" "}
          <Link
            className={classes.link}
            to={{
              pathname: `/about/model-page`,
              hash: "sets",
            }}
          >
            tag sets
          </Link>{" "}
          (custom presets for outfits, appearances, etc.).
        </Text>
        <Text>
          The <TextButtonAll>Add All</TextButtonAll> button next to the trigger
          word group will add all tags to the current prompt, avoiding
          duplicates. The <TextButtonAll>Remove All</TextButtonAll> button will
          only remove the set of tags specified in the corresponding group,
          leaving the rest of the prompt unchanged.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={tags}
            alt="Tags"
            srcSet={tagsWebp}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          This way, you can easily manage the prompt by adding the necessary
          details.
        </Text>
        <Text>
          Text mode allows you to enter the prompt manually. When switching from
          text mode to tag mode, the entered text is also converted into tags.
        </Text>
        <AboutSection id="dup">
          <H3>Duplicates</H3>
          <div>
            <p>
              {" "}
              <TextHighlight>Duplicate tags are marked</TextHighlight> with
              different highlight colors{" "}
              <TextHighlight>to help you spot and manage </TextHighlight>them.
            </p>
            <TextImageBlock>
              <Image
                fullView={true}
                loading="lazy"
                width={1670}
                height={330}
                className={classes["img"]}
                src={duplicates}
                alt="Duplicates"
                srcSet={duplicatesWebp}
                type="image/webp"
              />
            </TextImageBlock>
          </div>
        </AboutSection>
        <AboutSection id="qedit">
          <H3>Quick edit</H3>
          <div>
            <Text>
              Click on any tag to{" "}
              <TextHighlight>
                {" "}
                edit its content or adjust its weight
              </TextHighlight>{" "}
              using the arrows next to it.
            </Text>
            <TextImageBlock>
              <Image
                fullView={true}
                loading="lazy"
                width={901}
                height={75}
                className={classes["img"]}
                src={tagEdit}
                alt="Tag edit"
                srcSet={tagEditWebp}
                type="image/webp"
              />
            </TextImageBlock>
          </div>
        </AboutSection>
        <AboutSection id="dnd">
          <H3>Drag & Drop</H3>
          <div>
            <Text>
              {" "}
              Use drag-and-drop to quickly{" "}
              <TextHighlight>
                {" "}
                rearrange and structure your prompt
              </TextHighlight>{" "}
              for better control and clarity.
            </Text>
            <TextImageBlock>
              <Image
                fullView={true}
                loading="lazy"
                width={851}
                height={134}
                className={classes["img"]}
                src={dnd}
                alt="Drag and drop"
                srcSet={dndWebp}
                type="image/webp"
              />
            </TextImageBlock>
          </div>
        </AboutSection>
        <AboutSection id="preset">
          <H3>Adding Presets</H3>
          <Text>
            You can add commonly used trigger words into presets (for example,
            quality tags or a standard set of negative words). To do this, use
            the <TextButtonTertiary>Presets</TextButtonTertiary> button next to
            the prompt field.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={presets}
              alt="Presets"
              srcSet={presetsWebp}
              type="image/webp"
            />
          </TextImageBlock>
          <div>
            <Text>
              Click the <TextButton>Add preset</TextButton> button and select
              the type: <TextHighlight>positive</TextHighlight> or{" "}
              <TextHighlight>negative</TextHighlight>. Then enter a name and add
              your trigger words. Click <TextButton>Save</TextButton>
            </Text>
            <TextImageBlock>
              <Image
                fullView={true}
                loading="lazy"
                width={1248}
                height={660}
                className={classes["img"]}
                src={presetAdd}
                alt="Add preset"
                srcSet={presetAddWebp}
                type="image/webp"
              />
            </TextImageBlock>
          </div>
          <Text>
            To add a preset to your prompt,{" "}
            <TextHighlight>click its name</TextHighlight> in the list — all
            missing trigger words will be automatically added to the prompt,
            without creating duplicates.
          </Text>
          <TextImageBlock>
            <Image
              fullView={true}
              loading="lazy"
              width={1380}
              height={423}
              className={classes["img"]}
              src={preset}
              alt="Preset 2"
              srcSet={presetWebp}
              type="image/webp"
            />
          </TextImageBlock>
          <Text>
            In the presets list, you can also edit a preset by clicking the{" "}
            <TextButtonTertiary>Change</TextButtonTertiary> button or delete it
            by clicking{" "}
            <TextButtonTertiary className={`${classes["btn-del"]}`}>
              Delete
            </TextButtonTertiary>
          </Text>
        </AboutSection>
      </TextContentBlock>
    </AboutContentWrap>
  );
};

export default AboutWorkingWithPrompts;
