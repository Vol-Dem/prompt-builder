import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavigationPanel from "../../layout/navigation-panel/NavigationPanel";
import { tabActions } from "../../../store/tabs";
import classes from "./ModelNavigationPanel.module.scss";

const ModelNavigationPanel = () => {
  const model = useSelector((state) => state.model.model);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let mainCategoryName = "Category";

  if (model.id) {
    mainCategoryName = categories[model?.modelType]?.find(
      (category) => category.id === model?.main
    )?.name;
  }

  const subCatsHtml = model?.sub?.flatMap((sub, i) => {
    const subcategoryName = categories[model?.modelType]
      ?.find((category) => category.id === model?.main)
      ?.subcategories.find((subcategory) => subcategory.id === sub)?.name;

    if (!subcategoryName) {
      return [];
    }

    return (
      <li key={i}>
        <Link
          to="/"
          className={classes["link"]}
          onClick={() => {
            dispatch(tabActions.setCurrentTab(model.modelType));
            dispatch(tabActions.setCurrentCategory(model.main));
            dispatch(tabActions.setCurrentSubcategory(sub));
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
    <NavigationPanel onBack={backHandler}>
      <Link
        to="/"
        className={classes["link"]}
        onClick={() => {
          dispatch(tabActions.setCurrentTab(model.modelType));
          dispatch(tabActions.setCurrentCategory(model.main));
        }}
      >
        {mainCategoryName || model?.main}
      </Link>
      <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
    </NavigationPanel>
  );
};

export default ModelNavigationPanel;
