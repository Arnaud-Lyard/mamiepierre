import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  /* Reset the database */

  await prisma.user.deleteMany();

  /* Seed the database */

  /* Users */
  const alice = await prisma.user.upsert({
    where: { id: '1a751e3a-8884-4f29-98d7-81d3f5cbc712' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@prisma.io',
      verified: true,
      password: 'alicepassword',
      role: 'admin',
      verificationCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetAt: null,
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: '486eb3da-ffb3-40f0-91a3-11f7b19a6a39' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@prisma.io',
      password: 'bobpassword',
      role: 'user',
      verificationCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetAt: null,
    },
  });

  const john = await prisma.user.upsert({
    where: { id: 'e3386a0b-703a-49bd-a600-532ddd2221e1' },
    update: {},
    create: {
      username: 'john',
      email: 'john@prisma.io',
      password: 'johnpassword',
      role: 'user',
      verificationCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetAt: null,
    },
  });

  const mat = await prisma.user.upsert({
    where: { id: '9035c9e7-9c88-4595-96a0-b2e5064a36f5' },
    update: {},
    create: {
      username: 'mat',
      email: 'mat@prisma.io',
      password: 'matpassword',
      role: 'user',
      verificationCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetAt: null,
    },
  });

  const user = await prisma.user.upsert({
    where: { id: '1a751e3a-8884-4f29-98d7-81d3f5cbc713' },
    update: {},
    create: {
      username: 'user',
      email: 'user@prisma.io',
      verified: true,
      password: 'userpassword',
      role: 'user',
      verificationCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetAt: null,
    },
  });

  const admin = await prisma.user.upsert({
    where: { id: 'b3aca0e8-0be4-4ad0-bc3f-c3ca72c1f5b3' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@prisma.io',
      verified: true,
      password: 'adminpassword',
      role: 'admin',
      verificationCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null,
      passwordResetAt: null,
    },
  });

  console.log({ alice, bob, john, mat, user, admin });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
