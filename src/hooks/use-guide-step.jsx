import useGuideIndex from "./use-guide-index";

/**
 * @typedef {Object} GuideStepConfig
 * @property {number} step - Redux guide step constant.
 * @property {number} arrowPosition - Arrow position index (0–8).
 * @property {boolean} next - Whether "Next step" is enabled.
 * @property {React.ReactNode} text - Guide message content.
 */

/**
 * Resolves the currently active guide step.
 *
 * @param {'home' | 'model' | 'edit'} guideType
 * @param {GuideStepConfig[]} steps - Guide steps data
 * @returns {{
 *   index: number,
 *   config: GuideStepConfig
 * } | null}
 */
const useGuideStep = (guideType, steps) => {
  const index = useGuideIndex(guideType, steps);
  return {
    index,
    step: index === null ? null : steps[index] || null,
  };
};

export default useGuideStep;
