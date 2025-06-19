import { DocumentArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "../ui/image/Image";
import LinkA from "../ui/LinkA";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutWorkingWithPrompts.module.scss";
import H2 from "../ui/text/H2";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextContentBlock from "../ui/text/TextContentBlock";
import TextButtonCreate from "../ui/text/text-buttons/TextButtonCreate";
import TextButtonTertiary from "../ui/text/text-buttons/TextButtonTertiary";
import ImageComparisonSlider from "../ImageComparisonSlider/ImageComparisonSlider";
import TextButtonAll from "../ui/text/text-buttons/TextButtonAll";
import H3 from "../ui/text/H3";

const AboutWorkingWithPrompts = () => {
  return (
    <>
      <H2 id="prompt">Working with Prompts</H2>
      <TextContentBlock>
        <Text>
          Prompt input is available in two modes:{" "}
          <TextHighlight>tag mode</TextHighlight> and{" "}
          <TextHighlight>text mode</TextHighlight>.
        </Text>
        <ImageComparisonSlider
          loading="lazy"
          className={classes.comparison}
          srcLeft={require("../../assets/guide/prompt-text.jpg")}
          srcRight={require("../../assets/guide/prompt-tags.jpg")}
        />
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
            src={require("../../assets/about/6-prompt.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/6-prompt.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          Trigger words received with the model can be divided into groups:
          trigger words, helper words, negative words, and{" "}
          <LinkA className={classes.link} href="#sets" smoothScroll>
            tag sets
          </LinkA>{" "}
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
            src={require("../../assets/about/7-tags.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/7-tags.webp")}
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
        <Text>
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
        </Text>
        <H3 id="preset">Adding Presets</H3>
        <Text>
          You can add commonly used trigger words into presets (for example,
          quality tags or a standard set of negative words). To do this, use the{" "}
          <TextButtonTertiary>Presets</TextButtonTertiary> button next to the
          prompt field. You can create presets for both positive and negative
          words. Created presets can be edited or deleted as needed. To add a
          preset to the prompt, click on its name in the list
        </Text>
        <TextImageBlock col={3}>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/8-presets-1.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/8-presets-1.webp")}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/8-presets-2.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/8-presets-2.webp")}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/8-presets-3.jpg")}
            alt="about-image"
            srcSet={require("../../assets/about/8-presets-3.webp")}
            type="image/webp"
          />
        </TextImageBlock>
      </TextContentBlock>
    </>
  );
};

export default AboutWorkingWithPrompts;
