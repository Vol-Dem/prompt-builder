import NotificationMessage from "../../NotificationMessage";
import TextHighlight from "../../text/TextHighlight";
import classes from "./InfoQuickEdit.module.scss";

const InfoQuickEdit = () => {
  return (
    <div className={classes.info}>
      <p className={classes.text}>
        You can <TextHighlight>split the model trigger words</TextHighlight>{" "}
        into <TextHighlight>basic</TextHighlight> ,{" "}
        <TextHighlight>helper</TextHighlight> and{" "}
        <TextHighlight>negative</TextHighlight> groups for ease of use.
      </p>
      <NotificationMessage>
        <p className={classes.text}>
          Here you can also{" "}
          <TextHighlight>enter a custom activation tag</TextHighlight> if you
          want to change the default one.
        </p>
        <p className={classes.text}>
          By default the{" "}
          <TextHighlight>
            activation tag is generated automatically
          </TextHighlight>{" "}
          based on the file name.
        </p>
        <p className={classes.text}>
          It should work in most cases, but{" "}
          <TextHighlight>
            we advise you to replace it with an appropriate name
          </TextHighlight>{" "}
          from your local web-UI.
        </p>
      </NotificationMessage>
    </div>
  );
};

export default InfoQuickEdit;
