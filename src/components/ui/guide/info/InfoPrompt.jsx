import {
  ArrowUpIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ButtonTertiary from "../../ButtonTertiary";
import Video from "../../Video";
import classes from "./InfoPrompt.module.scss";
import TextHighlight from "../../text/TextHighlight";
import NotificationMessage from "../../NotificationMessage";
import ImageComparisonSlider from "../../../ImageComparisonSlider/ImageComparisonSlider";
import Image from "../../image/Image";
import TextButtonTertiary from "../../text/text-buttons/TextButtonTertiary";

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
        poster={require("../../../../assets/guide/3-faq-prompt.jpg")}
        mainSrc={{
          src: require("../../../../assets/guide/3-faq-prompt.mp4"),
          type: "video/mp4",
        }}
        className={classes.video}
      >
        <source
          src={require("../../../../assets/guide/3-faq-prompt.mp4")}
          type="video/mp4"
        />
      </Video>
      <p className={classes.text}>
        <span className={classes["btn-type"]}>
          <div className={classes["btn-type__text"]}>Text</div>
          <div className={classes["btn-type__tags"]}>Tags</div>
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
          <TextHighlight>switch to Tag Mode</TextHighlight> for easier editing.{" "}
        </p>
        <ImageComparisonSlider
          className={classes.comparison}
          srcLeft={require("../../../../assets/guide/prompt-text.jpg")}
          srcRight={require("../../../../assets/guide/prompt-tags.jpg")}
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
          src={require("../../../../assets/guide/tracking.jpg")}
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
          src={require("../../../../assets/guide/duplicates.png")}
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
          src={require("../../../../assets/guide/tag-edit.png")}
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
          src={require("../../../../assets/guide/dnd.png")}
        />
      </NotificationMessage>
    </div>
  );
};

export default InfoPrompt;
