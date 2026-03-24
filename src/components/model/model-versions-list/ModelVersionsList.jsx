import { useEffect, useRef, useState } from "react";

import classes from "./ModelVersionsList.module.scss";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import ModelVersionsItem from "../model-versions-item/ModelVersionsItem";

/**
 * Model versions list.
 *
 * Renders a collapsible, ordered list of model versions with active and saved states.
 * The list itself is presentation-only and delegates navigation behavior to the
 * provided item component.
 *
 * The same list can be used in two scenarios:
 * - As a navigation control (e.g. using React Router NavLink)
 * - As an in-place version switcher without route changes
 *
 * Responsibilities:
 * - Renders model versions sorted by version index.
 * - Highlights the active version.
 * - Indicates whether a version is saved/downloaded.
 * - Collapses the list to a single row with an optional "Show all" toggle.
 * - Delegates click and navigation behavior to version items.
 *
 * @component
 *
 * @param {object} props
 * @param {(e: React.MouseEvent<HTMLElement>) => void} [props.onClick] - Optional click handler for version selection.
 * @param {React.ElementType} [props.itemComponent] - Component used to render version items
 *   (e.g. NavLink, span, button).
 * @param {object} props.versionsCustomData - Versions metadata indexed by version ID.
 * @param {number} props.curVersionId - Currently active version ID.
 *
 * @returns {JSX.Element} Model versions list.
 */
const ModelVersionsList = ({
  onClick,
  itemComponent,
  versionsCustomData,
  curVersionId,
}) => {
  const [showAllVersions, setSHowAllVersions] = useState(false);
  const [listHeight, setListHeight] = useState(null);
  const versionsListRef = useRef(null);
  const versionsItemRef = useRef(null);

  useEffect(() => {
    setListHeight(versionsListRef?.current?.offsetHeight);
  }, [versionsListRef?.current?.offsetHeight]);

  const modelVersionsHtml =
    versionsCustomData &&
    Object.values(versionsCustomData)
      ?.sort((a, b) => a?.index - b?.index)
      .map((version, i) => {
        return (
          <ModelVersionsItem
            key={i}
            ref={versionsItemRef}
            to={`?versionId=${version.versionId}`}
            id={version.versionId}
            data-version={i}
            onClick={onClick}
            active={curVersionId === version.versionId}
            saved={version?.downloadStatus}
            component={itemComponent}
          >
            {version.name}
          </ModelVersionsItem>
        );
      });

  const showAllVersionsHandler = () => {
    setSHowAllVersions((prevState) => !prevState);
  };

  return (
    <div className={classes["versions-container"]}>
      <div
        className={classes.versions}
        style={{
          maxHeight: showAllVersions
            ? `${listHeight + 2}px`
            : `${versionsItemRef?.current?.offsetHeight + 2}px`,
        }}
      >
        <ul ref={versionsListRef} className={classes["versions__list"]}>
          {modelVersionsHtml}
        </ul>
      </div>
      {listHeight > versionsItemRef?.current?.offsetHeight && (
        <ButtonTertiary
          onClick={showAllVersionsHandler}
          className={classes["btn-all"]}
        >
          {showAllVersions ? "Hide" : "Show All"}
        </ButtonTertiary>
      )}
    </div>
  );
};

export default ModelVersionsList;
