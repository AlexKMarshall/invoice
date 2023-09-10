import type { User } from "@prisma/client";

export type ProviderUser = Pick<User, "id" | "email">;
