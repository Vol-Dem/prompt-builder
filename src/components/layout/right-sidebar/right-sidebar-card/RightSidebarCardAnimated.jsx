import RightSidebarCard from "./RightSidebarCard";

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
 * @param {object} props
 * @param {object} props.model - Model data used to render the preview card.
 * @param {boolean} props.fullView - Whether to render the expanded card layout.
 *
 * @returns {JSX.Element} Wrapper that renders animated and static sidebar cards.
 */
const RightSidebarCardAnimated = ({ model, fullView }) => {
  return (
    <div style={{ position: "relative" }}>
      <RightSidebarCard
        layoutId={model.id}
        previewData={model}
        fullView={fullView}
      />
      <RightSidebarCard previewData={model} fullView={fullView} />
    </div>
  );
};

export default RightSidebarCardAnimated;
