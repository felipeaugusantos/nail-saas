import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountId: string;
      role: "OWNER" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    accountId: string;
    role: "OWNER" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId: string;
    role: "OWNER" | "STAFF";
  }
}
