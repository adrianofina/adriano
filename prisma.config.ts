import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccessFeatures: {
    driverAdapters: true,
  },
  schema: {
    url: process.env.DATABASE_URL,
  },
})