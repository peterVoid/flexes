import { db } from "@/db";
import { UsersTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async () => {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const getUser = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.clerkId, userId),
    });

    if (!getUser) {
      return null;
    }

    return getUser;
  }),
});
