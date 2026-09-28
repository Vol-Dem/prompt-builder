import { useEffect } from "react";

import classes from "./ModelsList.module.scss";
import Spinner from "../../ui/Spinner";
import NotificationMessage from "../../ui/NotificationMessage";
import ErrorMessage from "../../ui/ErrorMessage";
import { GUIDE_STEP_OPEN_MODEL, ERROR_MESSAGE_OFFLINE } from "../../../variables/constants";
import OpenModelGuide from "../../general-elements/guide/home/OpenModelGuide";
import { guideActions } from "../../../store/guide";
import PreviewCard from "../../general-elements/preview-card/PreviewCard";
import ModelsListPanel from "./models-list-panel/ModelsListPanel";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import useModelPreviewLoading from "../../../hooks/use-model-preview-loading";

/** Displays model previews, view controls, loading feedback, and onboarding guidance. */
const ModelsList = () => {
  const { previews, endPageRef, status } = useModelPreviewLoading();
  const activeSubcategory = useAppSelector((state) => state.tabs.currSubcategory);
  const previewFullView = useAppSelector((state) => state.tabs.previewFullView);
  const guideState = useAppSelector((state) => state.guide.home);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      guideState?.step < GUIDE_STEP_OPEN_MODEL &&
      previews?.length
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "home",
          value: GUIDE_STEP_OPEN_MODEL,
        }),
      );
    }
  }, [guideState, previews, dispatch]);

  const modelsPreviewHtml = previews?.map((item, i) => {
    return <PreviewCard key={i} item={item} fullView={previewFullView} />;
  });

  return (
    <div className={classes["container"]}>
      {activeSubcategory && <ModelsListPanel />}
      <div
        className={`${classes["category"]} ${
          previewFullView ? classes["category__full"] : ""
        }`}
      >
        {modelsPreviewHtml}
      </div>
      {guideState?.active && !status.isLoading && !!modelsPreviewHtml?.length && (
        <OpenModelGuide />
      )}
      {!modelsPreviewHtml?.length &&
        !status.errorMessage &&
        !status.isLoading &&
        status.isOnline &&
        activeSubcategory && (
          <NotificationMessage className={classes.empty} type="notification">
            This category is empty. Try changing the filter.
          </NotificationMessage>
        )}
      {status.errorMessage && <ErrorMessage>{status.errorMessage}</ErrorMessage>}
      {!status.isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPageRef}></div>
      {status.isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ModelsList;
