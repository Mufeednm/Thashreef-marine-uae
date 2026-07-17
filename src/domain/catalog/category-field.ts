export type CategoryFieldInputType = "text" | "number" | "select" | "boolean";

export interface CategoryField {
  id: number;
  categoryId: number;
  label: string;
  fieldKey: string;
  inputType: CategoryFieldInputType;
  isRequired: boolean;
  displayOrder: number;
}
