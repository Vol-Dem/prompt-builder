import { useId, type AriaAttributes } from "react";

type FieldAccessibilityOptions = {
  id?: string;
  describedBy?: string;
  invalid?: AriaAttributes["aria-invalid"];
  externalErrorVisible: boolean;
  validationErrorVisible: boolean;
};

/** Connects a field to its rendered errors while preserving caller descriptions. */
const useFieldAccessibility = ({
  id,
  describedBy,
  invalid,
  externalErrorVisible,
  validationErrorVisible,
}: FieldAccessibilityOptions) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const externalErrorId = `${generatedId}-external-error`;
  const validationErrorId = `${generatedId}-validation-error`;
  const descriptionIds = [
    ...(describedBy?.split(/\s+/) ?? []),
    externalErrorVisible ? externalErrorId : undefined,
    validationErrorVisible ? validationErrorId : undefined,
  ].filter(Boolean);

  return {
    fieldId,
    externalErrorId,
    validationErrorId,
    ariaProps: {
      "aria-describedby": [...new Set(descriptionIds)].join(" ") || undefined,
      "aria-invalid":
        invalid ?? (externalErrorVisible || validationErrorVisible || undefined),
    },
  };
};

export default useFieldAccessibility;
