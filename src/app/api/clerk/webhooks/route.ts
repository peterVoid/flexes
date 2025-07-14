import {
  createUser,
  deleteUser,
  updateUser,
} from "@/features/auth/server/actions";
import { getQueryClient, trpc } from "@/trpc/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { env } from "@/env/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const data = evt.data;
        const emailAddress = data.email_addresses[0].email_address;

        if (eventType === "user.created") {
          const createdUser = await createUser({
            clerkId: data.id,
            email: emailAddress,
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url,
          });

          await clerkClient.users.updateUserMetadata(data.id, {
            publicMetadata: {
              role: "user",
              userId: createdUser.data?.id as string,
            },
          });

          console.log("✅ User created");

          const queryClient = getQueryClient();
          queryClient.invalidateQueries(trpc.auth.session.queryFilter());

          break;
        } else {
          await updateUser({
            clerkId: data.id,
            email: emailAddress,
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url,
            role: data.public_metadata.role,
          });

          await clerkClient.users.updateUserMetadata(data.id, {
            publicMetadata: {
              role: data.public_metadata.role,
              userId: data.public_metadata.userId,
            },
          });

          console.log("✅ User updated");

          const queryClient = getQueryClient();
          queryClient.invalidateQueries(trpc.auth.session.queryFilter());

          break;
        }
      }
      case "user.deleted": {
        const data = evt.data;
        const clerkId = data.id;

        await deleteUser(clerkId);

        console.log("✅ User deleted");

        const queryClient = getQueryClient();
        queryClient.invalidateQueries(trpc.auth.session.queryFilter());

        break;
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
