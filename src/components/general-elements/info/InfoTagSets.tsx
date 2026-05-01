import classes from "./InfoTagsets.module.scss";
import NotificationMessage from "../../ui/NotificationMessage";
import Image from "../../ui/image/Image";
import Video from "../../ui/Video";
import TextHighlight from "../../ui/text/TextHighlight";
import TextButton from "../../ui/text/text-buttons/TextButton";
import TextImageMenu from "../../ui/text/text-buttons/TextImageMenu";
import TextButtonTertiary from "../../ui/text/text-buttons/TextButtonTertiary";
import faqTagsetsPoster from "../../../assets/guide/1-faq-tagsets-4k.jpg";
import faqTagsetsMp4 from "../../../assets/guide/1-faq-tagsets.mp4";
import tsprev from "../../../assets/guide/tsprev.jpg";

/**
 * Content for the tag sets hint.
 *
 * @component
 * @returns {JSX.Element} The tag sets hint.
 */
const InfoTagsets = () => {
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
        poster={faqTagsetsPoster}
        className={classes.video}
      >
        <source src={faqTagsetsMp4} type="video/mp4" />
      </Video>
      <p className={classes.text}>
        The tag sets feature allows you to create a set of trigger words for
        generating specific <TextHighlight>outfits</TextHighlight>,{" "}
        <TextHighlight>appearances</TextHighlight>, or other{" "}
        <TextHighlight>concepts</TextHighlight>.
      </p>
      <NotificationMessage>
        Click the <TextButton>Add tag set</TextButton> button on the model page,
        then fill in the name and add trigger words. Save it.
      </NotificationMessage>
      <NotificationMessage>
        You can add multiple tag sets. To do this, click{" "}
        <span className={classes["btn-secondary"]}>+ add new set</span>
      </NotificationMessage>
      <h3 className={classes.h3}>Tag sets preview:</h3>
      <p className={classes.text}>
        You can set any of the model’s generated images as a preview for the
        tagset to easily tell them apart.
      </p>
      <NotificationMessage>
        {" "}
        <p className={classes.text}>
          {" "}
          Click <TextImageMenu /> in the upper right corner of the image to open
          a menu and select{" "}
          <TextHighlight>"Set as tag set preview"</TextHighlight> . Then click{" "}
          <TextButtonTertiary>Set as preview</TextButtonTertiary> button for the
          desired tag set.
        </p>
        <Image
          width={1250}
          height={463}
          className={classes["image"]}
          src={tsprev}
          alt="Tag sets preview"
        />
        <p className={classes.text}>
          If you are using NSFW mode, you can also set a separate preview for
          NSFW. If the preview for NSFW is not set, the SFW version of the
          preview will be displayed in both modes by default.
        </p>
      </NotificationMessage>
    </div>
  );
};

export default InfoTagsets;
