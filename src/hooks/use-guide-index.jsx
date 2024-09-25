import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

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
