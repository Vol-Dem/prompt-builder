import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type MouseEvent,
} from "react";

import classes from "./ModelVersionsList.module.scss";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import ModelVersionsItem from "../model-versions-item/ModelVersionsItem";
import type {
  ModelVersionCustomData,
  ModelVersionsCustomData,
} from "../../../../shared/types/model";

type ModelVersionsListProps = {
  onClick: (e: MouseEvent<HTMLElement>) => void;
  itemComponent: ElementType;
  versionsCustomData: ModelVersionsCustomData | ModelVersionCustomData[];
  curVersionId: number | null;
};

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
 * @param props
 * @param props.onClick - Optional click handler for version selection.
 * @param props.itemComponent - Component used to render version items
 *   (e.g. NavLink, span, button).
 * @param props.versionsCustomData - Versions metadata indexed by version ID.
 * @param props.curVersionId - Currently active version ID.
 *
 * @returns Model versions list.
 */
const ModelVersionsList = ({
  onClick,
  itemComponent,
  versionsCustomData,
  curVersionId,
}: ModelVersionsListProps) => {
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [listHeight, setListHeight] = useState<number | null>(null);
  const [itemHeight, setItemHeight] = useState<number | null>(null);
  const versionsListRef = useRef<HTMLUListElement>(null);
  const versionsItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (versionsListRef.current)
      setListHeight(versionsListRef.current.offsetHeight);
    if (versionsItemRef.current)
      setItemHeight(versionsItemRef.current.offsetHeight);

    setShowAllVersions(false);
  }, [versionsCustomData]);

  const modelVersionsHtml =
    versionsCustomData &&
    Object.values(versionsCustomData)
      ?.sort((a, b) => {
        if (a?.index !== undefined && b?.index !== undefined) {
          return a.index - b.index;
        }
        return 0;
      })
      .map((version, i) => {
        return (
          <ModelVersionsItem
            key={version.versionId}
            liRef={i === 0 ? versionsItemRef : undefined}
            to={`?versionId=${version.versionId}`}
            id={version.versionId + ""}
            data-version={i}
            onClick={onClick}
            active={curVersionId === version.versionId}
            saved={!!version?.downloadStatus}
            component={itemComponent}
          >
            {version.name}
          </ModelVersionsItem>
        );
      });

  const showAllVersionsHandler = () => {
    setShowAllVersions((prevState) => !prevState);
  };

  return (
    <div className={classes["versions-container"]}>
      <div
        className={classes.versions}
        style={
          listHeight && itemHeight
            ? {
                maxHeight: showAllVersions
                  ? `${listHeight + 2}px`
                  : `${itemHeight + 2}px`,
              }
            : undefined
        }
      >
        <ul ref={versionsListRef} className={classes["versions__list"]}>
          {modelVersionsHtml}
        </ul>
      </div>
      {listHeight && itemHeight && listHeight > itemHeight && (
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
