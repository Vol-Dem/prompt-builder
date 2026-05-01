import { useMemo } from "react";
import { Link } from "react-router-dom";

import classes from "./PreviewCardExpanded.module.scss";
import ResourceTypeLabel from "../../../ui/text/ResourceTypeLabel";
import ActivationTag from "../../activation-tag/ActivationTag";
import type {
  CollectionPreviewDoc,
  ModelPreviewDoc,
} from "../../../../../shared/types/firestore";
import type { ModelVersionCustomData } from "../../../../../shared/types/model";
import { createSidebarPreviewData } from "../../../../utils/modelUtils";

type PreviewCardExpandedProps = {
  previewData: ModelPreviewDoc | CollectionPreviewDoc;
  currVersion: ModelVersionCustomData | null;
  onClick?: () => void;
};

/**
 * Preview card expanded component.
 *
 * Renders a model or collection preview card for expanded layout.
 *
 * @component
 *
 * @param props
 * @param props.previewData - Data used to render the preview card.
 *
 * @returns {JSX.Element} Preview card content for expanded version.
 */
const PreviewCardExpanded = ({
  previewData,
  currVersion,
  onClick,
}: PreviewCardExpandedProps) => {
  const currSidePanelData = useMemo(() => {
    return createSidebarPreviewData(null, previewData, currVersion);
    // return {
    //   id: previewData?.id,
    //   src: previewData?.src || null,
    //   main: previewData?.main || null,
    //   sub: previewData?.sub || null,
    //   title: previewData.name || previewData.title || null,
    //   versionName: currVersion?.name || null,
    //   imgUrl: previewData?.imgUrl || null,
    //   nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl || null,
    //   type: previewData?.modelType || previewData?.type || null,
    //   baseModel: currVersion?.baseModel || previewData?.baseModel || null,
    //   mainTag: currVersion?.mainTag || previewData?.mainTag || null,
    //   weight: currVersion?.weight || previewData?.weight || null,
    //   minWeight: currVersion?.minWeight || previewData?.minWeight || null,
    //   maxWeight: currVersion?.maxWeight || previewData?.maxWeight || null,
    //   size: currVersion?.size || previewData?.size || null,
    //   tags: currVersion?.trainedWords || currVersion?.trainedWords || null,
    //   helperTags: currVersion?.helperTags || previewData?.helperTags || null,
    //   updatedAt: previewData?.updatedAt || null,
    // };
  }, [currVersion, previewData]);

  return (
    <div className={`${classes.content}`}>
      <div className={classes["title-container"]}>
        <Link
          to={
            previewData?.type === "collection"
              ? `/images/${previewData.id}`
              : `/models/${previewData.id}`
          }
          className={classes.link}
          onClick={onClick}
        >
          <h4 className={classes.title} title={currSidePanelData.title}>
            {currSidePanelData.title}
          </h4>
        </Link>
      </div>
      <ResourceTypeLabel>
        {previewData.type === "TextualInversion"
          ? "Embedding"
          : previewData.type}
      </ResourceTypeLabel>
      <div className={classes.info}>
        Model:{" "}
        {"baseModels" in previewData && (
          <ul className={classes["models"]}>
            {previewData?.baseModels?.map((model, i) => (
              <li key={i} className={classes["models__item"]}>
                {model}
              </li>
            )) ||
              currVersion?.baseModel ||
              previewData?.baseModel}
          </ul>
        )}
      </div>
      {currVersion?.versionName && (
        <div className={classes["text"]}>
          Version:{" "}
          <span className={classes["text-secondary"]}>{currVersion.name}</span>
        </div>
      )}
      {(currVersion?.fileName || currVersion?.defFileName) && (
        <div className={classes["text"]}>
          File name:{" "}
          <span className={classes["text-secondary"]}>
            {currVersion?.fileName || currVersion?.defFileName}
          </span>
        </div>
      )}
      {(currVersion?.mainTag ||
        ("mainTag" in previewData && previewData?.mainTag) ||
        currVersion?.defActTag) && (
        <ul className={classes["main-tag"]}>
          <ActivationTag
            tag={
              currVersion?.mainTag ||
              ("mainTag" in previewData && previewData?.mainTag) ||
              currVersion?.defActTag ||
              ""
            }
            modelData={currSidePanelData}
          />
        </ul>
      )}
    </div>
  );
};

export default PreviewCardExpanded;
