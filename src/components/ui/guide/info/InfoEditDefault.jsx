import Image from "../../image/Image";
import NotificationMessage from "../../NotificationMessage";
import TextHighlight from "../../text/TextHighlight";
import classes from "./InfoEditDefault.module.scss";

const InfoEditDefault = () => {
  return (
    <div className={classes.info}>
      <h3 className={classes.h3}>Default</h3>
      <NotificationMessage>
        <p>
          Here you can set the <TextHighlight>default settings</TextHighlight>{" "}
          for the model, which will be applied to all versions{" "}
          <TextHighlight>unless they have their own specific</TextHighlight>{" "}
          settings. Tag sets created here will also be displayed for all
          versions by default.
        </p>
      </NotificationMessage>
      <h3 className={classes.h3}>Version specific</h3>
      <NotificationMessage>
        <p>
          To add settings for a <TextHighlight>specific version</TextHighlight>,
          check the box next to that version in General setting or in Version
          settings tab. It will then appear in the sidebar, allowing you to
          access its settings.
        </p>
        <Image
          width={959}
          height={310}
          className={`${classes["image"]}`}
          src={require("../../../../assets/guide/versions.jpg")}
          alt=""
        />
      </NotificationMessage>
    </div>
  );
};

export default InfoEditDefault;
