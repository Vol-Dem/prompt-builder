import React from "react";
import classes from "./ModelInfo.module.scss";

const ModelInfo = ({ infoData }) => {
  return (
    <div className={classes.info}>
      <div>{infoData?.data.type}</div>
      <div>Base infoData: {infoData?.data.modelVersions[0].baseModel}</div>
      <div>Size: {infoData?.size}</div>
      <div>Weight: {infoData?.weight}</div>
      <div>Version: {infoData?.data.modelVersions[0].name}</div>
      {infoData?.clipSkip && <div>Clip Skip: {infoData?.clipSkip}</div>}
    </div>
  );
};

export default ModelInfo;
