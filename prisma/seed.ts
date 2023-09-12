import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { generateFid } from "~/models/invoice.server";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.invoice.deleteMany({});

  await prisma.invoice.create({
    data: {
      userId: user.id,
      fid: await generateFid(),
      billFromStreet: faker.location.streetAddress(),
      billFromCity: faker.location.city(),
      billFromPostCode: faker.location.zipCode(),
      billFromCountry: faker.location.country(),
      clientName: faker.person.fullName(),
      clientEmail: faker.internet.email(),
      billToStreet: faker.location.streetAddress(),
      billToCity: faker.location.city(),
      billToPostCode: faker.location.zipCode(),
      billToCountry: faker.location.country(),
      invoiceDate: faker.date.past().toDateString(),
      paymentTermId: "net-30",
      projectDescription: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(["draft", "pending", "paid"]),
      items: {
        create: [
          { name: faker.commerce.productName(), quantity: 1, price: 100 },
        ],
      },
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
