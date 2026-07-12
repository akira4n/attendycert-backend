const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");

async function main() {
  console.log("Memulai proses seeding database...");

  const emailAdmin = "admin@company.com";
  const passwordPlain = "password123";
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  const superAdmin = await prisma.admin.upsert({
    where: { email: emailAdmin },
    update: {},
    create: {
      name: "Super Admin",
      email: emailAdmin,
      password: hashedPassword,
    },
  });

  console.log("Seeding berhasil!");
  console.log(`Email: ${superAdmin.email}`);
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
