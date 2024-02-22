import React from "react";
import classes from "./ModelInfo.module.scss";
import { useSelector } from "react-redux";

const ModelInfo = ({ customData }) => {
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const viersionVAE = curVersion?.files?.find(
    (file) => file.type === "VAE"
  )?.name;
  return (
    <div className={classes?.info}>
      <div>{model?.data?.type}</div>
      <div>Base model: {curVersion?.baseModel}</div>
      <div>Size: {customData?.size || model?.size}</div>
      <div>Weight: {customData?.weight || model?.weight}</div>
      <div>
        Version:{" "}
        <a target="blank" href={`https://${model?.src}/models/${model?.id}`}>
          {curVersion?.name}
        </a>
      </div>
      {customData?.fileName && (
        <div>File: {customData?.fileName || model?.fileName}</div>
      )}
      {viersionVAE && <div>VAE: {viersionVAE}</div>}
      {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
    </div>
  );
};

export default ModelInfo;
