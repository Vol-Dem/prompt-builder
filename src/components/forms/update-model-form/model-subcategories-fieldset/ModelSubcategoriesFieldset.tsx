import type { ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

import classes from "./ModelSubcategoriesFieldset.module.scss";
import ButtonSecondary from "../../../ui/buttons/ButtonSecondary";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import ComboSelect from "../../../ui/forms/ComboSelect";
import Fieldset from "../../../ui/forms/Fieldset";
import {
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT,
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
} from "../../../../variables/constants";
import type { SubcategoryInput } from "../../../../types/forms.types";
import type { SelectOption } from "../../../../types/general.types";

type ModelSubcategoriesFieldsetProps = {
  subcategories: SubcategoryInput[];
  options: SelectOption<string>[];
  query: string;
  showError: boolean;
  onQueryChange: (value: string) => void;
  onSelect: ComponentProps<typeof ComboSelect<string>>["setSelected"];
  onAdd: () => void;
  onDelete: (index: number) => void;
};

const ModelSubcategoriesFieldset = ({
  subcategories,
  options,
  query,
  showError,
  onQueryChange,
  onSelect,
  onAdd,
  onDelete,
}: ModelSubcategoriesFieldsetProps) => {
  const subcategoriesHtml = subcategories.map((sub, i) => {
    return (
      <motion.div
        layout
        key={sub.id}
        initial={i ? ANIMATIONS_FM_SLIDEOUT_INITIAL : false}
        animate={ANIMATIONS_FM_SLIDEOUT}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
        className={classes["subcategory"]}
      >
        <ComboSelect
          id={sub.id}
          optionsData={options}
          query={query}
          setQuery={onQueryChange}
          setSelected={onSelect}
          selected={sub.selected ? { ...sub.selected } : null}
          placeholder="Subcategory"
          validation={{
            required: true,
            maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH,
          }}
          showError={showError}
        />
        {i !== 0 && (
          <ButtonTertiary
            type="button"
            className={classes["input__btn-del"]}
            onClick={onDelete.bind(null, i)}
          >
            <XMarkIcon />
          </ButtonTertiary>
        )}
      </motion.div>
    );
  });

  return (
    <Fieldset legend="Subcategories">
      <AnimatePresence>{subcategoriesHtml}</AnimatePresence>
      {subcategories?.length < SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT && (
        <ButtonSecondary
          type="button"
          id="sub"
          onClick={onAdd}
          className={classes["btn-secondary"]}
        >
          + add subcategory
        </ButtonSecondary>
      )}
    </Fieldset>
  );
};

export default ModelSubcategoriesFieldset;
