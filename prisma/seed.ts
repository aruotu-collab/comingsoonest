import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getChangeEvents } from "../src/lib/repo";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.alertLog.deleteMany();
  await prisma.changeEvent.deleteMany();

  const events = getChangeEvents();
  for (const event of events) {
    await prisma.changeEvent.create({
      data: {
        id: event.id,
        at: new Date(event.at),
        type: event.type,
        launchId: event.launchId,
        brandId: event.brandId,
        message: event.message,
        bucket: event.bucket,
      },
    });
  }

  console.log(`Seeded ${events.length} change events from live catalogue`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
