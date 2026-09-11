import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accountId: string;
    } & DefaultSession["user"];
  }

  interface User {
    accountId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId: string;
  }
}
