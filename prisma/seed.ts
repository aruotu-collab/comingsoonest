import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { changeEvents } from "../src/data/seed";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.alertLog.deleteMany();
  await prisma.changeEvent.deleteMany();

  for (const event of changeEvents) {
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

  console.log(`Seeded ${changeEvents.length} change events`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
