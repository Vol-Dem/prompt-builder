import { XMarkIcon } from "@heroicons/react/24/outline";

import Input from "../../../ui/forms/Input";
import Textarea from "../../../ui/forms/Textarea";
import Fieldset from "../../../ui/forms/Fieldset";
import ButtonSecondary from "../../../ui/buttons/ButtonSecondary";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import {
  VALIDATION_NAME_MAX_LENGTH,
  VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
} from "../../../../variables/constants";
import type { ExtendedOnChange } from "../../../../types/general.types";
import type { TagSetInputData } from "../../../../types/prompt.types";
import classes from "./VersionTagSetsFieldset.module.scss";

type VersionTagSetsFieldsetProps = {
  tagSets: TagSetInputData[];
  showError: boolean;
  isSaving: boolean;
  onAdd: () => void;
  onChange: ExtendedOnChange<HTMLInputElement | HTMLTextAreaElement>;
  onDelete: (index: number) => void;
};

const VersionTagSetsFieldset = ({
  tagSets,
  showError,
  isSaving,
  onAdd,
  onChange,
  onDelete,
}: VersionTagSetsFieldsetProps) => {
  const tagSetsHtml =
    !!tagSets.length &&
    tagSets.map((tagSet, i) => {
      return (
        <div key={tagSet[0].id} className={classes["tagset"]}>
          <div className={classes["tagset__header"]}>
            <span
              className={classes["tagset__title"]}
            >{`Tagset ${i + 1}`}</span>{" "}
            {i !== 0 && (
              <ButtonTertiary
                type="button"
                className={classes["input__btn-del"]}
                onClick={onDelete.bind(null, i)}
              >
                <XMarkIcon />
              </ButtonTertiary>
            )}
          </div>
          <Input
            id={tagSet[0].id}
            name={tagSet[0].name}
            type={tagSet[0].type}
            placeholder={tagSet[0].placeholder}
            onChange={onChange}
            value={tagSet[0].value}
            showError={showError}
            validation={{
              maxLength: VALIDATION_NAME_MAX_LENGTH,
            }}
          />
          <Textarea
            id={tagSet[1].id}
            name={tagSet[1].name}
            rows={5}
            placeholder={tagSet[1].placeholder}
            onChange={onChange}
            value={tagSet[1].value}
            showError={showError}
            validation={{
              maxLength: VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
            }}
          ></Textarea>
        </div>
      );
    });

  return (
    <Fieldset legend="Tag sets">
      {tagSetsHtml}
      <ButtonSecondary
        type="button"
        onClick={onAdd}
        disabled={isSaving}
        className={classes["btn-secondary"]}
      >
        + add new set
      </ButtonSecondary>
    </Fieldset>
  );
};

export default VersionTagSetsFieldset;
