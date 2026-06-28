import { Link, useNavigate } from "react-router-dom";

import NavigationPanel from "../../layout/navigation-panel/NavigationPanel";
import { tabActions } from "../../../store/tabs";
import classes from "./ModelNavigationPanel.module.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Application inner navigation for model page.
 *
 * Displays navigation controls including a back button, a link to the edit page,
 * and category / subcategory navigation links for the current model.
 *
 * @component
 *
 * @returns The model navigation panel element.
 */
const ModelNavigationPanel = () => {
  const model = useAppSelector((state) => state.model.model);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  let mainCategoryName = null;

  if (model?.id) {
    const mainCatName = categories[model?.modelType]?.find(
      (category) => category.id === model?.main,
    )?.name;

    if (mainCatName) mainCategoryName = mainCatName;
  }

  const subCatsHtml = model?.sub?.flatMap((sub, i) => {
    const subcategoryName = categories[model?.modelType]
      ?.find((category) => category.id === model?.main)
      ?.subcategories?.find((subcategory) => subcategory.id === sub)?.name;

    if (!subcategoryName) {
      return [];
    }

    return (
      <li key={i}>
        <Link
          to="/"
          className={classes["link"]}
          onClick={() => {
            if (model?.main) {
              dispatch(tabActions.setCurrentTab(model.modelType));
              dispatch(tabActions.setCurrentCategory(model.main));
              dispatch(tabActions.setCurrentSubcategory(sub));
            }
          }}
        >
          {subcategoryName}
        </Link>
      </li>
    );
  });

  const backHandler = () => {
    navigate("/");
  };

  return (
    <NavigationPanel
      onBack={backHandler}
      saved={!!model?.modelVersionsCustomData}
      modelData={model}
      versionId={curVersion?.id}
    >
      {(mainCategoryName || model?.main) && (
        <Link
          to="/"
          className={classes["link"]}
          onClick={() => {
            if (model?.main) {
              dispatch(tabActions.setCurrentTab(model.modelType));
              dispatch(tabActions.setCurrentCategory(model.main));
            }
          }}
        >
          {mainCategoryName || model?.main}
        </Link>
      )}
      <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
    </NavigationPanel>
  );
};

export default ModelNavigationPanel;
