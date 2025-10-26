import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

/**
 * Calculates the current guide index for a given guide type
 * @param {String} guideType - The guide type
 * @param {Array} guideSteps - The array of guide steps
 * @returns The current guide index
 */
const useGuideIndex = (guideType, guideSteps) => {
  const [guideStepIndex, setGuideStepIndex] = useState(null);
  const guideState = useSelector((state) => state.guide);

  const curGuideState = useMemo(() => {
    return guideState[guideType];
  }, [guideState, guideType]);

  useEffect(() => {
    const stepIndex = guideSteps?.findIndex(
      (stepData) => stepData.step === curGuideState.step
    );
    if (guideSteps && stepIndex !== -1) {
      setGuideStepIndex(stepIndex);
    } else {
      setGuideStepIndex(null);
    }
  }, [curGuideState, guideSteps, guideType]);

  return guideStepIndex;
};

export default useGuideIndex;
