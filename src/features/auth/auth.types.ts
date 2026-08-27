export interface LoginActionState {
  values?: {
    email?: string;
    name?: string;
  };
  fieldErrors?: {
    code?: string[];
    email?: string[];
    identifier?: string[];
    name?: string[];
    password?: string[];
  };
  message?: string;
  otpRequested?: boolean;
  status: "error" | "idle" | "success";
}

export const initialLoginActionState: LoginActionState = {
  status: "idle",
};

export interface ChangeAdminPasswordActionState {
  fieldErrors?: {
    confirmPassword?: string[];
    currentPassword?: string[];
    newPassword?: string[];
  };
  message?: string;
  status: "error" | "idle" | "success";
}

export const initialChangeAdminPasswordActionState: ChangeAdminPasswordActionState = {
  status: "idle",
};
