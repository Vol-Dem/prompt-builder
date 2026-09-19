import type { ChangeEventHandler } from "react";

import classes from "./ModelVersionsFieldset.module.scss";
import Checkbox from "../../../ui/forms/Checkbox";
import Fieldset from "../../../ui/forms/Fieldset";
import type { VersionStatusInput } from "../../../../types/forms.types";

type ModelVersionsFieldsetProps = {
  versions: VersionStatusInput[];
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const ModelVersionsFieldset = ({
  versions,
  onChange,
}: ModelVersionsFieldsetProps) => {
  const versionStatusHtml = versions?.map((version) => {
    return (
      <div className={classes["example-field"]} key={version.id}>
        <Checkbox
          id={version.id}
          name={version.name}
          checked={version.value}
          label={version.label}
          onChange={onChange}
        />
      </div>
    );
  });

  return (
    <Fieldset legend="Model versions" className={classes.versions}>
      {versionStatusHtml}
    </Fieldset>
  );
};

export default ModelVersionsFieldset;
