export {};

// Here we declare the members of the process.env object, so that we
// can use them in our application code in a type-safe manner.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number;
      REDIS_HOST: string;
      REDIS_PORT: number;
      POOL_DURATION: number;
      JWT_SECRET: string;
    }
  }
}
