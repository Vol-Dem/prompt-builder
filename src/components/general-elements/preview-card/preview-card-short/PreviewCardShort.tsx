import classes from "./PreviewCardShort.module.scss";
import type {
  CollectionPreviewDoc,
  ModelPreview,
  ModelPreviewDoc,
} from "../../../../../shared/types/firestore";
import { useAppSelector } from "../../../../store/hooks/hooks";

type PreviewCardShortProps = {
  previewData: ModelPreviewDoc | CollectionPreviewDoc | ModelPreview;
};

/**
 * Preview card short component.
 *
 * Renders a model or collection preview card for short layout.
 *
 * @component
 *
 * @param props
 * @param props.previewData - Data used to render the preview card.
 *
 * @returns Preview card content for short version.
 */
const PreviewCardShort = ({ previewData }: PreviewCardShortProps) => {
  const categoriesData = useAppSelector((state) => state.images.categories);
  const imageCategoryData = categoriesData.find(
    (category) =>
      "category" in previewData && category.id === previewData?.category,
  );

  return (
    <div className={classes["content"]}>
      <ul className={classes["models"]}>
        {"baseModels" in previewData ? (
          previewData?.baseModels?.map((model, i) => (
            <li key={i} className={classes["models__item"]}>
              {model}
            </li>
          ))
        ) : (
          <li className={classes["models__item"]}>
            {"baseModel" in previewData
              ? previewData?.baseModel
              : imageCategoryData?.name}
          </li>
        )}
      </ul>
      <h4
        className={classes.title}
        title={
          previewData.name ||
          ("title" in previewData && previewData.title) ||
          ""
        }
      >
        {previewData.name ||
          ("title" in previewData && previewData.title) ||
          ""}
      </h4>
    </div>
  );
};

export default PreviewCardShort;
