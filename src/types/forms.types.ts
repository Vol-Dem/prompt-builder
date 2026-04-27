import type { SelectOption } from "./general.types";

export type SubcategoryInput<T extends string | number = string> = {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value?: string;
  query?: string;
  selected: SelectOption<T> | null;
  isValid: boolean;
  errorMessage: string;
};

export type SelectInput<T extends string | number = string> = {
  name: string;
  id: T | null;
  isValid: boolean;
  errorMessage?: string;
};

export type VersionStatusInput = {
  type: string;
  id: string;
  name: string;
  label: string;
  value: boolean;
};
