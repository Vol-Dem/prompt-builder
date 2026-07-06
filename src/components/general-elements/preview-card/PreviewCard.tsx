import PreviewCardContent from "./PreviewCardContent";
import AddToPanelAnimContainer from "../../ui/animation/AddToPanelAnimContainer";
import type {
  CollectionPreviewDoc,
  ModelPreview,
  ModelPreviewDoc,
} from "../../../../shared/types/firestore";
import { useAppSelector } from "../../../store/hooks/hooks";

type PreviewCardProps = {
  item: ModelPreviewDoc | CollectionPreviewDoc | ModelPreview;
  fullView?: boolean;
  animate?: boolean;
};

/**
 * Wrapper component used to stabilize Framer Motion shared layout animations
 * for right sidebar cards.
 *
 * ⚠️ Known Framer Motion glitch:
 * When navigating away from the card list page and then returning back,
 * Framer Motion attempts to restore the previous `layoutId` mapping and
 * incorrectly animates the sidebar card back to its original position
 * in the list, even though that element no longer exists in the DOM.
 *
 * This results in cards visually "flying back" from the sidebar into the
 * grid/list on page re-entry.
 *
 * 🛠 Solution:
 * This component intentionally renders the same card twice:
 *  - The first instance receives a `layoutId` and participates in shared
 *    layout animations.
 *  - The second instance is a static fallback copy without `layoutId`.
 *
 * This duplication breaks the stale layoutId mapping on remount and
 * prevents Framer Motion from replaying invalid return animations when
 * navigating between routes, while still preserving smooth transitions
 * during normal add/remove and view-switch operations.
 *
 * @component
 *
 * @param props
 * @param props.item - Card data used to render the preview card.
 * @param props.fullView - Whether to render the expanded card layout.
 * @param props.animate - Whether animation is enabled.
 *
 * @returns Wrapper that renders animated and static sidebar cards.
 */
const PreviewCard = ({ item, fullView, animate = true }: PreviewCardProps) => {
  // @ts-ignore:next-line no-unused-vars
  const sidebarModels = useAppSelector((state) => state.used.models); //Fixes a delay in the animation of adding the first item to the sidebar in production.

  return (
    <AddToPanelAnimContainer>
      <PreviewCardContent previewData={item} fullView={fullView} />
      {animate && (
        <PreviewCardContent
          animate={true}
          previewData={item}
          fullView={fullView}
        />
      )}
    </AddToPanelAnimContainer>
  );
};

export default PreviewCard;
