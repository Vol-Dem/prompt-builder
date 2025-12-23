import { useEffect, useRef, useState } from "react";

import classes from "./ModelVersionsList.module.scss";
import ButtonTertiary from "../../ui/ButtonTertiary";
import ModelVersionsItem from "../model-versions-item/ModelVersionsItem";

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
