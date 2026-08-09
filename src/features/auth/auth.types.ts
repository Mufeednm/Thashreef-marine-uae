export interface LoginActionState {
  fieldErrors?: {
    email?: string[];
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
