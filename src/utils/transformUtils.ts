import type { User } from "firebase/auth";
import type {
  ModelVersion,
  ModelVersionCivitai,
  VersionFile,
  VersionFileCivitai,
} from "../../shared/types/model";
import { transformImageData } from "../../shared/utils";
import type { LoginPayload } from "../types/auth.types";
import type { CivitaiModelDoc, ModelDoc } from "../../shared/types/firestore";

// import { clearObjectKeys, convertToString } from "./generalUtils";

/**
 * Creates a model object
 * @param modelData - model data
 * @returns model object
 */
export const transformModelData = (modelData: CivitaiModelDoc): ModelDoc => {
  const newModelData = {
    ...modelData,
    modelVersions: transformModelVersionData(modelData?.modelVersions),
    stats: "",
  };

  return newModelData;
};

/**
 * Creates a model version object
 * @param versionData - version data
 * @returns model version object
 */
export const transformModelVersionData = (
  versionData: ModelVersionCivitai[],
): ModelVersion[] => {
  const newVersionData = versionData.map((version) => {
    const files =
      version?.files?.map((fileData) => {
        return transformFilesData(fileData);
      }) || [];

    const newImageData = version?.images?.map((imageData) => {
      return transformImageData(imageData);
    });

    return {
      baseModel: version?.baseModel || "",
      createdAt: version?.createdAt || "",
      description: version?.description || "",
      downloadUrl: version?.downloadUrl || "",
      files: files,
      id: version.id,
      images: newImageData || [],
      index: version?.index ?? null,
      name: version?.name || "",
      nsfwLevel: version?.nsfwLevel || null,
      trainedWords: version?.trainedWords || [],
    };
  });

  return newVersionData;
};

/**
 * Creates a files object
 * @param fileData - files data
 * @returns files object
 */
export const transformFilesData = (
  fileData: VersionFileCivitai,
): VersionFile => {
  const newFileData = {
    downloadUrl: fileData?.downloadUrl || "",
    hashes: fileData?.hashes || [],
    id: fileData?.id,
    metadata: { format: fileData?.metadata?.format || "" },
    name: fileData?.name || "",
    primary: fileData?.primary || false,
    sizeKB: fileData?.sizeKB,
    type: fileData?.type || "",
  };
  return newFileData;
};

export const mapFirebaseUser = async (user: User): Promise<LoginPayload> => ({
  accessToken: await user.getIdToken(),
  refreshToken: user.refreshToken,
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  emailVerified: user.emailVerified,
});
