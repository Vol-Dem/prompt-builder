import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  FolderArrowDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ButtonSquare from "../../ButtonSquare";
import classes from "./InfoResources.module.scss";
import TextHighlight from "../../text/TextHighlight";
import TextButtonSquare from "../../text/text-buttons/TextButtonSquare";
import NotificationMessage from "../../NotificationMessage";
import TextButton from "../../text/text-buttons/TextButton";

const InfoResources = () => {
  return (
    <div className={classes.info}>
      <p>
        <TextButtonSquare>
          <FolderArrowDownIcon />
        </TextButtonSquare>{" "}
        – Click to save the current resource to your collection. If the resource
        is already downloaded, the button will be replaced with a{" "}
        <TextButtonSquare>
          <PlusIcon />
        </TextButtonSquare>
        , which you can use to add the resource to the sidebar.
      </p>
      <p>
        <TextButtonSquare>
          <PlusIcon />
        </TextButtonSquare>{" "}
        – Click to add the model to the sidebar for quick access. Clicking again
        will remove the model from the sidebar.
      </p>
      <NotificationMessage>
        <p>
          If the model is already in your collection, its name will appear as a{" "}
          <span className={classes.link}>blue link</span> — click it to navigate
          to the model’s page.
        </p>
      </NotificationMessage>
      <h3 className={classes.h3}>Version tracking</h3>
      <NotificationMessage>
        <p>
          If the resource is downloaded, you’ll see two indicators to help track
          its versions.
        </p>
        <p>
          You can mark versions as downloaded or not downloaded in the model
          settings by clicking the <TextButton>Edit</TextButton> button on the
          model page.
        </p>
        <p>
          <CheckCircleIcon
            className={`${classes["status"]} ${classes["status--saved"]}`}
          />{" "}
          - Indicates that the version used as a resource is{" "}
          <TextHighlight>marked</TextHighlight> as downloaded.
        </p>
        <p>
          <ExclamationCircleIcon className={classes["status"]} /> - Indicates
          that the version used as a resource is{" "}
          <TextHighlight>not marked</TextHighlight> as downloaded.
        </p>
      </NotificationMessage>
    </div>
  );
};

export default InfoResources;
