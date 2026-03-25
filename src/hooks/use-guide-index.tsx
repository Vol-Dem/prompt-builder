import { useEffect, useMemo, useState } from "react";
import type { GuideStep, GuideType } from "../types/guide.types";
import { useAppSelector } from "../store/hooks/hooks";

/**
 * Calculates the current guide index for a given guide type
 * @param {string} guideType - The guide type
 * @param {Array} guideSteps - The array of guide steps
 * @returns The current guide index
 */
const useGuideIndex = (guideType: GuideType, guideSteps: GuideStep[]) => {
  const [guideStepIndex, setGuideStepIndex] = useState<number | null>(null);
  const guideState = useAppSelector((state) => state.guide);

  const curGuideState = useMemo(() => {
    return guideState[guideType];
  }, [guideState, guideType]);

  useEffect(() => {
    const stepIndex = guideSteps?.findIndex(
      (stepData) => stepData.step === curGuideState.step,
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
