import { env } from "@/env/server";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });
