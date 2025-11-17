import { useSelector } from "react-redux";
import classes from "./PreviewCardShort.module.scss";

const PreviewCardShort = ({ previewData, currVersion }) => {
  const categoriesData = useSelector((state) => state.images.categories);
  const imageCategoryData = categoriesData.find(
    (category) => category.id === previewData?.category
  );

  return (
    <div className={classes["content"]}>
      <ul className={classes["models"]}>
        {previewData?.baseModels?.map((model, i) => (
          <li key={i} className={classes["models__item"]}>
            {model}
          </li>
        )) || (
          <li className={classes["models__item"]}>
            {currVersion?.baseModel ||
              previewData?.baseModel ||
              imageCategoryData?.name}
          </li>
        )}
      </ul>
      <h4
        className={classes.title}
        title={previewData.name || previewData.title}
      >
        {previewData.name || previewData.title}
      </h4>
    </div>
  );
};

export default PreviewCardShort;
