import classes from "./InfoTagsets.module.scss";
import NotificationMessage from "./../../NotificationMessage";
import Image from "../../image/Image";
import Video from "../../Video";
import TextHighlight from "../../text/TextHighlight";
import TextButton from "../../text/text-buttons/TextButton";
import TextImageMenu from "../../text/text-buttons/TextImageMenu";
import TextButtonTertiary from "../../text/text-buttons/TextButtonTertiary";

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
        poster={require("../../../../assets/guide/1-faq-tagsets-4k.jpg")}
        mainSrc={{
          src: require("../../../../assets/guide/1-faq-tagsets.mp4"),
          type: "video/mp4",
        }}
        className={classes.video}
      >
        <source
          src={require("../../../../assets/guide/1-faq-tagsets.mp4")}
          type="video/mp4"
        />
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
          src={require("../../../../assets/guide/tsprev.jpg")}
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
