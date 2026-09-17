import type { ComponentProps } from "react";

import InputNumber from "../../../ui/forms/InputNumber";
import { VALIDATION_NUMBER_MAX_LENGTH } from "../../../../variables/constants";
import classes from "./VersionWeightFields.module.scss";

type WeightChangeHandler = ComponentProps<typeof InputNumber>["onChange"];

type VersionWeightFieldsProps = {
  minWeight: string;
  maxWeight: string;
  weight: string;
  showError: boolean;
  onMinWeightChange: WeightChangeHandler;
  onMaxWeightChange: WeightChangeHandler;
  onWeightChange: WeightChangeHandler;
};

const VersionWeightFields = ({
  minWeight,
  maxWeight,
  weight,
  showError,
  onMinWeightChange,
  onMaxWeightChange,
  onWeightChange,
}: VersionWeightFieldsProps) => {
  return (
    <div>
      <span className={classes["weight__label"]}>Weight</span>
      <div className={classes.weight}>
        <InputNumber
          id="minWeight"
          name="minWeight"
          type="number"
          step={0.1}
          placeholder="Min"
          value={minWeight}
          onChange={onMinWeightChange}
          validation={{
            number: true,
            maxLength: VALIDATION_NUMBER_MAX_LENGTH,
          }}
          showError={showError}
        />
        <InputNumber
          id="maxWeight"
          name="maxWeight"
          type="number"
          step={0.1}
          placeholder="Max"
          value={maxWeight}
          onChange={onMaxWeightChange}
          validation={{
            number: true,
            maxLength: VALIDATION_NUMBER_MAX_LENGTH,
          }}
          showError={showError}
        />
        <InputNumber
          id="weight"
          name="weight"
          type="number"
          step={0.1}
          placeholder="Recomended"
          value={weight}
          onChange={onWeightChange}
          validation={{
            number: true,
            maxLength: VALIDATION_NUMBER_MAX_LENGTH,
          }}
          showError={showError}
        />
      </div>
    </div>
  );
};

export default VersionWeightFields;
