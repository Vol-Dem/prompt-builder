import { Link } from "react-router-dom";
import { ArrowUturnLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

import Button from "../../ui/buttons/Button";
import classes from "./NavigationPanel.module.scss";
import type { ComponentProps } from "react";

type NavigationPanelProps = ComponentProps<"div"> & {
  onBack: () => void;
};

/**
 * Application inner page navigation for models and collections.
 *
 * Displays navigation controls including a back button, a link to the edit page,
 * and category / subcategory navigation links for the current model or collection.
 *
 * @component
 *
 * @param props
 * @param props.onBack - Callback triggered when the Back button is clicked.
 * @param props.children - Navigation content (links to the current
 * model or collection categories and subcategories).
 *
 * @returns The navigation panel element.
 */
const NavigationPanel = ({ onBack, children }: NavigationPanelProps) => {
  return (
    <div className={classes["panel"]}>
      <Button className={classes["btn-back"]} onClick={onBack}>
        <ArrowUturnLeftIcon />
        <span>Back</span>
      </Button>
      <div className={classes.categories}>{children}</div>
      <Link className={`${classes["btn-edit"]}`} to="edit">
        <Cog6ToothIcon />
        Edit
      </Link>
    </div>
  );
};

export default NavigationPanel;
