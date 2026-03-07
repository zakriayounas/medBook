// const { PrismaClient } = require("@prisma/client");
// const { faker } = require("@faker-js/faker");
// const bcrypt = require("bcrypt");
// const { getRandomColor } = require("../utils/helpers");

// const prisma = new PrismaClient();

// const specialties = [
//   "GeneralPhysician",
//   "Gynecologist",
//   "Dermatologist",
//   "Pediatrician",
//   "Neurologist",
//   "Gastroenterologist",
//   "Psychologist",
//   "Cardiologist",
//   "OrthopedicSurgeon",
// ];

// const cities = [
//   "Karachi",
//   "Lahore",
//   "Islamabad",
//   "Rawalpindi",
//   "Faisalabad",
//   "Multan",
//   "Peshawar",
//   "Quetta",
//   "Sialkot",
//   "Hyderabad",
// ];

// function getRandom(arr) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// async function main() {
//   const hashedPassword = await bcrypt.hash("doctor123", 10);

//   for (let i = 1; i <= 100; i++) {
//     const gender = faker.helpers.arrayElement(["MALE", "FEMALE"]);
//     const specialty = faker.helpers.arrayElement(specialties);

//     const firstName =
//       gender === "MALE"
//         ? faker.person.firstName("male")
//         : faker.person.firstName("female");

//     const lastName = faker.person.lastName();
//     const fullName = `Dr. ${firstName} ${lastName}`;
//     const profileColor = getRandomColor();

//     // 1️⃣ Create User
//     const user = await prisma.users.create({
//       data: {
//         name: fullName,
//         email: `doctor${i}_${faker.string.alphanumeric(5)}@gmail.com`,
//         password: hashedPassword,
//         profileColor,
//         role: "DOCTOR",
//         gender,
//       },
//     });

//     // 2️⃣ Create Doctor linked to user
//     await prisma.doctors.create({
//       data: {
//         specialty,
//         degree: "MBBS",
//         experience: faker.number.int({ min: 1, max: 25 }),
//         fee: faker.number.int({ min: 35, max: 70 }),
//         about: faker.lorem.paragraph(),
//         isActive: true,
//         userId: user.id,
//       },
//     });

//     console.log(`✅ Created doctor ${i}`);
//   }

//   console.log("🎉 100 doctors inserted successfully");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });const { PrismaClient } = require("@prisma/client");

// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// const specialtyDomainMap = {
//   GeneralPhysician: "general.prescripto.com",
//   Gynecologist: "gynecology.prescripto.com",
//   Dermatologist: "dermatology.prescripto.com",
//   Pediatrician: "pediatrics.prescripto.com",
//   Neurologist: "neurology.prescripto.com",
//   Gastroenterologist: "gastro.prescripto.com",
//   Psychologist: "psychology.prescripto.com",
//   Cardiologist: "cardiology.prescripto.com",
//   OrthopedicSurgeon: "orthopedics.prescripto.com",
// };

// const specialtyDegrees = {
//   GeneralPhysician: "MBBS",
//   Gynecologist: "MBBS, MCPS (Gynecology)",
//   Dermatologist: "MBBS, D.Derm",
//   Pediatrician: "MBBS, DCH",
//   Neurologist: "MBBS, FCPS (Neurology)",
//   Gastroenterologist: "MBBS, FCPS (Gastroenterology)",
//   Psychologist: "BS Psychology, MS Clinical Psychology",
//   Cardiologist: "MBBS, FCPS (Cardiology)",
//   OrthopedicSurgeon: "MBBS, MS (Orthopedics)",
// };

// const aboutTexts = {
//   GeneralPhysician: (firstName, lastName) =>
//     `${firstName} ${lastName} is dedicated to providing general health care with a focus on preventive medicine and patient well-being.`,
//   Gynecologist: (firstName, lastName) =>
//     `${firstName} ${lastName} specializes in women's health, offering personalized care for pregnancy, reproductive health, and wellness.`,
//   Dermatologist: (firstName, lastName) =>
//     `${firstName} ${lastName} is an expert in treating skin conditions and providing cosmetic solutions with care and innovation.`,
//   Pediatrician: (firstName, lastName) =>
//     `${firstName} ${lastName} focuses on child health, growth, and development, ensuring comprehensive pediatric care.`,
//   Neurologist: (firstName, lastName) =>
//     `${firstName} ${lastName} provides advanced neurological care for disorders of the brain, spine, and nerves.`,
//   Gastroenterologist: (firstName, lastName) =>
//     `${firstName} ${lastName} specializes in digestive system health, diagnosing and treating gastrointestinal conditions.`,
//   Psychologist: (firstName, lastName) =>
//     `${firstName} ${lastName} offers psychological support, counseling, and therapy for mental well-being.`,
//   Cardiologist: (firstName, lastName) =>
//     `${firstName} ${lastName} treats heart conditions and focuses on cardiac health and preventive cardiology.`,
//   OrthopedicSurgeon: (firstName, lastName) =>
//     `${firstName} ${lastName} provides surgical and non-surgical treatments for musculoskeletal conditions.`,
// };

// function generateEmail(name, specialty) {
//   const cleanName = name.replace("Dr.", "").trim();
//   const parts = cleanName.split(" ");
//   const firstName = parts[0]?.toLowerCase() || "doctor";
//   const lastName = parts[1]?.toLowerCase() || "user";
//   const domain = specialtyDomainMap[specialty] || "prescripto.com";
//   return `${firstName}.${lastName}@${domain}`;
// }

// async function main() {
//   const doctors = await prisma.doctors.findMany({
//     include: {
//       profile: true, // adjust relation if different
//     },
//   });

//   for (const doctor of doctors) {
//     const user = await prisma.users.findUnique({
//       where: { id: doctor.userId },
//     });
//     if (!user) continue;

//     const cleanName = user.name.replace("Dr.", "").trim();
//     const parts = cleanName.split(" ");
//     const firstName = parts[0] || "Doctor";
//     const lastName = parts[1] || "User";

//     // Generate email
//     let newEmail = generateEmail(user.name, doctor.specialty);

//     // Prevent duplicates
//     let counter = 1;
//     while (true) {
//       const existing = await prisma.users.findUnique({
//         where: { email: newEmail },
//       });
//       if (!existing || existing.id === user.id) break;
//       newEmail = newEmail.replace("@", `${counter}@`);
//       counter++;
//     }

//     // Generate dynamic degree and about
//     const newDegree = specialtyDegrees[doctor.specialty] || "MBBS";
//     const newAbout = aboutTexts[doctor.specialty]
//       ? aboutTexts[doctor.specialty](firstName, lastName)
//       : `${firstName} ${lastName} is a skilled doctor providing exceptional care.`;

//     // Update user email and doctor fields
//     await prisma.users.update({
//       where: { id: user.id },
//       data: { email: newEmail },
//     });

//     await prisma.doctors.update({
//       where: { id: doctor.id },
//       data: {
//         degree: newDegree,
//         about: newAbout,
//       },
//     });

//     console.log(
//       `✅ Updated: ${user.name} → Email: ${newEmail}, Degree: ${newDegree}`
//     );
//   }

//   console.log("🎉 All doctors updated successfully with email, degree, and about!");
// }

// main()
//   .catch(console.error)
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { getRandomColor } = require("../utils/helpers");

const adminUsers = [
  {
    name: "Admin User",
    email: "admin@prescripto.com",
    password: "admin123",
  },
  {
    name: "Ahmad Ali",
    email: "ahmad.ali.admin@prescripto.com",
    password: "ahmad123",
  },
  {
    name: "Ali Imran",
    email: "ali.imran.admin@prescripto.com",
    password: "ali123",
  },
  {
    name: "Naveed Latif",
    email: "naveed.latif.admin@prescripto.com",
    password: "naveed123",
  },
];

async function main() {
  console.log("🚀 Starting admin user seeding...\n");

  for (const user of adminUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const profileColor = getRandomColor();
    await prisma.users.deleteMany({ where: { email: user.email } }); // Clean up existing user with same email
    await prisma.users.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: "ADMIN",
        profileColor,
      },
    });

    console.log(`✅ Admin created: ${user.name} (${user.email}) password: ${user.password}`); // Log the password for reference (in real scenarios, avoid logging passwords)
  }

  console.log("\n🎉 Admin users seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });