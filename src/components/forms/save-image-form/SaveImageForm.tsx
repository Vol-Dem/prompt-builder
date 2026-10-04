import classes from "./SaveImageForm.module.scss";
import Input from "../../ui/forms/Input";
import Select from "../../ui/forms/Select";
import Checkbox from "../../ui/forms/Checkbox";
import Button from "../../ui/buttons/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import Spinner from "../../ui/Spinner";
import { VALIDATION_POST_URL_MAX_LENGTH } from "../../../variables/constants";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoPostId from "../../general-elements/info/InfoPostId";
import type {
  ModelData,
  ResourceFirestoreCollection,
} from "../../../types/models.types";
import type { CollectionSavedPost } from "../../../../shared/types/collection";
import type { CollectionData } from "../../../types/collections.types";
import type { ModelSavedImages } from "../../../../shared/types/model";
import usePostImageImport from "../../../hooks/use-post-image-import";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

type SaveImageForm = {
  modelData?: ModelData | null;
  curVersion?: number | null;
  location: ResourceFirestoreCollection;
  collectionInfo?: CollectionData;
  savedPosts?: CollectionSavedPost[];
  savedModelPosts?: ModelSavedImages;
};

/**
 * Save Image form component.
 *
 * Allows saving images to the current model or collection using a post ID or URL.
 * Accepts a numeric post ID or a full Civitai URL, parses the ID when needed,
 * fetches post images from the Civitai API, and forwards the result to
 * ChooseImageForm for selection and saving.
 *
 * Model-specific behavior:
 * - When location is "models", renders additional inputs for model version.
 * - Provides a "Show only images related to this model" option to filter
 *   fetched post images to those generated with the selected model version.
 *
 * Responsibilities:
 * - Renders input for post ID / URL parsing.
 * - Extracts post ID from URLs.
 * - Fetches post image data from the Civitai API.
 * - Passes fetched images to ChooseImageForm.
 * - Displays validation and error messages.
 *
 * Side effects:
 * - Fetches post images from the Civitai API.
 *
 * @component
 * @param props
 * @param props.modelData - Current model data (used when location is "models").
 * @param props.curVersion - Currently selected model version ID.
 * @param props.location - Target entity type for saving images.
 * @param props.collectionInfo - Target collection data (used when location is "collections").
 * @param props.savedPosts - IDs of images already saved to the collection.
 * @param props.savedModelPosts - Map of version IDs to saved image IDs for models.
 * @returns Save Image form.
 */
const SaveImageForm = ({
  modelData,
  curVersion,
  location,
  collectionInfo,
  savedPosts,
  savedModelPosts,
}: SaveImageForm) => {
  const { fields, selection, status, loadPostImages } = usePostImageImport({
    modelData, curVersion, location, savedPosts, savedModelPosts,
  });

  return (
    <>
      {selection.isOpen && (
        <button
          type="button"
          title="Back"
          className={classes["btn-back"]}
          onClick={selection.onBack}
        >
          <ArrowUturnLeftIcon />
        </button>
      )}
      <div
        className={`${classes["form"]} ${
          selection.isOpen ? classes["hidden"] : ""
        }`}
      >
        {location === "models" && fields.version.options && (
          <Select
            label="Select version:"
            name="curVersionId"
            id="version-select"
            selected={fields.version.value || undefined}
            onChange={fields.version.onChange}
            options={fields.version.options}
          />
        )}
        <Input
          id="post-id"
          name="post-id"
          type="text"
          label="Post ID or URL"
          labelAction={
            <ButtonInfo className={classes["btn-info"]}>
              <InfoPostId />
            </ButtonInfo>
          }
          autoFocus
          placeholder="post id or url"
          disabled={status.isLoading}
          value={fields.postId.value}
          onChange={fields.postId.onChange}
          className={`${classes["auth__input"]} ${
            !fields.postId.isValid ? classes.invalid : ""
          }`}
          validation={{
            required: true,
            maxLength: VALIDATION_POST_URL_MAX_LENGTH,
          }}
          showError={status.showErrorMessage}
        />
        {location === "models" && (
          <div className={classes.filter}>
            <Checkbox
              id="filter"
              label="Show only images related to this model"
              checked={fields.modelFilter.checked}
              className={classes["checkbox"]}
              onChange={fields.modelFilter.onChange}
            />
          </div>
        )}
        <Button
          type="button"
          disabled={status.isLoading}
          className={classes.submit}
          onClick={loadPostImages}
        >
          {!status.isLoading ? "Select images" : <Spinner size="small" />}
        </Button>
        {status.successMessage && <SuccessMessage>{status.successMessage}</SuccessMessage>}
        {status.errorMessage && <ErrorMessage>{status.errorMessage}</ErrorMessage>}
      </div>
      {selection.isOpen && (
        <ChooseImageForm
          type="save"
          postData={selection.postData}
          savedImageIds={selection.savedImageIds}
          modelId={modelData?.id}
          location={location}
          collectionInfo={collectionInfo}
          images={selection.images}
          onSave={selection.onSave}
        />
      )}
    </>
  );
};

export default SaveImageForm;
