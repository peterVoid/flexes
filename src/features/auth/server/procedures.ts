import { db } from "@/db";
import { UsersTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async () => {
    const user = await currentUser();

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Something went wrong",
      });
    }

    const getUser = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.clerkId, user.id),
    });

    if (!getUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return getUser;
  }),
});
