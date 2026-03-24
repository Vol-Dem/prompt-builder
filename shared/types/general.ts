export type OverrideFields<What, With> = Omit<What, keyof With> & With;
