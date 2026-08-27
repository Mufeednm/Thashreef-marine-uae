export interface ContactActionState {
  fieldErrors?: {
    email?: string[];
    message?: string[];
    name?: string[];
    phone?: string[];
  };
  message?: string;
  status: "error" | "idle" | "success";
}

export const initialContactActionState: ContactActionState = { status: "idle" };
