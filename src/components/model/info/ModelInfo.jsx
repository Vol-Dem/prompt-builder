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
          {curVersion?.name}{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
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
