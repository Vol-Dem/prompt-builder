import { Link } from "react-router-dom";
import {
  ArrowUturnLeftIcon,
  CloudArrowDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import Button from "../../ui/buttons/Button";
import classes from "./NavigationPanel.module.scss";
import { useState, type ComponentProps } from "react";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal";
import UpdateModelForm from "../../forms/update-model-form/UpdateModelForm";
import type { ModelData } from "../../../types/models.types";
import { useAppSelector } from "../../../store/hooks/hooks";

type NavigationPanelProps = ComponentProps<"div"> & {
  onBack: () => void;
  saved?: boolean;
  modelData?: ModelData | null;
  versionId?: number | null;
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
const NavigationPanel = ({
  onBack,
  children,
  saved = true,
  modelData,
  versionId,
}: NavigationPanelProps) => {
  const [fromIsOpen, setFromIsOpen] = useState(false);
  const paddingMain = useAppSelector(
    (state) => state.general.promptPanelHeight,
  );
  const headerIsFixed = useAppSelector((state) => state.general.headerIsFixed);

  return (
    <div className={classes["panel"]}>
      <Button className={classes["btn-back"]} onClick={onBack}>
        <ArrowUturnLeftIcon />
        <span>Back</span>
      </Button>
      <div className={classes.categories}>{children}</div>
      {saved && (
        <Link className={`${classes["btn-edit"]}`} to="edit">
          <Cog6ToothIcon />
          Edit
        </Link>
      )}
      {!saved && (
        <Button
          className={`${classes["btn-edit"]} ${classes["btn-edit--green"]}`}
          style={{
            top:
              headerIsFixed && paddingMain ? `${paddingMain + 4}px` : undefined,
            position: !headerIsFixed ? "static" : "fixed",
          }}
          onClick={() => setFromIsOpen(true)}
        >
          <CloudArrowDownIcon />
          Save
        </Button>
      )}
      <AnimatePresence>
        {fromIsOpen && modelData && (
          <Modal title="Add new resource" onClose={() => setFromIsOpen(false)}>
            <UpdateModelForm
              newModelId={modelData?.id}
              newModelVersionId={versionId}
              newModelType={modelData.data?.type || null}
              className={classes.form}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationPanel;
