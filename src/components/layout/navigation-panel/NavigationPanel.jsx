import { Link } from "react-router-dom";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import Buttton from "../../ui/Button";
import classes from "./NavigationPanel.module.scss";
import SettingsSvg from "../../../assets/SettingsSvg";

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
