export type UserRole = "admin" | "staff" | "customer";

export interface DemoUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function toSessionUser(user: DemoUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
