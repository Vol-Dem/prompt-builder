export const TIMEOUT_SEC = 10;
export const RESULT_NUM = 10;
export const SPLIT_TAG_REGEX = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
export const modelTypes = [
  { name: "LoRa/LoCon", value: "lora", position: 1 },
  { name: "Checkpoint", value: "checkpoint", position: 2 },
  { name: "Embedding", value: "embedding", position: 3 },
  { name: "Hypernetwork", value: "hypernetwork", position: 4 },
  { name: "Wildcard", value: "wildcard", position: 5 },
  { name: "Motion", value: "motionmodule", position: 6 },
  { name: "Controlnet", value: "controlnet", position: 7 },
  { name: "VAE", value: "vae", position: 8 },
  { name: "Wildcards", value: "wildcards", position: 9 },
  { name: "Other", value: "other", position: 10 },
];
