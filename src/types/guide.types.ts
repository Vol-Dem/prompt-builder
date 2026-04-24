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

export interface GuideStep {
  step: number;
}
