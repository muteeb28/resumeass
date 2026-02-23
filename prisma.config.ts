import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  // Only one datasource property, no nested object
  datasource: {
    url: process.env.DATABASE_URL,
    // Optional: shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
