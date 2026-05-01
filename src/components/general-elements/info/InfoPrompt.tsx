import {
  ChevronUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import Video from "../../ui/Video";
import classes from "./InfoPrompt.module.scss";
import TextHighlight from "../../ui/text/TextHighlight";
import NotificationMessage from "../../ui/NotificationMessage";
import ImageComparisonSlider from "../../ui/image-comparison-slider/ImageComparisonSlider";
import Image from "../../ui/image/Image";
import TextButtonTertiary from "../../ui/text/text-buttons/TextButtonTertiary";
import faqPromptPoster from "../../../assets/guide/3-faq-prompt.jpg";
import faqPromptMp4 from "../../../assets/guide/3-faq-prompt.mp4";
import compSliderImgLeft from "../../../assets/guide/prompt-text.jpg";
import compSliderImgRight from "../../../assets/guide/prompt-tags.jpg";
import tracking from "../../../assets/guide/tracking.jpg";
import duplicates from "../../../assets/guide/duplicates.png";
import tagEdit from "../../../assets/guide/tag-edit.png";
import dnd from "../../../assets/guide/dnd.png";

/**
 * Content for the prompt hint.
 *
 * @component
 * @returns The prompt hint.
 */
const InfoPrompt = () => {
  return (
    <div className={classes.info}>
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
      <p className={classes.text}>
        <span className={classes["btn-type"]}>
          <span className={classes["btn-type__text"]}>Text</span>
          <span className={classes["btn-type__tags"]}>Tags</span>
        </span>{" "}
        — <TextHighlight>Switch between text and tag modes</TextHighlight>.
        Switch to Text Mode to edit the prompt manually. Switching to Tag Mode
        will automatically{" "}
        <TextHighlight>split the prompt into tags</TextHighlight>, which you can{" "}
        <TextHighlight>edit</TextHighlight>, <TextHighlight>drag</TextHighlight>
        , or <TextHighlight>remove</TextHighlight> with a single click.
      </p>
      <p className={classes.text}>
        <TextButtonTertiary>Presets</TextButtonTertiary> — Allows you to create
        a presets of your most frequently used trigger words for both the
        positive and negative prompts.
      </p>
      <p className={classes.text}>
        <TextButtonTertiary>+ BREAK</TextButtonTertiary> — Lets you insert a
        BREAK into the prompt with one click for better prompt structuring.
      </p>
      <p className={classes.text}>
        <TextButtonTertiary>
          <TrashIcon /> all
        </TextButtonTertiary>{" "}
        <TextButtonTertiary>
          <TrashIcon /> positive
        </TextButtonTertiary>{" "}
        <TextButtonTertiary>
          <TrashIcon /> negative
        </TextButtonTertiary>{" "}
        — You can clear the prompt fields — either the positive, the negative,
        or both at once.
      </p>
      <p className={classes.text}>
        <span className={classes["resize"]}></span> — Allows you to resize the
        prompt window for more comfortable editing.
      </p>
      <p className={classes.text}>
        <DocumentDuplicateIcon className={`${classes.svg} ${classes.copy}`} /> —{" "}
        Copy and use the built prompt in the Civitai online generator or your
        local web UI.
      </p>
      <p className={classes.text}>
        <span className={classes["btn-hide"]}>
          <ChevronUpIcon className={classes.svg} /> Hide prompt
        </span>{" "}
        — Hide the prompt to get more workspace for working with models or
        images.
      </p>
      <h2 className={classes.h2}>Tag system</h2>
      <p>
        The tag system allows you to{" "}
        <TextHighlight>add, edit and remove</TextHighlight> trigger words in the
        prompt <TextHighlight>in one click</TextHighlight>, easily compare your
        prompt with the prompt of the generated reference image,
        <TextHighlight>
          {" "}
          track which trigger words are already in the prompt
        </TextHighlight>{" "}
        and which need to be added.
      </p>
      <h3 className={classes.h3}>Add and track tags</h3>
      <NotificationMessage>
        <p>
          {" "}
          <TextHighlight>Paste your prompt</TextHighlight> in Text Mode and then{" "}
          <TextHighlight>switch to Tag Mode</TextHighlight> for easier
          editing.{" "}
        </p>
        <ImageComparisonSlider
          className={classes.comparison}
          srcLeft={compSliderImgLeft}
          srcRight={compSliderImgRight}
        />
      </NotificationMessage>
      <NotificationMessage>
        <p>
          Click on a tag in the prompt section of a generated image to{" "}
          <TextHighlight> instantly add that trigger word</TextHighlight> to
          your prompt. <TextHighlight>Tags already included</TextHighlight> in
          your prompt are <TextHighlight> highlighted</TextHighlight>, so you
          can <TextHighlight>easily keep track</TextHighlight> of what’s been
          added
        </p>
        <Image
          width={1565}
          height={574}
          className={classes["image"]}
          src={tracking}
          alt="Tracking"
        />
      </NotificationMessage>
      <h3 className={classes.h3}>Duplicates</h3>
      <NotificationMessage>
        <p>
          {" "}
          <TextHighlight>Duplicate tags are marked</TextHighlight> with
          different highlight colors{" "}
          <TextHighlight>to help you spot and manage </TextHighlight>them.
        </p>
        <Image
          width={1670}
          height={330}
          className={classes["image"]}
          src={duplicates}
          alt="Duplicates"
        />
      </NotificationMessage>
      <h3 className={classes.h3}>Quick edit</h3>
      <NotificationMessage>
        <p>
          Click on any tag to{" "}
          <TextHighlight> edit its content or adjust its weight</TextHighlight>{" "}
          using the arrows next to it.
        </p>
        <Image
          width={901}
          height={75}
          className={classes["image"]}
          src={tagEdit}
          alt="Tag edit"
        />
      </NotificationMessage>
      <h3 className={classes.h3}>Drag & Drop</h3>
      <NotificationMessage>
        <p>
          {" "}
          Use drag-and-drop to quickly{" "}
          <TextHighlight>
            {" "}
            rearrange and structure your prompt
          </TextHighlight>{" "}
          for better control and clarity.
        </p>
        <Image
          width={851}
          height={134}
          className={classes["image"]}
          src={dnd}
          alt=">Drag and drop"
        />
      </NotificationMessage>
    </div>
  );
};

export default InfoPrompt;
