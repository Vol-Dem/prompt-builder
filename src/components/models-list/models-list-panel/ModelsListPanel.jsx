import { useDispatch, useSelector } from "react-redux";
import classes from "./ModelsListPanel.module.scss";
import Select from "../../ui/Select";
import {
  getModelsPreview,
  switchPreviewFullView,
  tabActions,
} from "../../../store/tabs";
import { Bars2Icon, Bars4Icon } from "@heroicons/react/24/outline";
import ButtonTertiary from "../../ui/ButtonTertiary";

const sortTypes = [
  { name: "Newest", value: "createdAt" },
  { name: "Name", value: "name" },
];
const baseModelsDef = [{ name: "-", value: "-" }];

const ModelsListPanel = () => {
  const activeTab = useSelector((state) => state.tabs.currTab);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const sortBy = useSelector((state) => state.tabs.sortBy);
  const modelType = useSelector((state) => state.tabs.modelType);
  const baseModels = useSelector((state) => state.tabs.baseModels);
  const previewFullView = useSelector((state) => state.tabs.previewFullView);
  const dispatch = useDispatch();

  const baseModelsData = !baseModels?.length
    ? baseModelsDef
    : [
        ...baseModelsDef,
        ...baseModels?.map((model) => {
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
          dispatch(tabActions.setModelsData([]));
          dispatch(
            getModelsPreview(
              activeTab,
              activeCategory,
              activeSubcategory,
              false,
              nsfwMode
            )
          );
        }}
        options={sortSelectOption}
        className={classes.select}
      />
      <Select
        id="model"
        name="model"
        selected={modelType}
        onChange={(value) => {
          dispatch(tabActions.setModelType(value));
          dispatch(tabActions.setModelsData([]));
          dispatch(
            getModelsPreview(
              activeTab,
              activeCategory,
              activeSubcategory,
              false,
              nsfwMode
            )
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
