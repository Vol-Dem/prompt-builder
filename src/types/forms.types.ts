export type SubcategoryDefInputData = {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  query: string;
  selected: { id: string | null; name: string };
  isValid: boolean;
  errorMessage: string;
};
