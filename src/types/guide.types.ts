import type { ReactNode } from "react";

export interface GuideState {
  active: boolean;
  introDisabled: boolean;
  outroIsActive: boolean;
  home: {
    active: boolean;
    step: number;
  };
  model: {
    active: boolean;
    step: number;
  };
  edit: {
    active: boolean;
    step: number;
  };
}

export type GuideType = "home" | "model" | "edit";

export interface SwitchStepPayload {
  type: GuideType;
}

export interface SetStepPayload {
  type: GuideType;
  value: number | null;
}

export interface SetGuideIsActivePayload {
  type: GuideType;
  value: boolean;
}

export type GuideArrowPossition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface GuideStep {
  step: number | string | null;
  arrowPosition?: GuideArrowPossition;
  next?: boolean;
  text?: ReactNode;
}
