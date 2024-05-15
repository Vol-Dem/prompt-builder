import React from "react";
import classes from "./ModelInfo.module.scss";
import { useSelector } from "react-redux";

const ModelInfo = ({ customData }) => {
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const viersionVAE = curVersion?.files?.find(
    (file) => file.type === "VAE"
  )?.name;
  const size = customData?.size || model?.size;
  const weightRange = `${customData?.minWeight?.toFixed(
    1
  )} - ${customData?.maxWeight?.toFixed(1)}`;
  const weight = customData?.weight || model?.weight;

  return (
    <div className={classes?.info}>
      <div className={classes.type}>{model?.data?.type}</div>
      <div>Version ID: {curVersion.id}</div>
      <div>Base model: {curVersion?.baseModel}</div>
      {size && <div>Size: {size}</div>}
      {!!customData?.minWeight && <div>Weight: {weightRange}</div>}
      {weight && <div>Best weight: {weight}</div>}
      <div>
        Version:{" "}
        <a
          target="blank"
          href={`https://${model?.src}/models/${model?.id}?modelVersionId=${curVersion.id}`}
          className={classes.link}
        >
          {curVersion?.name}
        </a>
      </div>
      {customData?.fileName ||
        (curVersion.hasOwnProperty("files") && !!curVersion?.files?.length && (
          <div>
            File:{" "}
            {customData?.fileName ||
              (curVersion.hasOwnProperty("files") &&
                curVersion?.files.find((file) => file?.primary)?.name)}
          </div>
        ))}
      {viersionVAE && <div>VAE: {viersionVAE}</div>}
      {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
    </div>
  );
};

export default ModelInfo;
