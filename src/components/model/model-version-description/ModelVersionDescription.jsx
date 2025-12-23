import { useSelector } from "react-redux";

import classes from "./ModelVersionDescription.module.scss";

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
