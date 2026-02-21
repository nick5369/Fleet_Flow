require("dotenv").config();
const prisma = require("../lib/prisma");

const vehicles = [
  {
    licensePlate: "GJ-01-AB-1234",
    vehicleType: "TRUCK",
    make: "Tata",
    model: "Prima 4028.S",
    year: 2023,
    vin: "1HGCM82633A00401",
    maxLoadKg: 28000,
    odometerKm: 45200.5,
    acquisitionCost: 3200000,
    acquisitionDate: new Date("2023-03-15"),
  },
  {
    licensePlate: "MH-12-CD-5678",
    vehicleType: "TRUCK",
    make: "Ashok Leyland",
    model: "BOSS 1920HB",
    year: 2022,
    vin: "2T1KR32E95C43210",
    maxLoadKg: 19000,
    odometerKm: 78300,
    acquisitionCost: 2750000,
    acquisitionDate: new Date("2022-08-10"),
  },
  {
    licensePlate: "DL-05-EF-9012",
    vehicleType: "VAN",
    make: "Mahindra",
    model: "Supro Profit Truck",
    year: 2024,
    vin: "3VWFE21C04M00098",
    maxLoadKg: 1000,
    odometerKm: 12450.75,
    acquisitionCost: 750000,
    acquisitionDate: new Date("2024-01-20"),
  },
  {
    licensePlate: "KA-03-GH-3456",
    vehicleType: "VAN",
    make: "Tata",
    model: "Ace Gold",
    year: 2024,
    vin: "5YJSA1E26HF19876",
    maxLoadKg: 750,
    odometerKm: 8900,
    acquisitionCost: 480000,
    acquisitionDate: new Date("2024-06-05"),
  },
  {
    licensePlate: "TN-07-IJ-7890",
    vehicleType: "BIKE",
    make: "Bajaj",
    model: "Maxima C",
    year: 2025,
    vin: null,
    maxLoadKg: 500,
    odometerKm: 3200,
    acquisitionCost: 320000,
    acquisitionDate: new Date("2025-02-14"),
  },
  {
    licensePlate: "RJ-14-KL-2345",
    vehicleType: "TRUCK",
    make: "BharatBenz",
    model: "1617R",
    year: 2021,
    vin: "WVWZZZ3CZ9E56789",
    status: "IN_SHOP",
    maxLoadKg: 16200,
    odometerKm: 125600,
    acquisitionCost: 2900000,
    acquisitionDate: new Date("2021-11-30"),
  },
  {
    licensePlate: "UP-32-MN-6789",
    vehicleType: "VAN",
    make: "Maruti Suzuki",
    model: "Super Carry",
    year: 2023,
    vin: "JN1TBNT30Z000042",
    status: "ON_TRIP",
    maxLoadKg: 740,
    odometerKm: 34500,
    acquisitionCost: 550000,
    acquisitionDate: new Date("2023-09-01"),
  },
  {
    licensePlate: "GJ-05-OP-1122",
    vehicleType: "TRUCK",
    make: "Eicher",
    model: "Pro 3019",
    year: 2020,
    vin: "1FTFW1ET5DFC1234",
    status: "RETIRED",
    maxLoadKg: 18700,
    odometerKm: 298000,
    acquisitionCost: 2450000,
    acquisitionDate: new Date("2020-04-22"),
  },
  {
    licensePlate: "MH-04-QR-3344",
    vehicleType: "BIKE",
    make: "Piaggio",
    model: "Ape Xtra DLX",
    year: 2025,
    vin: null,
    maxLoadKg: 450,
    odometerKm: 1500,
    acquisitionCost: 285000,
    acquisitionDate: new Date("2025-07-10"),
  },
  {
    licensePlate: "KA-01-ST-5566",
    vehicleType: "TRUCK",
    make: "Volvo",
    model: "FM 380",
    year: 2022,
    vin: "YV1RS592X52123456",
    maxLoadKg: 35000,
    odometerKm: 67800,
    acquisitionCost: 5500000,
    acquisitionDate: new Date("2022-12-18"),
  },
];

async function seed() {
  console.log("Seeding vehicles...\n");

  let created = 0;
  let skipped = 0;

  for (const v of vehicles) {
    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate: v.licensePlate },
    });

    if (existing) {
      console.log(`  SKIP  ${v.licensePlate} (already exists)`);
      skipped++;
      continue;
    }

    const vehicle = await prisma.vehicle.create({ data: v });
    console.log(
      `  ✅  ${vehicle.licensePlate}  ${vehicle.vehicleType}  ${vehicle.make} ${vehicle.model}  [${vehicle.status}]`,
    );
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Vehicle seed failed:", err);
  process.exit(1);
});
