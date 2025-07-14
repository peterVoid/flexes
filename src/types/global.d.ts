import { UserRoles } from "@/db/schema";

export {};

declare global {
  interface UserPublicMetadata {
    userId: string;
    role: UserRoles;
  }
  interface CustomJwtSessionClaims {
    userId: string;
    role: UserRoles;
  }
}
