require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function seed() {
  const email = "manager@fleetflow.com";
  const plainPassword = "Test@1234";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Test user already exists:", email);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Test Manager",
      role: "MANAGER",
      isActive: true,
    },
  });

  console.log("Test user created:");
  console.log("  Email:    " + user.email);
  console.log("  Password: " + plainPassword);
  console.log("  Role:     " + user.role);
  console.log("  ID:       " + user.id);

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
