/**
 * PRISMA SHIM
 * This file is a temporary shim to prevent the server from crashing 
 * due to missing generated Prisma client files.
 * 
 * We are transitioning to direct SQL queries via server/db/db.js (pg Pool).
 */

const prismaMock = new Proxy({}, {
  get: (target, prop) => {
    return new Proxy(() => { }, {
      get: (t, p) => {
        // Return a function that logs a warning
        return () => {
          console.warn(`⚠️ Prisma call intercepted: prisma.${prop}.${p}. Transition to direct SQL query.`);
          throw new Error(`Prisma client not generated. Use direct SQL instead of prisma.${prop}.${p}.`);
        };
      },
      apply: (t, thisArg, argumentsList) => {
        console.warn(`⚠️ Prisma call intercepted: prisma.${prop}(). Transition to direct SQL query.`);
        throw new Error(`Prisma client not generated. Use direct SQL instead of prisma.${prop}().`);
      }
    });
  }
});

export default prismaMock;
