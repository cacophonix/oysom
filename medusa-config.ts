import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Helper to validate worker mode
const getWorkerMode = (): "server" | "shared" | "worker" | undefined => {
  const mode = process.env.MEDUSA_WORKER_MODE;
  if (!mode) return undefined;
  if (mode === "server" || mode === "shared" || mode === "worker") {
    return mode;
  }
  return undefined;
};

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: getWorkerMode(),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  }
})