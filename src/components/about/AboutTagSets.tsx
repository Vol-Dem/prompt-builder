import Image from "../ui/image/Image";
import LinkA from "../ui/LinkA";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutTagSets.module.scss";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextButtonTertiary from "../ui/text/text-buttons/TextButtonTertiary";
import TextButtonAll from "../ui/text/text-buttons/TextButtonAll";
import H3 from "../ui/text/H3";
import Video from "../ui/Video";
import TextImageMenu from "../ui/text/text-buttons/TextImageMenu";
import NotificationMessage from "../ui/NotificationMessage";
import TextButtonSecondary from "../ui/text/text-buttons/TextButtonSecondary";
import AboutSection from "./layout/AboutSection";
import faqTagsetsPoster from "../../assets/guide/1-faq-tagsets-4k.jpg";
import faqTagsetsMp4 from "../../assets/guide/1-faq-tagsets.mp4";
import tagSets12 from "../../assets/about/12-tag-sets-12.jpg";
import tagSets12Webp from "../../assets/about/12-tag-sets-12.webp";
import tagSets22 from "../../assets/about/12-tag-sets-22.jpg";
import tagSets22Webp from "../../assets/about/12-tag-sets-22.webp";
import tagSets3 from "../../assets/about/12-tag-sets-3.jpg";
import tagSets3Webp from "../../assets/about/12-tag-sets-3.webp";
import tagSets4 from "../../assets/about/12-tag-sets-4.jpg";
import tagSets4Webp from "../../assets/about/12-tag-sets-4.webp";

/**
 * Content for the About page "Tag Sets" section.
 *
 * @component
 * @return The "Tag Sets" section content.
 */
const AboutTagSets = () => {
  return (
    <>
      <AboutSection id="sets">
        <H3>Tag Sets</H3>
        <Text>
          The tag sets feature allows you to create a set of trigger words for
          generating specific <TextHighlight>outfits</TextHighlight>,{" "}
          <TextHighlight>appearances</TextHighlight>, or other{" "}
          <TextHighlight>concepts</TextHighlight>.
        </Text>
        <Video
          width={1920}
          height={1080}
          playsInline
          loop
          disablePictureInPicture
          preload="none"
          muted
          controls
          poster={faqTagsetsPoster}
          className={classes.video}
        >
          <source src={faqTagsetsMp4} type="video/mp4" />
        </Video>

        <Text>
          Click the <TextButton>Add tag set</TextButton> button on the model
          page, then fill in the name and add trigger words. Save it.
        </Text>
        <Text>
          {" "}
          You can add multiple tag sets. To do this, click{" "}
          <TextButtonSecondary>+ add new set</TextButtonSecondary>
        </Text>
        <TextImageBlock col={2}>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={tagSets12}
            alt="Tag sets"
            srcSet={tagSets12Webp}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={tagSets22}
            alt="Tag sets 2"
            srcSet={tagSets22Webp}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          When building a prompt, you can add all tags from a set with one click
          using the <TextButtonAll>Add All</TextButtonAll> button, or add
          individual tags from the set. Words already present in the prompt will
          be highlighted. Pressing the
          <TextButtonAll>Remove All</TextButtonAll> button will only remove tags
          from that set in the prompt; the rest of the prompt will remain
          unchanged.
        </Text>
      </AboutSection>
      <AboutSection id="sets-prev">
        <H3>Tag Set Preview</H3>
        <Text>
          To easily understand what the tag set represents, you can add a
          preview image for it. To do this, you can use any image available in
          the list of generated images on the model's page.
        </Text>
        <Text>
          Click <TextImageMenu /> in the upper right corner of the image to open
          a menu and select{" "}
          <TextHighlight>"Set as tag set preview"</TextHighlight> . Then click{" "}
          <TextButtonTertiary>Set as preview</TextButtonTertiary> button for the
          desired tag set.
        </Text>
        <TextImageBlock col={2}>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={tagSets3}
            alt="Tag sets 3"
            srcSet={tagSets3Webp}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={tagSets4}
            alt="Tag sets 4"
            srcSet={tagSets4Webp}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          If you are using NSFW mode, you can also set a separate preview for
          NSFW. If the preview for NSFW is not set, the SFW version of the
          preview will be displayed in both modes by default.
        </Text>
        <NotificationMessage
          type="notification"
          className={classes.notification}
        >
          <p>
            Directly uploading your own image for a preview is not possible on
            the site, but you can upload it to Civitai as part of a
            corresponding model as a generation example (then it will appear in
            the list of generated images) or upload it as a standalone post and{" "}
            <LinkA href="#addbyid" smoothScroll>
              add it to saved
            </LinkA>{" "}
            images using the <TextButton>Add Image by ID</TextButton> button.
          </p>
        </NotificationMessage>
      </AboutSection>
    </>
  );
};

export default AboutTagSets;
