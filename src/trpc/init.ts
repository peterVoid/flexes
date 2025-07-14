import { db } from "@/db";
import { UsersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ next }) => {
  const { userId, isAuthenticated } = await auth();

  if (!userId && !isAuthenticated) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User nof found",
    });
  }

  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkId, userId),
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User nof found",
    });
  }

  return next({ ctx: { user } });
});
