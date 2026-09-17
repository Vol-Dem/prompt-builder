export const MODEL_TYPES = [
  {
    name: "LoRa/LoCon/DoRa",
    value: "lora",
    position: 1,
    aliases: ["lora", "locon", "dora"],
  },
  {
    name: "Checkpoint",
    value: "checkpoint",
    position: 2,
    aliases: ["checkpoint"],
  },
  {
    name: "Embedding",
    value: "embedding",
    position: 3,
    aliases: ["embedding", "textualinversion"],
  },
  {
    name: "Hypernetwork",
    value: "hypernetwork",
    position: 4,
    aliases: ["hypernetwork"],
  },
  { name: "Wildcard", value: "wildcard", position: 5, aliases: ["wildcard"] },
  {
    name: "Motion",
    value: "motionmodule",
    position: 6,
    aliases: ["motionmodule"],
  },
  {
    name: "Controlnet",
    value: "controlnet",
    position: 7,
    aliases: ["controlnet"],
  },
  { name: "VAE", value: "vae", position: 8, aliases: ["vae"] },
  {
    name: "Wildcards",
    value: "wildcards",
    position: 9,
    aliases: ["wildcards"],
  },
  { name: "Upscaler", value: "upscaler", position: 10, aliases: ["upscaler"] },
  { name: "Other", value: "other", position: 10, aliases: ["other"] },
];

//Example model filer
export const EXAMPLE_MODEL_ID = 727427;
export const EXAMPLE_MODEL_FILTER_CIV = true;
export const EXAMPLE_MODEL_FILTER_LVL = "Mature";

//Temp Civitai duplicates filter (Civ bug)
export const FILTER_CIV_DUPLICATES = true;
