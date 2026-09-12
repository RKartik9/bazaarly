import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const port = Number(process.env.DEV_DB_PORT ?? 27017);
const dbPath = ".mongo-data";

async function main() {
  mkdirSync(dbPath, { recursive: true });
  const server = await MongoMemoryServer.create({
    instance: { port, dbPath, storageEngine: "wiredTiger", dbName: "bazaarly" },
  });

  console.log(`Local MongoDB running at ${server.getUri()}bazaarly`);
  console.log(`Data persists in ./${dbPath}. Press Ctrl+C to stop.`);

  const shutdown = async () => {
    await server.stop({ doCleanup: false });
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
