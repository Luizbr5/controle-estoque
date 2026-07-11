import type { UserResponseDTO } from "./api.types";

export interface AuthenticatedUser {
  id: string;
  companyId: string;
  role: "OWNER" | "ADMIN" | "EMPLOYEE";
  name: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type { UserResponseDTO };