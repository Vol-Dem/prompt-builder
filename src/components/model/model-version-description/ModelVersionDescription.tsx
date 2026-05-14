import classes from "./ModelVersionDescription.module.scss";
import { useAppSelector } from "../../../store/hooks/hooks";

/**
 * Content for the model version description section.
 *
 * @component
 * @returns The "Version description" section content.
 */
const ModelVersionDescription = () => {
  const curVersion = useAppSelector((state) => state.model.curVersion);

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
