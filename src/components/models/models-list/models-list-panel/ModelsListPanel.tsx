import { Bars2Icon, Bars4Icon } from "@heroicons/react/24/outline";

import classes from "./ModelsListPanel.module.scss";
import Select from "../../../ui/forms/Select";
import {
  getModelsPreview,
  switchPreviewFullView,
  tabActions,
} from "../../../../store/tabs";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import { cloneObject } from "../../../../utils/generalUtils";
import { TABS_INITIAL_MODELS_DATA } from "../../../../variables/structures";

const sortTypes = [
  { name: "Newest", value: "createdAt" },
  { name: "Name", value: "name" },
];
const baseModelsDef = [{ name: "-", value: "-" }];

const ModelsListPanel = () => {
  const activeTab = useAppSelector((state) => state.tabs.currTab);
  const activeCategory = useAppSelector((state) => state.tabs.currCategory);
  const activeSubcategory = useAppSelector(
    (state) => state.tabs.currSubcategory,
  );
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const sortBy = useAppSelector((state) => state.tabs.sortBy);
  const baseModel = useAppSelector((state) => state.tabs.baseModel);
  const baseModels = useAppSelector((state) => state.tabs.baseModels);
  const previewFullView = useAppSelector((state) => state.tabs.previewFullView);
  const dispatch = useAppDispatch();

  const baseModelsData = !baseModels?.length
    ? baseModelsDef
    : [
        ...baseModelsDef,
        ...baseModels.map((model) => {
          return { name: model, value: model };
        }),
      ];

  const sortSelectOption = sortTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  return (
    <div className={classes.panel}>
      <span className={classes["panel__title"]}>Sort by:</span>
      <Select
        id="sort"
        name="sort"
        selected={sortBy}
        onChange={(value) => {
          dispatch(tabActions.setSortBy(value));
          dispatch(
            tabActions.setModelsData(cloneObject(TABS_INITIAL_MODELS_DATA)),
          );
          dispatch(
            getModelsPreview(
              activeTab,
              activeCategory,
              activeSubcategory,
              false,
              nsfwMode,
            ),
          );
        }}
        options={sortSelectOption}
        className={classes.select}
      />
      <Select
        id="model"
        name="model"
        selected={baseModel}
        onChange={(value) => {
          dispatch(tabActions.setBaseModel(value));
          dispatch(
            tabActions.setModelsData(cloneObject(TABS_INITIAL_MODELS_DATA)),
          );
          dispatch(
            getModelsPreview(
              activeTab,
              activeCategory,
              activeSubcategory,
              false,
              nsfwMode,
            ),
          );
        }}
        options={baseModelsData}
        className={classes.select}
      />
      <div className={classes["panel__view"]}>
        <ButtonTertiary
          type="button"
          className={`${classes["panel__btn"]} ${
            !previewFullView ? classes["panel__btn--active"] : ""
          }`}
          onClick={() => {
            dispatch(switchPreviewFullView(false));
          }}
          title="Short view"
        >
          <Bars2Icon className={classes["panel__btn-icon"]} />
        </ButtonTertiary>
        <ButtonTertiary
          type="button"
          className={`${classes["panel__btn"]} ${
            previewFullView ? classes["panel__btn--active"] : ""
          }`}
          onClick={() => {
            dispatch(switchPreviewFullView(true));
          }}
          title="Expanded view"
        >
          <Bars4Icon className={classes["panel__btn-icon"]} />
        </ButtonTertiary>
      </div>
    </div>
  );
};

export default ModelsListPanel;
