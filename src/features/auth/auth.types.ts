export interface LoginActionState {
  values?: {
    countryCode?: string;
    email?: string;
    name?: string;
    phone?: string;
  };
  fieldErrors?: {
    countryCode?: string[];
    email?: string[];
    identifier?: string[];
    name?: string[];
    password?: string[];
    phone?: string[];
  };
  message?: string;
  status: "error" | "idle";
}

export const initialLoginActionState: LoginActionState = {
  status: "idle",
};
