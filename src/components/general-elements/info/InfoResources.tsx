import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  FolderArrowDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import classes from "./InfoResources.module.scss";
import TextHighlight from "../../ui/text/TextHighlight";
import TextButtonSquare from "../../ui/text/text-buttons/TextButtonSquare";
import NotificationMessage from "../../ui/NotificationMessage";
import TextButton from "../../ui/text/text-buttons/TextButton";

/**
 * Content for the resources hint.
 *
 * @component
 * @returns The resources hint.
 */
const InfoResources = () => {
  return (
    <div className={classes.info}>
      <p>
        <TextButtonSquare>
          <FolderArrowDownIcon />
        </TextButtonSquare>{" "}
        – Click to <TextHighlight>save the current resource</TextHighlight> to
        your collection. If the resource is already downloaded, the button will
        be replaced with a{" "}
        <TextButtonSquare>
          <PlusIcon />
        </TextButtonSquare>
        , which you can use to{" "}
        <TextHighlight>add the resource to the sidebar</TextHighlight>.
      </p>
      <p>
        <TextButtonSquare>
          <PlusIcon />
        </TextButtonSquare>{" "}
        – Click to <TextHighlight>add the model to the sidebar</TextHighlight>{" "}
        for quick access. Clicking again will remove the model from the sidebar.
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
          You can <TextHighlight>mark model versions</TextHighlight> as
          downloaded or not downloaded{" "}
          <TextHighlight>in the model settings</TextHighlight> by clicking the{" "}
          <TextButton>Edit</TextButton> button on the model page.
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
