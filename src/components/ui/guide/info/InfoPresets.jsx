import Image from "../../image/Image";
import NotificationMessage from "../../NotificationMessage";
import TextButton from "../../text/text-buttons/TextButton";
import TextButtonTertiary from "../../text/text-buttons/TextButtonTertiary";
import TextHighlight from "../../text/TextHighlight";
import classes from "./InfoPresets.module.scss";
import presetAdd from "../../../../assets/guide/preset-add.jpg";
import preset from "../../../../assets/guide/preset.jpg";

const InfoPresets = () => {
  return (
    <div className={classes.info}>
      <p className={classes.text}>
        You can create presets of frequently used trigger words.{" "}
      </p>
      <NotificationMessage>
        <p>
          Click the <TextButton>Add preset</TextButton> button and select the
          type: <TextHighlight>positive</TextHighlight> or{" "}
          <TextHighlight>negative</TextHighlight>. Then enter a name and add
          your trigger words. Click <TextButton>Save</TextButton>
        </p>
        <Image
          width={1248}
          height={660}
          className={`${classes["image"]}`}
          src={presetAdd}
          alt="Add preset"
        />
      </NotificationMessage>
      <h3 className={classes.h3}>Use preset</h3>
      <NotificationMessage>
        To add a preset to your prompt,{" "}
        <TextHighlight>click its name</TextHighlight> in the list — all missing
        trigger words will be automatically added to the prompt, without
        creating duplicates.
        <Image
          width={1380}
          height={423}
          className={`${classes["image"]}`}
          src={preset}
          alt="Preset"
        />
      </NotificationMessage>
      <h3 className={classes.h3}>Managing presets</h3>
      <NotificationMessage>
        In the presets list, you can also edit a preset by clicking the{" "}
        <TextButtonTertiary>Change</TextButtonTertiary> button or delete it by
        clicking{" "}
        <TextButtonTertiary className={`${classes["btn-del"]}`}>
          Delete
        </TextButtonTertiary>
      </NotificationMessage>
    </div>
  );
};

export default InfoPresets;
