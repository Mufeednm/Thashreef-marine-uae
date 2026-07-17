export interface LoginActionState {
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
  status: "error" | "idle";
}

export const initialLoginActionState: LoginActionState = {
  status: "idle",
};
