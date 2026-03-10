// const { PrismaClient } = require("@prisma/client");
// const { faker } = require("@faker-js/faker");
// const bcrypt = require("bcrypt");
// const { getRandomColor } = require("../utils/helpers");

// const prisma = new PrismaClient();

const aboutTexts = {
  GeneralPhysician: (name) => `
${name} is a dedicated General Physician with extensive experience in providing comprehensive primary healthcare to patients of all age groups. With a strong commitment to preventive medicine and long-term wellness, ${name} focuses on identifying health concerns early and guiding patients toward healthier lifestyles. Over the years, ${name} has successfully managed a wide variety of medical conditions including infections, metabolic disorders, chronic illnesses, and general health concerns.

${name} believes that effective healthcare begins with building trust and understanding each patient’s medical history, lifestyle habits, and personal health goals. Every consultation is approached with patience and attention to detail to ensure accurate diagnosis and effective treatment planning. By combining modern medical knowledge with compassionate care, ${name} ensures that patients receive treatment plans tailored to their specific needs.

Preventive healthcare is a core part of ${name}'s philosophy. Regular health screenings, vaccination programs, nutritional guidance, and lifestyle counseling are integrated into routine consultations to promote long-term well-being. Patients value the clear explanations and practical recommendations provided during visits, which help them actively participate in managing their own health.

${name} continuously stays updated with advancements in general medicine and clinical practices to deliver safe, effective, and reliable medical care to the community.
`,

  Gynecologist: (name) => `
${name} is an experienced Gynecologist dedicated to providing compassionate and comprehensive healthcare for women. With extensive knowledge in reproductive medicine and obstetrics, ${name} offers personalized care for women at every stage of life. From routine gynecological examinations to pregnancy care and management of reproductive health conditions, ${name} focuses on ensuring comfort, safety, and well-being for every patient.

${name} has significant experience in managing pregnancy, prenatal care, menstrual disorders, hormonal imbalances, fertility concerns, and menopause-related health issues. By combining modern medical practices with a patient-centered approach, ${name} creates individualized treatment plans that address the specific needs and health goals of each patient.

Patient education is a key part of ${name}'s practice. During consultations, time is taken to explain medical conditions, preventive care strategies, and treatment options clearly so patients can make informed decisions regarding their health. Preventive screenings and early detection of reproductive health issues are also strongly emphasized.

${name} remains committed to staying informed about the latest developments in gynecology and women’s healthcare. Through dedication, empathy, and professionalism, ${name} strives to provide safe, respectful, and high-quality care to every patient.
`,

  Dermatologist: (name) => `
${name} is a skilled Dermatologist specializing in the diagnosis and treatment of various skin, hair, and nail conditions. With years of clinical experience and a passion for dermatological health, ${name} provides personalized care to patients dealing with both medical and cosmetic skin concerns. Common conditions treated include acne, eczema, psoriasis, fungal infections, and other dermatological disorders.

${name} believes that healthy skin is essential to overall well-being and confidence. Each patient receives a thorough skin evaluation to identify underlying issues and determine the most effective treatment approach. By considering lifestyle factors, skin type, and medical history, ${name} develops customized care plans for long-term skin health.

In addition to treating medical conditions, ${name} also advises patients on skincare routines, preventive treatments, and cosmetic dermatology procedures that improve skin appearance and health. Modern techniques and evidence-based treatments are used to ensure safety and effective results.

${name} continues to stay updated with advancements in dermatological research and technology. Patients appreciate the professional yet approachable consultation style that helps them feel comfortable discussing their concerns and achieving healthier skin.
`,

  Pediatrician: (name) => `
${name} is a compassionate Pediatrician dedicated to providing high-quality healthcare for infants, children, and adolescents. With extensive experience in pediatric medicine, ${name} focuses on promoting healthy growth, development, and preventive care during every stage of childhood.

Routine health checkups, immunizations, and developmental monitoring are essential parts of ${name}'s approach to pediatric care. Parents are guided on nutrition, hygiene, and healthy lifestyle practices to ensure their children grow up healthy and strong. ${name} also provides treatment for a wide range of childhood illnesses including respiratory infections, allergies, digestive issues, and common pediatric conditions.

Creating a comfortable and friendly environment for children is one of ${name}'s priorities. Young patients are treated with patience and kindness so they feel relaxed during consultations and medical examinations.

${name} believes in partnering with parents to ensure the best health outcomes for their children. By combining medical expertise with compassionate communication, ${name} strives to support families in raising healthy and happy children.
`,

  Neurologist: (name) => `
${name} is a highly trained Neurologist specializing in the diagnosis and treatment of disorders affecting the brain, spinal cord, and nervous system. With a deep understanding of neurological conditions, ${name} provides comprehensive care for patients experiencing headaches, migraines, epilepsy, stroke-related complications, nerve disorders, and movement disorders.

Every patient undergoes a thorough neurological assessment to accurately identify the cause of symptoms and determine the most effective treatment plan. ${name} combines clinical expertise with advanced diagnostic methods to manage complex neurological conditions with precision and care.

Patient education plays a crucial role in treatment, and ${name} takes time to explain neurological conditions in simple terms so patients can understand their diagnosis and treatment options. Lifestyle modifications and long-term monitoring are often incorporated into treatment strategies.

${name} stays up to date with the latest neurological research and medical technologies to provide effective and evidence-based care. Through professionalism and dedication, ${name} helps patients improve their neurological health and overall quality of life.
`,

  Gastroenterologist: (name) => `
${name} is an experienced Gastroenterologist specializing in the diagnosis and treatment of digestive system disorders. With extensive training in gastrointestinal medicine, ${name} provides expert care for conditions affecting the stomach, intestines, liver, pancreas, and digestive tract.

Patients often seek ${name}'s expertise for issues such as acid reflux, irritable bowel syndrome, digestive discomfort, liver diseases, and nutritional absorption disorders. Each case is carefully evaluated through detailed consultations and appropriate diagnostic procedures to ensure accurate treatment.

${name} believes that digestive health plays a vital role in overall wellness. Treatment plans frequently include dietary guidance, lifestyle adjustments, and medical therapy to help patients manage their conditions effectively.

${name} is dedicated to delivering patient-centered care and maintaining clear communication throughout the treatment process. By staying updated with advancements in gastroenterology, ${name} ensures that patients receive safe, modern, and effective digestive healthcare.
`,

  Psychologist: (name) => `
${name} is a professional Psychologist committed to supporting individuals in achieving better mental health and emotional well-being. With experience in psychological counseling and therapy, ${name} helps patients navigate challenges such as stress, anxiety, depression, relationship issues, and personal development concerns.

Each therapy session is conducted in a safe and confidential environment where patients can openly discuss their thoughts and feelings. ${name} uses evidence-based therapeutic techniques to help individuals understand their emotions, build resilience, and develop healthier coping strategies.

The approach to therapy is personalized and focused on the unique needs of each individual. Through active listening, structured therapy sessions, and supportive guidance, ${name} helps patients gain clarity and confidence in managing life’s challenges.

${name} remains committed to ongoing learning in the field of psychology to provide modern and effective mental health support. The goal is to empower patients to improve their emotional health and lead more balanced and fulfilling lives.
`,

  Cardiologist: (name) => `
${name} is a dedicated Cardiologist specializing in the prevention, diagnosis, and treatment of heart-related conditions. With extensive experience in cardiovascular medicine, ${name} provides expert care for patients dealing with hypertension, heart disease, arrhythmias, and other cardiac disorders.

A strong emphasis is placed on preventive cardiology. ${name} works closely with patients to identify risk factors such as high cholesterol, lifestyle habits, and family history that may contribute to heart disease. Personalized treatment plans often include medication management, lifestyle changes, and regular monitoring.

${name} believes that patient education is key to maintaining heart health. During consultations, detailed guidance is provided on nutrition, exercise, stress management, and heart-healthy habits.

${name} continues to stay updated with advancements in cardiovascular medicine to deliver effective and modern treatment options. Through dedication and patient-focused care, ${name} aims to help individuals maintain a strong and healthy heart.
`,

  OrthopedicSurgeon: (name) => `
${name} is an experienced Orthopedic Surgeon specializing in the diagnosis and treatment of musculoskeletal conditions affecting bones, joints, muscles, and ligaments. With years of surgical and clinical experience, ${name} provides comprehensive care for patients dealing with injuries, joint disorders, and chronic orthopedic conditions.

Common conditions treated include fractures, arthritis, joint pain, sports injuries, and spinal issues. ${name} evaluates each patient carefully to determine whether surgical or non-surgical treatments will provide the best results.

When surgery is required, modern orthopedic techniques and advanced medical technology are used to ensure safe procedures and faster recovery. Rehabilitation and physiotherapy guidance are also provided to help patients regain strength and mobility after treatment.

${name} is dedicated to helping patients restore movement, reduce pain, and return to their daily activities as quickly and safely as possible. Through expertise, precision, and patient-focused care, ${name} continues to improve the quality of life for individuals with orthopedic conditions.
`,
};

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
//       ? aboutTexts[doctor.specialty](name)
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

// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// const bcrypt = require("bcrypt");
// const { getRandomColor } = require("../utils/helpers");

// const adminUsers = [
//   {
//     name: "Admin User",
//     email: "admin@prescripto.com",
//     password: "admin123",
//   },
//   {
//     name: "Ahmad Ali",
//     email: "ahmad.ali.admin@prescripto.com",
//     password: "ahmad123",
//   },
//   {
//     name: "Ali Imran",
//     email: "ali.imran.admin@prescripto.com",
//     password: "ali123",
//   },
//   {
//     name: "Naveed Latif",
//     email: "naveed.latif.admin@prescripto.com",
//     password: "naveed123",
//   },
// ];

// async function main() {
//   console.log("🚀 Starting admin user seeding...\n");

//   for (const user of adminUsers) {
//     const hashedPassword = await bcrypt.hash(user.password, 10);
//     const profileColor = getRandomColor();
//     await prisma.users.deleteMany({ where: { email: user.email } }); // Clean up existing user with same email
//     await prisma.users.create({
//       data: {
//         email: user.email,
//         name: user.name,
//         password: hashedPassword,
//         role: "ADMIN",
//         profileColor,
//       },
//     });

//     console.log(`✅ Admin created: ${user.name} (${user.email}) password: ${user.password}`); // Log the password for reference (in real scenarios, avoid logging passwords)
//   }

//   console.log("\n🎉 Admin users seeded successfully!");
// }

// main()
//   .catch((error) => {
//     console.error("❌ Seeding failed:", error);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cities
const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Hyderabad",
];

// helper
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// address generator
function generateAddress() {
  return {
    line1: `Street ${Math.floor(Math.random() * 100) + 1}`,
    line2: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
    city: getRandom(cities),
    state: "Punjab",
    postalCode: String(30000 + Math.floor(Math.random() * 9999)),
    country: "Pakistan",
  };
}

async function main() {
  const doctors = await prisma.doctors.findMany();

  for (const doctor of doctors) {
    const user = await prisma.users.findUnique({
      where: { id: doctor.userId },
    });

    if (!user) continue;

    // generate two addresses
    const newAddresses = [generateAddress(), generateAddress()];

    await prisma.users.update({
      where: { id: user.id },
      data: {
        addresses: newAddresses, // if JSON column
      },
    });

    console.log(`✅ Updated: ${user.name}`);
  }

  console.log("🎉 All doctors updated with addresses!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// async function main() {
//   const doctors = await prisma.doctors.findMany({
//     select: {
//       id: true,
//       specialty: true,
//       profile: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });

//   for (const doctor of doctors) {
//     const { id, specialty, profile } = doctor
//     const about =
//       aboutTexts[specialty]?.(profile?.name) ||
//       `Dr. ${profile?.name} is a skilled doctor providing exceptional care.`;
//     await prisma.doctors.update({
//       where: { id },
//       data: {
//         about,
//       },
//     });

//     console.log(`✅ Updated: ${profile?.name}`);
//   }

//   console.log("🎉 All doctors updated with about!");
// }

// main()
//   .catch(console.error)
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
