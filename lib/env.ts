import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    ALLOWED_USER_IDS: z.string().default("269627500211077120"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    // クライアント側で必要な環境変数があればここに追加
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ALLOWED_USER_IDS: process.env.ALLOWED_USER_IDS,
    NODE_ENV: process.env.NODE_ENV,
  },
})
