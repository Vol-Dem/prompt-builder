import { Link } from "react-router-dom";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import Buttton from "../../ui/buttons/Button";
import classes from "./NavigationPanel.module.scss";
import SettingsSvg from "../../../assets/SettingsSvg";

/**
 * Application inner page navigation for models and collections.
 *
 * Displays navigation controls including a back button, a link to the edit page,
 * and category / subcategory navigation links for the current model or collection.
 *
 * @component
 *
 * @param {object} props
 * @param {() => void} props.onBack - Callback triggered when the Back button is clicked.
 * @param {React.ReactNode} props.children - Navigation content (links to the current
 * model or collection categories and subcategories).
 *
 * @returns {JSX.Element} The navigation panel element.
 */
const NavigationPanel = ({ onBack, children }) => {
  return (
    <div className={classes["panel"]}>
      <Buttton className={classes["btn-back"]} onClick={onBack}>
        <ArrowUturnLeftIcon />
        <span>Back</span>
      </Buttton>
      <div className={classes.categories}>{children}</div>
      <Link className={`${classes["btn-edit"]}`} to="edit">
        <SettingsSvg />
        Edit
      </Link>
    </div>
  );
};

export default NavigationPanel;
