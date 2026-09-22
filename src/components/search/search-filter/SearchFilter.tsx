import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import Checkbox from "../../ui/forms/Checkbox";
import classes from "./SearchFilter.module.scss";
import Select from "../../ui/forms/Select";
import Tooltip from "../../ui/Tooltip";
import SearchFilterCheckboxGroup from "./search-filter-checkbox-group/SearchFilterCheckboxGroup";
import useSearchFilterController from "../../../hooks/use-search-filter-controller";

/** Renders the search-filter controls and source-specific selection counts. */
const SearchFilter = () => {
  const { source, sort, modelTypes, baseModels, hashtag, creator, reset } =
    useSearchFilterController();

  return (
    <>
      <div>
        <ButtonTertiary
          className={classes["filter__reset"]}
          onClick={reset}
        >
          Reset filter
        </ButtonTertiary>
      </div>
      <div className={classes.filter}>
        {source === "civitai" && (
          <Tooltip
            content={sort.disabled ? "Disabled due to a Civitai API bug" : ""}
            defSide="center"
          >
            <Select
              disabled={sort.disabled}
              options={sort.options}
              selected={sort.value}
              onChange={sort.onChange}
            />
          </Tooltip>
        )}
        {!!modelTypes.options.length && (
          <div>
            <Checkbox
              id={hashtag.id}
              name={hashtag.name}
              checked={hashtag.value}
              label={hashtag.label}
              onChange={hashtag.onChange}
            />
          </div>
        )}
        {!!modelTypes.options.length && (
          <div>
            <Checkbox
              id={creator.id}
              name={creator.name}
              checked={creator.value}
              label={creator.label}
              onChange={creator.onChange}
            />
          </div>
        )}
        {!!modelTypes.options.length && (
          <SearchFilterCheckboxGroup
            title="Type"
            options={modelTypes.options}
            checkedCount={modelTypes.checkedCount}
            maxAllowed={modelTypes.maxAllowed}
            showSelectionCount={source === "aitools"}
            onChange={modelTypes.onChange}
          />
        )}
        {!!baseModels.options.length && (
          <SearchFilterCheckboxGroup
            title="Base model"
            options={baseModels.options}
            checkedCount={baseModels.checkedCount}
            maxAllowed={baseModels.maxAllowed}
            showSelectionCount={source === "aitools"}
            onChange={baseModels.onChange}
          />
        )}
      </div>
    </>
  );
};

export default SearchFilter;
