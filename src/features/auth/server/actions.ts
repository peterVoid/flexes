"use server";

import { db } from "@/db";
import { UserRoles, UsersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  clerkId: string;
  name: string;
  imageUrl?: string;
  email: string;
  role?: UserRoles;
}

export async function createUser({ clerkId, email, name, imageUrl }: Props) {
  const existingUser = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkId, clerkId),
  });

  if (existingUser) {
    return { error: true, message: "User already exist" };
  }

  const [createdUser] = await db
    .insert(UsersTable)
    .values({
      clerkId,
      email,
      imageUrl,
      name,
    })
    .returning();

  if (!createdUser) {
    return { error: true, message: "Something went wrong" };
  }

  return { error: false, data: createdUser };
}

export async function updateUser({
  clerkId,
  email,
  name,
  imageUrl,
  role = "user",
}: Props) {
  const existingUser = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkId, clerkId),
  });

  if (!existingUser) {
    return { error: true, message: "User does not exist" };
  }

  const updatedUser = await db
    .update(UsersTable)
    .set({
      clerkId,
      email,
      imageUrl,
      name,
      role,
    })
    .where(eq(UsersTable.clerkId, clerkId));

  if (!updatedUser) {
    return { error: true, message: "Something went wrong" };
  }

  return updatedUser;
}

export async function deleteUser(clerkId?: string) {
  if (clerkId == null) return null;

  const existingUser = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkId, clerkId),
  });

  if (!existingUser) {
    return { error: true, message: "User does not exist" };
  }

  const deletedUser = await db
    .delete(UsersTable)
    .where(eq(UsersTable.clerkId, clerkId));

  if (!deletedUser) {
    return { error: true, message: "Something went wrong" };
  }

  return deletedUser;
}
