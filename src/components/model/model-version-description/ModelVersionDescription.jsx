import { useSelector } from "react-redux";

import classes from "./ModelVersionDescription.module.scss";

/**
 * Content for the model version description section.
 *
 * @component
 * @returns {JSX.Element} The "Version description" section content.
 */
const ModelVersionDescription = () => {
  const curVersion = useSelector((state) => state.model.curVersion);

  return (
    <>
      {curVersion?.description && (
        <>
          <h2 className={classes["h2"]}>Version description:</h2>
          <div className={classes.description}>
            {curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}
          </div>
        </>
      )}
    </>
  );
};

export default ModelVersionDescription;
